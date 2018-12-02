import archiver         from 'archiver';
import fs               from 'fs-extra';
import path             from 'path';
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
          const { subpath } = options;
          const subdir = path.resolve(this.dir, subpath);
          const zip = path.resolve(this.dir, `${subpath}-${Date.now()}.zip`);
          return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zip);
            const archive = archiver('zip', { zlib: { level: 9 } });
            output.on('close',  () => {
              log.info(FSSupport.displayName, 'close:', archive.pointer() + ' total bytes.');
              fs.remove(subdir, err => {
                if(err) return reject(err);
                resolve(options);
              });
            });
            output.on('end',    () => {
              log.trace(FSSupport.displayName, 'end:', 'data has been drained.');
            });
            output.on('finish', () => {
              log.info(FSSupport.displayName, 'finish:', 'data archives has been finished.');
            });
            archive.on('warning', err => {
              if(err.code === 'ENOENT')  log.warn(FSSupport.displayName, err.code, err.message, err.data);
              else reject(err)
            });
            archive.on('error', err => {
              log.error(FSSupport.displayName, err.code, err.message, err.data);
              reject(err);
            });
            archive.on('progress', data => {
              log.trace(FSSupport.displayName, 'progress(total/process):', data.entries.total, data.entries.processed);
            });
            archive.on('entry', data => {
              log.trace(FSSupport.displayName, 'entry(date/name:', data.date, data.name);
            });
            archive.pipe(output);
            archive.directory(subdir, false);
            archive.finalize();
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

  addArchive(subpath, files) {
    this.request('create/archive', { subpath, files });
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

}
FSSupport.displayName = 'fssutils';
