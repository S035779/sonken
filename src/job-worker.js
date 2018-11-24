import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import * as R           from 'ramda';
import { forkJoin, from, throwError }   from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import async            from 'async';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import Yahoo            from 'Routes/Yahoo/Yahoo';
import log              from 'Utilities/logutils';
import aws              from 'Utilities/awsutils';
import job              from 'Utilities/jobutils';
import fss              from 'Utilities/fssutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw config.error();

const node_env        = process.env.NODE_ENV    || 'development';
const workerName      = process.env.WORKER_NAME || 'empty';
const CACHE           = process.env.CACHE;
const AWS_ACCESS_KEY  = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY  = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const aws_keyset      = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };
process.env.NODE_PENDING_DEPRECATION = 0;

const displayName = `[WRK] (${process.pid})`;

if (node_env === 'development') {
  log.config('console', 'color', 'job-worker', 'TRACE');
} else
if (node_env === 'staging') {
  log.config('file', 'basic', 'job-worker', 'DEBUG');
} else
if (node_env === 'production') {
  log.config('file', 'json', 'job-worker', 'INFO');
}

const request = (operation, options) => {
  const yahoo = Yahoo.of();
  const feed  = FeedParser.of();
  switch(operation) {
    case 'marchant':
    case 'sellers':
      {
        const { url, user, id, skip, limit } = options;
        const conditions = { url, skip, limit };
        return yahoo.jobHtml(conditions).pipe( 
            map(obj => ({ items: obj.item }))
          , flatMap(obj => feed.updateHtml({ user, id, html: obj }))
          );
      }
    case 'closedmarchant':
      {
        const { url, user, id, skip, limit } = options;
        const conditions = { url, skip, limit };
        return yahoo.jobClosedMerchant(conditions).pipe(
            map(obj => ({ items: obj.item }))
          , flatMap(obj => feed.updateHtml({ user, id, html: obj }))
          );
      }
    case 'closedsellers':
      {
        const { url, user, id, skip, limit } = options;
        const conditions = { url, skip, limit };
        return yahoo.jobClosedSellers(conditions).pipe(
            map(obj => ({ items: obj.item }))
          , flatMap(obj => feed.updateHtml({ user, id, html: obj }))
          );
      }
    //case 'rss':
    //  {
    //    const { url, user, id } = options;
    //    const putRss  = obj => feed.updateRss({ user, id, rss: obj });
    //    const conditions = { url };
    //    return yahoo.jobRss(conditions).pipe(
    //        map(obj => ({ items: obj.item }))
    //      , flatMap(putRss)
    //      );
    //  }
    case 'images':
      {
        const { user, id } = options;
        const conditions = { user, id };
        const operator = (storage, filename) => aws.of(aws_keyset).createWriteStream(storage, filename);
        const setAttribute = obj => ({ user, id: obj.guid__, data: { images: obj.images } });
        const observable = obj => feed.createAttribute(setAttribute(obj));
        return feed.fetchJobNote(conditions).pipe(
            flatMap(obj => yahoo.jobImages({ items: obj.items, operator }))
          , flatMap(obj => from(observable(obj)))
          );
      }
    //case 'archives':
    //  {
    //    const { user, id } = options;
    //    const conditions = { user, id };
    //    const setAttribute = obj => ({ user, id: obj.guid__, data: { archive: obj.archive } });
    //    const observable = obj => feed.createAttribute(setAttribute(obj));
    //    return feed.fetchJobNote(conditions).pipe(
    //        flatMap(obj => feed.createArchives(obj))
    //      , flatMap(obj => from(observable(obj)))
    //      );
    //  }
    case 'attribute':
      {
        const { user, id } = options;
        const conditions = { user, id };
        const setAttribute = obj => ({ user, id: obj.guid__, data: { sale: obj.sale, sold: obj.sold, market: obj.market } });
        const observables = R.map(obj => feed.createAttribute(setAttribute(obj)));
        return feed.fetchJobNote(conditions).pipe(
            flatMap(obj => yahoo.jobAttribute(obj))
          , flatMap(objs => forkJoin(observables(objs)))
          );
      }
    case 'itemsearch':
      {
        const { user, id } = options;
        const conditions = { user, id };
        const setAttribute = obj => ({ user, id: obj.guid__, data: { asins: obj.asins } });
        const observables = R.map(obj => feed.createAttribute(setAttribute(obj)));
        return feed.fetchJobNote(conditions).pipe(
            flatMap(obj => yahoo.jobItemSearch(obj))
          , flatMap(objs => forkJoin(observables(objs)))
          );
      }
    case 'defrag':
      {
        const { user, id } = options;
        const conditions = { user, id };
        return feed.garbageCollection(conditions);
      }
    case 'download/items':
      {
        const { params } = options;
        const { user, category, ids, filter, type, number } = params;
        const header = user + '-' + category + '-' + type;
        const setFile = buffer => ({ subpath: header, data: { name: header + '-' + Date.now() + '.csv', buffer } });
        const hasFile =  
          obj => R.filter(filename => FSS.isFile({ subpath: obj.subpath, filename }) && R.test(/.*\.csv$/, filename), obj.files);
        const setFiles = obj => R.merge(obj, { files: hasFile(obj) });
        const FSS = fss.of({ dirpath: '../', dirname: CACHE });
        const conditions = { user, category, type, total: number, limit: 20 };
        return feed.downloadItems({ user, ids, filter, type }).pipe(
            map(setFile)
          , flatMap(file => FSS.createDirectory(file))
          , flatMap(file => FSS.createBom(file))
          , flatMap(file => FSS.createFile(file))
          , flatMap(file => FSS.fetchFileList(file))
          , map(setFiles)
          , flatMap(file => feed.createCSVs(conditions, file))
          );
      }
    case 'download/images':
      {
        const { user, id, filter, number } = options;
        const conditions = { user, id, total: number, limit: 1 };
        return feed.downloadImages({ user, id, filter }).pipe(
            flatMap(obj => feed.createImages(conditions, obj))
          );
      }
    default:
      return throwError('not Implemented.');
  }
};

