import sourceMapSupport from 'source-map-support';
import dotenv           from 'dotenv';
import path             from 'path';
import * as R           from 'ramda';
import { forkJoin, throwError, of, from, defer }   from 'rxjs';
import { flatMap, map, catchError } from 'rxjs/operators';
import Async            from 'async';
import FeedParser       from 'Routes/FeedParser/FeedParser';
import Amazon           from 'Routes/Amazon/Amazon';
import Yahoo            from 'Routes/Yahoo/Yahoo';
import std              from 'Utilities/stdutils';
import log              from 'Utilities/logutils';
import aws              from 'Utilities/awsutils';
import job              from 'Utilities/jobutils';
import fss              from 'Utilities/fssutils';

sourceMapSupport.install();
const config = dotenv.config();
if(config.error) throw new Error(config.error);

const node_env        = process.env.NODE_ENV    || 'development';
const workername      = process.env.WORKER_NAME || 'empty';
const CACHE           = process.env.CACHE;
const STORAGE         = process.env.STORAGE;

const AWS_ACCESS_KEY  = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY  = process.env.AWS_SECRET_KEY;
const AWS_REGION_NAME = process.env.AWS_REGION_NAME;
const aws_keyset      = { access_key: AWS_ACCESS_KEY, secret_key: AWS_SECRET_KEY, region: AWS_REGION_NAME };

const AMZ_ACCESS_KEY  = process.env.AMZ_ACCESS_KEY;
const AMZ_SECRET_KEY  = process.env.AMZ_SECRET_KEY;
const AMZ_ASSOCI_TAG  = process.env.AMZ_ASSOCI_TAG;
const amz_keyset      = { access_key: AMZ_ACCESS_KEY, secret_key: AMZ_SECRET_KEY, associ_tag: AMZ_ASSOCI_TAG };

process.env.NODE_PENDING_DEPRECATION = 0;

