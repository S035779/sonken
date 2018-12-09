import archiver         from 'archiver';
import fs               from 'fs-extra';
import path             from 'path';
import StreamConcat     from 'stream-concat';
import * as R           from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map }          from 'rxjs/operators';
import log              from 'Utilities/logutils';

/**
 * FileSystemSupport class.
 *
 * @constructor
 */
export default class FSSupport {
  constructor(dirpath, dirname) {
    this.dir =  path.resolve(__dirname, dirpath, dirname);
  }

  static of({ dirpath, dirname }) {
    return new FSSupport(dirpath, dirname);
  }

  request(request, options) {
    //log.info(FSSupport.displayName, 'Request', request);
    switch(request) {
      case 'create/archive':
        {
          const { subpath, filename, data } = options;
          const dir = path.resolve(this.dir, subpath);
          const filepath = path.resolve(this.dir, `${subpath}-${Date.now()}.zip`);
          return new Promise((resolve, reject) => {
            const src = archiver('zip', { zlib: { level: 9 } });
            const dst = fs.createWriteStream(filepath);
            //dst.on('close', ()  => log.debug(FSSupport.displayName,   'dst:close', 'data archives has been closed.'));
            dst.on('finish',  () => {
              log.info(FSSupport.displayName, 'dst:finish', src.pointer() + ' total bytes.');
              fs.remove(dir, err => {
                if(err) return reject(err);
                resolve(options);
              });
            });
            src.on('warning',  err   => {
              if(err.code === 'ENOENT')  log.warn(FSSupport.displayName, err.code, err.message, err.data);
              else reject(err)
            });
            src.on('error',    reject);
            //src.on('progress', data => 
            //  log.debug(FSSupport.displayName, 'src:progress(total/process)', data.entries.total, data.entries.processed));
            //src.on('entry',    data => 
            //  log.debug(FSSupport.displayName, 'src:entry(date/name)', data.date, data.name));
            src.pipe(dst);
            src.file(filename, { name: data.name });
            src.finalize();
          });
        }
      case 'append/files':
        {
          const { subpath, files } = options;
          const srcdir        = path.resolve(this.dir, subpath);
          const dstfile       = `${subpath}-${Date.now()}.csv`;
          const setFile       = str => path.resolve(srcdir, str);
          const setReadStream = str => fs.createReadStream(str);
          const createReadStream = R.compose(setReadStream, setFile);
          let idx = 0;
          const nextStream = () => idx === files.length ? null : createReadStream(files[idx++]);
          return new Promise((resolve, reject) => {
            const src = new StreamConcat(nextStream);
            const dst = fs.createWriteStream(path.resolve(this.dir, dstfile));
            dst.on('error',  reject);
            //dst.on('pipe',   ()  => log.debug(FSSupport.displayName, 'dst:pipe',   'it is pipe.'));
            //dst.on('unpipe', ()  => log.debug(FSSupport.displayName, 'dst:unpipe', 'it is unpipe.'));
            //dst.on('drain',  ()  => log.debug(FSSupport.displayName, 'dst:drain',  'it is drain.'));
            //dst.on('close',  ()  => log.debug(FSSupport.displayName, 'dst:close',  'it is close.'));
            dst.on('finish', () => {
              log.info(FSSupport.displayName, 'dst:finish', 'it is finish.');
              fs.remove(srcdir, err => {
                if(err) return reject(err);
                resolve(dstfile);
              });
            });
            src.on('error',  reject);
            //src.on('unpipe', ()  => log.debug(FSSupport.displayName, 'src:unpipe', 'it is unpipe.'));
            //src.on('pipe',   ()  => log.debug(FSSupport.displayName, 'src:pipe',   'it is pipe.'));
            //src.on('drain',  ()  => log.debug(FSSupport.displayName, 'src:drain',  'it is drain.'));
            //src.on('finish', ()  => log.debug(FSSupport.displayName, 'src:finish', 'it is finish.'));
            //src.on('close',  ()  => log.debug(FSSupport.displayName, 'src:close',  'it is close.'));
            //src.on('end',    ()  => log.info(FSSupport.displayName,  'src:end',    'it is end.'));
            src.pipe(dst);
          });
        }
      case 'append/file':
        {
          const { subpath, data } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, data.name);
          return new Promise((resolve, reject) => {
            fs.appendFile(file, data.buffer, err => {
              if(err) return reject(err);
              resolve(options);
            });
          });
        }
      case 'create/file':
        {
          const { subpath, data } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, data.name);
          return new Promise((resolve, reject) => {
            fs.writeFile(file, data.buffer, err => {
              if(err) return reject(err);
              resolve(options);
            });
          });
        }
      case 'create/bom':
        {
          const { subpath, data } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, data.name);
          return new Promise((resolve, reject) => {
            fs.writeFile(file, '\uFEFF', err => {
              if(err) return reject(err);
              resolve(options);
            });
          });
        }
      case 'create/directory':
        {
          const { subpath } = options;
          const dir = path.resolve(this.dir, subpath);
          return new Promise(resolve => {
            fs.mkdir(dir, () => {
              return resolve(options);
            });
          });
        } 
      case 'finalize/file':
        {
          const { subpath, filename, data, url } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, filename);
          return new Promise((resolve, reject) => {
            fs.remove(file, err => {
              if(err) return reject(err);
              resolve({ subpath, filename, data, url });
            });
          });
        }
      case 'fetch/file':
        {
          const { subpath, filename } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, filename);
          return new Promise((resolve, reject) => {
            fs.readFile(file, (err, buffer) => {
              if(err) return reject(err);
              resolve({ subpath, filename, data: { name: filename, buffer }});
            });
          });
        }
      case 'fetch/filelist':
        {
          const { subpath } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
              if(err) return reject(err);
              resolve({ subpath, files });
            });
          });
        }
      case 'is/file':
        {
          const { subpath, filename } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, filename);
          const stat = fs.statSync(file);
          return stat.isFile();
        }
      case 'size/file':
        {
          const { subpath, filename } = options;
          const dir = subpath ? path.resolve(this.dir, subpath) : this.dir;
          const file = path.resolve(dir, filename);
          const stat = fs.statSync(file);
          return stat.size;
        }
      default:
        {
          return new Promise((resolve, reject) => reject({ name: 'Error', message: request }));
        }
    }
  }

  addArchive(subpath, filename, data) {
    this.request('create/archive', { subpath, filename, data });
  }

  addFiles(subpath, files) {
    return this.request('append/files', { subpath, files });
  }

  addFile(subpath, data) {
    return this.request('append/file', { subpath, data });
  }

  newFile(subpath, data) {
    return this.request('create/file', { subpath, data });
  }

  addBom(subpath, data) {
    return this.request('create/bom', { subpath, data });
  }

  addDirectory(subpath, data) {
    return this.request('create/directory', { subpath, data });
  }

  getFile(subpath, filename) {
    return this.request('fetch/file', { subpath, filename });
  }

  getFileList(subpath) {
    return this.request('fetch/filelist', { subpath });
  }

  deleteFile(subpath, filename, data, url) {
    return this.request('finalize/file', { subpath, filename, data, url });
  }

  existFile(subpath, filename) {
    return this.request('is/file', { subpath, filename });
  }

  amountFile(subpath, filename) {
    return this.request('size/file', { subpath, filename });
  }

  fetchFile({ subpath, filename }) {
    return from(this.getFile(subpath, filename));
  }

  fetchFileList({ subpath }) {
    return from(this.getFileList(subpath));
  }

  createDirectory({ subpath, data }) {
    return from(this.addDirectory(subpath, data));
  }

  createFile({ subpath, data }) {
    return from(this.newFile(subpath, data));
  }

  appendFile({ subpath, data }) {
    return from(this.addFile(subpath, data));
  }

  createFiles({ subpath, data }) {
    const promises = R.map(obj => this.newFile(subpath, obj));
    return forkJoin(promises(data)).pipe(
        map(() => ({ subpath }))
      );
  }

  createBom({ subpath, data }) {
    return from(this.addBom(subpath, data));
  }

  finalize({ subpath, filename, data, url }) {
    return from(this.deleteFile(subpath, filename, data, url));
  }

  isFile({ subpath, filename }) {
    return this.existFile(subpath, filename);
  }

  sizeFile({ subpath, filename }) {
    return this.amountFile(subpath, filename);
  }

  mergeFiles({ subpath, files }) {
    return from(this.addFiles(subpath, files));
  }

  createArchive({ subpath, filename, data }) {
    return from(this.addArchive(subpath, filename, data));
  }
}
FSSupport.displayName = 'fssutils';