const worker = (options, callback) => {
  const { operation, url, user, id, skip, limit, params } = options;
  log.info(displayName, 'Started. _id/ope:', id, operation);
  const start = new Date();
  request(operation, { url, user, id, skip, limit, params }).subscribe(
    obj => log.info(displayName, 'Proceeding... _id/ope/status:', id, operation, obj)
  , err => {
      log.warn(displayName, err.name, err.message, err.stack);
      callback();
    }
  , ()  => {
      const end = new Date();
      const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
      log.info(displayName, `Completed. _id: ${id}, time: ${seconds} sec.`);
      callback();
  });
};

let jobName;
if(workerName === 'wks-worker') {
  jobName = 'download/items';
} else {
  jobName = 'none';
}
const jobQueue = job.dequeue(workerName, jobName, 1, worker);

const main = () => {
  const queue = async.queue(worker);
  const wait        = () => queue.length();
  const runs        = () => queue.running();
  const idle        = () => queue.idle() ? '[idle]' : '[busy]';
  const paused      = () => queue.paused ? '[paused]' : '[resume]';
  const started     = () => queue.stated ? '[start]'  : '[stop]';
  const list        = () => queue.workersList();
  queue.concurrency = 1;
  queue.buffer      = 1;
  queue.saturated   = () => log.debug(displayName, '== Saturated.   wait/runs:', wait(), runs(), idle());
  queue.unsaturated = () => log.debug(displayName, '== Unsaturated. wait/runs:', wait(), runs(), idle());
  queue.empty       = () => log.debug(displayName, '== Last.        wait/runs:', wait(), runs(), idle());
  queue.drain       = () => log.debug(displayName, '== Drain.       wait/runs:', wait(), runs(), idle());
  queue.error       = (err, task) => {
    log.error(displayName, err.name, err.message, err.task);
    log.debug(displayName, 'Task:', task);
    log.debug(displayName, 'Queue list:', list(), paused(), started());
  };
  process.on('disconnect', () => shutdown(null, process.exit));
  process.on('message', task => {
    if(task) {
      log.info(displayName, 'Received. _id/ope:', task.id, task.operation);
      queue.push(task, err => err 
        ? log.error(displayName, err.name, err.message, err.stack) 
        : log.info(displayName, 'Finished. _id/ope:', task.id, task.operation)
      );
      queue.remove(({ data }) => {
        if(Date.now() - new Date(data.created).getTime() > (24 * 60 * 60 * 1000)) {
          log.info(displayName, 'Removed. _id/ope:', data.id, data.operation);
          return true;
        }
        return false;
      });
    }
  });
};
main();

const rejections = new Map();
const reject = (err, promise) => {
  log.warn(displayName, 'unhandledRejection', err.name. err.message, promise);
  rejections.set(promise, err);
};
const shrink = promise => {
  log.warn(displayName, 'rejectionHandled', rejections, promise);
  rejections.delete(promise);
};

const message = (err, code, signal) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  else    log.info(displayName, `worker exit. (s/c): ${signal || code}`);
};

const shutdown = (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  log.info(displayName, 'worker terminated.');
  log.info(displayName, 'log4js #4 terminated.');
  jobQueue.stop(() => log.close(() => cbk()));
};

process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));