const FSS = fss.of({ dirpath: '../', dirname: CACHE });
const AWS = aws.of(aws_keyset);
const amazon  = Amazon.of(amz_keyset);

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
  const feed    = FeedParser.of();
  const yahoo   = Yahoo.of();
  switch(operation) {
    case 'marchant':
    case 'sellers':
      {
        const { url, user, id, skip, limit } = options;
        return yahoo.jobHtml({ url, skip, limit }).pipe( 
            map(obj => ({ items: obj.item }))
          , flatMap(obj => feed.updateHtml({ user, id, html: obj }))
          );
      }
    case 'closedmarchant':
      {
        const { url, user, id, skip, limit, profile } = options;
        return yahoo.jobClosedMerchant({ url, skip, limit, profile }).pipe(
            map(obj => ({ items: obj.item }))
          , flatMap(obj => feed.updateHtml({ user, id, html: obj }))
          );
      }
    case 'closedsellers':
      {
        const { url, user, id, skip, limit, profile } = options;
        return yahoo.jobClosedSellers({ url, skip, limit, profile }).pipe(
            map(obj => ({ items: obj.item }))
          , flatMap(obj => feed.updateHtml({ user, id, html: obj }))
          );
      }
    //case 'rss':
    //  {
    //    const { url, user, id } = options;
    //    const putRss  = obj => feed.updateRss({ user, id, rss: obj });
    //    return yahoo.jobRss({ url }).pipe(
    //        map(obj => ({ items: obj.item }))
    //      , flatMap(putRss)
    //      );
    //  }
    case 'images':
      {
        const { user, id } = options;
        const operator = (storage, filename) => AWS.createWriteStream(storage, filename);
        return feed.fetchJobNote({ user, id }).pipe(
            flatMap(obj => yahoo.jobImages({ items: obj.items, operator }))
          , flatMap(obj => feed.createAttribute({ user, id: obj.guid__, data: { images: obj.images } }))
          );
      }
    //case 'archives':
    //  {
    //    const { user, id } = options;
    //    return feed.fetchJobNote({ user, id }).pipe(
    //        flatMap(obj => feed.createArchives(obj))
    //      , flatMap(obj => feed.createAttribute({ user, id: obj.guid__, data: { archive: obj.archive } }))
    //      );
    //  }
    case 'attribute':
      {
        const { user, id } = options;
        const setAttribute = obj => ({ user, id: obj.guid__, data: { sale: obj.sale, sold: obj.sold, market: obj.market } });
        const setAttributes = R.map(setAttribute);
        const hasAttributes = R.filter(obj => !R.isNil(obj));
        const observables = R.map(obj => feed.createAttribute(obj));
        return feed.fetchJobNote({ user, id }).pipe(
            flatMap(obj => yahoo.jobAttribute({ items: obj.items }))
          , map(hasAttributes)
          , map(setAttributes)
          , flatMap(objs => forkJoin(observables(objs)))
          );
      }
    case 'itemsearch':
      {
        const { user, id, profile } = options;
        const setAttribute = obj => ({ user, id: obj.guid__, data: { asins: obj.asins } });
        const setAttributes = R.map(setAttribute);
        const hasAttributes = R.filter(obj => !R.isNil(obj));
        const observables = R.map(obj => feed.createAttribute(obj));
        return feed.fetchJobNote({ user, id }).pipe(
            flatMap(obj => amazon.jobItemSearch({ items: obj.items, profile }))
          , map(hasAttributes)
          , map(setAttributes)
          , flatMap(objs => forkJoin(observables(objs)))
          );
      }
    case 'itemlookup':
      {
        const { user, id, profile } = options;
        const setAttribute = obj => ({ user, id: obj.guid__, data: { asins: obj.asins } });
        const setAttributes = R.map(setAttribute);
        const hasAttributes = R.filter(obj => !R.isNil(obj));
        const observables = R.map(obj => feed.createAttribute(obj));
        return feed.fetchJobNote({ user, id }).pipe(
            flatMap(obj => amazon.jobItemLookup({ items: obj.items, profile }))
          , map(hasAttributes)
          , map(setAttributes)
          , flatMap(objs => forkJoin(observables(objs)))
          );
      }
    case 'defrag':
      {
        const { user, id } = options;
        return feed.garbageCollection({ user, id });
      }
    case 'download/items':
      {
        const { params } = options;
        const { user, category, ids, filter, type, limit, count, total, index } = params;
        const header = user + '-' + category + '-' + type;
        const setData = buffer => ({ subpath: header, data: { name: header + '-' + Date.now() + '.csv', buffer } });
        const isCSV = R.test(/.*\.csv$/);
        const sizeFile = obj => R.map(filename => isCSV(filename) ? FSS.sizeFile({ subpath: obj.subpath, filename }) : 0, obj.files);
        const sizeFiles = obj => R.sum(sizeFile(obj));
        const hasFiles =  obj => R.filter(filename => isCSV(filename) && FSS.isFile({ subpath: obj.subpath, filename }), obj.files);
        const setFiles = obj => R.merge(obj, { files: hasFiles(obj), size: sizeFiles(obj) });
        return feed.downloadItems({ user, ids, filter, type }, index === 0).pipe(
            flatMap(obj => !R.isNil(obj) 
              ? of(setData(obj)) 
              : throwError({ name: 'NotFound', message: 'File not found.', stack: operation }))
          , flatMap(file => FSS.createDirectory(file))
          , flatMap(file => FSS.createFile(file))
          , flatMap(file => FSS.fetchFileList(file))
          , map(setFiles)
          , flatMap(file => createArchives({ user, category, type, limit, count, total, index }, file))
          , catchError(err => {
              if(err && !(err.name === 'NotFound' || err.name === 'NoSuchKey')) log.error(displayName, err.name, err.message, err.stack);
              else log.warn(displayName, err.name, err.message, err.stack);
              return of(setData()).pipe(
                  flatMap(file => FSS.createDirectory(file))
                , flatMap(file => FSS.fetchFileList(file))
                , map(setFiles)
                , flatMap(file => createArchives({ user, category, type, limit, count, total, index }, file))
                );
            })
          );
      }
    case 'download/item':
      {
        const { params } = options;
        const { user, category, ids, filter, type, limit, count, total, index } = params;
        const header = user + '-' + category + '-' + type;
        const setData = buffer => ({ subpath: header, data: { name: header + '-' + Date.now() + '.csv', buffer } });
        const isCSV = R.test(/.*\.csv$/);
        const sizeFile = obj => R.map(filename => isCSV(filename) ? FSS.sizeFile({ subpath: obj.subpath, filename }) : 0, obj.files);
        const sizeFiles = obj => R.sum(sizeFile(obj));
        const hasFiles =  obj => R.filter(filename => isCSV(filename) && FSS.isFile({ subpath: obj.subpath, filename }), obj.files);
        const setFiles = obj => R.merge(obj, { files: hasFiles(obj), size: sizeFiles(obj) });
        return feed.downloadItems({ user, ids, filter, type }, index === 0).pipe(
            flatMap(obj => !R.isNil(obj) 
              ? of(setData(obj)) 
              : throwError({ name: 'NotFound', message: 'File not found.', stack: operation }))
          , flatMap(file => FSS.createDirectory(file))
          , flatMap(file => FSS.createFile(file))
          , flatMap(file => FSS.fetchFileList(file))
          , map(setFiles)
          , flatMap(file => mergeArchives({ user, category, type, limit, count, total, index }, file))
          , catchError(err => {
              if(err && !(err.name === 'NotFound' || err.name === 'NoSuchKey')) log.error(displayName, err.name, err.message, err.stack);
              else log.warn(displayName, err.name, err.message, err.stack);
              return of(setData()).pipe(
                  flatMap(file => FSS.createDirectory(file))
                , flatMap(file => FSS.fetchFileList(file))
                , map(setFiles)
                , flatMap(file => mergeArchives({ user, category, type, limit, count, total, index }, file))
                );
            })
          );
      }
    case 'signedlink/images':
    case 'download/images':
      {
        const { params } = options;
        const { user, category, ids, filter, type, limit, count, total, index } = params;
        const header = user + '-' + category + '-' + type;
        const setData = objs => ({ subpath: header, data: objs });
        const isImage = R.test(/.*\.(gif|jpe?g|png)$/);
        const sizeFile = obj => R.map(filename => isImage(filename) ? FSS.sizeFile({ subpath: obj.subpath, filename }) : 0, obj.files);
        const sizeFiles = obj => R.sum(sizeFile(obj));
        const hasFiles = obj => R.filter(filename => isImage(filename) && FSS.isFile({ subpath: obj.subpath, filename }), obj.files);
        const setFiles = obj => R.merge(obj, { files: hasFiles(obj), size: sizeFiles(obj) });
        return feed.downloadImages({ user, ids, filter, type }).pipe(
            flatMap(objs => !R.isEmpty(objs) 
              ? of(setData(objs)) 
              : throwError({ name: 'NotFound', message: 'File not found.', stack: operation }))
          , flatMap(file => FSS.createDirectory(file))
          , flatMap(file => FSS.createFiles(file))
          , flatMap(file => FSS.fetchFileList(file))
          , map(setFiles)
          , flatMap(file => createArchives({ user, category, type, limit, count, total, index }, file))
          , catchError(err => {
              if(err && !(err.name === 'NotFound' || err.name === 'NoSuchKey')) log.error(displayName, err.name, err.message, err.stack);
              else log.warn(displayName, err.name, err.message, err.stack);
              return of(setData()).pipe(
                  flatMap(file => FSS.createDirectory(file))
                , flatMap(file => FSS.fetchFileList(file))
                , map(setFiles)
                , flatMap(file => createArchives({ user, category, type, limit, count, total, index }, file))
                );
            })
          );
      }
    case 'download/image':
      {
        const { params } = options;
        const { user, category, ids, filter, type } = params;
        const setFiles = files => ({ files });
        return feed.downloadImage({ user, ids, filter, type }).pipe(
            map(setFiles)
          , flatMap(file => createS3Archives({ user, category, type }, file))
          );
      }
    default:
      return throwError({ name: 'Invalid request:', message: 'Request is not implemented.', stack: operation });
  }
};

const setArchiveKey = (key, value, count) => {
  const setKey      = (_key, _val) => std.crypto_sha256(_val, _key, 'hex') + '.zip';
  return setKey(key, value + '-' + count);
}

const createS3Archives = ({ user, category, type }, file) => {
  log.info(displayName, 'createArchive', { user, category, type });
  const { files } = file;
  const header      = user + '-' + category;
  const setKey      = () => setArchiveKey(type, header, 0);
  const setDetail   = obj => ({ subpath: obj.subpath, files: R.length(obj.files), size: obj.size });
  return from(AWS.createS3Archives(STORAGE, CACHE, { key: setKey(), files })).pipe(map(setDetail));
}

const createArchives = ({ user, category, type, limit, count, total, index }, file) => {
  log.info(displayName, 'createArchives', { user, category, type, limit, count, total, index });
  const { subpath, files, size } = file;
  const header      = user + '-' + category;
  const setFiles    = R.map(filename => ({ name: filename }))
  const numTotal    = Number(total);
  const numIndex    = Number(index);
  const numLimit    = Number(limit);
  const numCount    = Number(count);
  const numSize     = Number(size);
  const numFiles    = R.length(files);
  const numCounts   = numCount !== 0 ? Math.floor(numIndex / numCount) : 0;
  const isCountUp   = numCount !== 0 && ((numIndex + 1) % numCount === 0);
  const isFiles     = numFiles !== 0;
  const isFinalize  = (numTotal <= numLimit) || ((numTotal >  numLimit) && (numTotal <= numLimit * (numIndex + 1)));
  const setKey      = () => setArchiveKey(type, header, numCounts);
  const setDetail   = obj => ({ subpath: obj.subpath, files: R.length(obj.files), size: numSize, count: numCounts, countup: isCountUp });
  return defer(() => (isFiles && isFinalize) || (isFiles && isCountUp)
    ? from(AWS.createArchives(STORAGE, CACHE, { key: setKey(), files: setFiles(files), subpath })).pipe(map(setDetail))
    : of(setDetail(file))
  );
}

const mergeArchives = ({ user, category, type, limit, count, total, index }, file) => {
  log.info(displayName, 'mergeArchives', { user, category, type, limit, count, total, index });
  const { subpath, files, size } = file;
  const header      = user + '-' + category;
  const setFiles    = R.map(filename => ({ name: filename }))
  const numTotal    = Number(total);
  const numIndex    = Number(index);
  const numLimit    = Number(limit);
  const numCount    = Number(count);
  const numSize     = Number(size);
  const numFiles    = R.length(files);
  const numCounts   = numCount !== 0 ? Math.floor(numIndex / numCount) : 0;
  const isCountUp   = numCount !== 0 && ((numIndex + 1) % numCount === 0);
  const isFiles     = numFiles !== 0;
  const isFinalize  = (numTotal <= numLimit) || ((numTotal >  numLimit) && (numTotal <= numLimit * (numIndex + 1)));
  const setKey      = () => setArchiveKey(type, header, numCounts);
  const setDetail   = obj => ({ subpath: obj.subpath, files, size: numSize, count: numCounts, countup: isCountUp  });
  return defer(() => (isFiles && isFinalize) || (isFiles && isCountUp)
    ? FSS.mergeFiles(file).pipe(
        flatMap(obj => AWS.createArchive(STORAGE, CACHE, { key: setKey(), files: setFiles([obj]), subpath }))
      , map(setDetail)
      )
    : of(setDetail(file)) 
  );
}

const worker = (options, callback) => {
  const { operation, url, user, id, skip, limit, profile, params } = options;
  log.info(displayName, 'Started. _id/ope:', id, operation);
  const start = new Date();
  request(operation, { url, user, id, skip, limit, profile, params }).subscribe(
    obj => log.info(displayName, 'Proceeding... _id/ope/status:', id, operation, obj)
  , err => {
      if(err && err.name !== 'NoProblem') log.error(displayName, err.name, err.message, err.stack);
      callback();
    }
  , ()  => {
      const end = new Date();
      const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
      log.info(displayName, `Completed. _id: ${id}, time: ${seconds} sec.`);
      callback();
  });
};

let jobs;
switch(workername) {
  case 'wks-worker':
    jobs = ['download/items', 'download/item'];
    break;
  case 'arc-worker':
    jobs = ['download/images', 'signedlink/images'];
    break;
  default:
    jobs = ['notImplemented'];
    break;
}

const jobqueues = new Map();
let jobqueue;
for(let jobname of jobs) {
  log.info(displayName, 'start:', jobname);
  jobqueue = job.dequeue(workername, jobname, 1, worker);
  jobqueues.set(jobqueue, jobname);
}

const main = () => {
  const queue = Async.queue(worker);
  const wait        = () => queue.length();
  const runs        = () => queue.running();
  const idle        = () => queue.idle() ? '[idle]' : '[busy]';
  const paused      = () => queue.paused ? '[paused]' : '[resume]';
  const started     = () => queue.stated ? '[start]'  : '[stop]';
  const list        = () => queue.workersList();
  queue.concurrency = 1;
  queue.buffer      = 1;
  queue.saturated   = () => process.send({ name: 'saturated',   message: '== Saturated.',    wait: wait(), runs: runs(), idle: idle() });
  queue.unsaturated = () => process.send({ name: 'unsaturated', message: '== Unsaturated.',  wait: wait(), runs: runs(), idle: idle() });
  queue.empty       = () => process.send({ name: 'empty',       message: '== Last.',         wait: wait(), runs: runs(), idle: idle() });
  queue.drain       = () => process.send({ name: 'drain',       message: '== Drain.',        wait: wait(), runs: runs(), idle: idle() });
  queue.error       = 
    (err, task) => process.send({ name: 'error', message: err, task: task, queue: list(), paused: paused(), started: started() });
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
  const { name, message, stack } = err;
  log.error(displayName, 'unhandledRejection', name, message, stack || promise);
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

const shutdown = async (err, cbk) => {
  if(err) log.error(displayName, err.name, err.message, err.stack);
  //for(let [ jobqueue, jobname ] of jobqueues.entries()) {
    //log.info(displayName, jobname, 'terminated.');
    //await jobqueue.stop();
  //}

  log.info(displayName, 'log4js #4 terminated.');
  await log.exit().then(() => cbk());
};

setInterval(() => {
  const used = process.memoryUsage()
  const messages = []
  for (let key in used) messages.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  log.info(displayName, 'memory usage', messages.join(', '));
  //if(env === 'development') process.emit('SIGUSR1');
}, 5 * 60 * 1000)

process.on('SIGUSR1', () => import('heapdump').then(h => h.writeSnapshot(path.resolve('tmp', Date.now() + '.heapsnapshot'))));
process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT',  () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));
