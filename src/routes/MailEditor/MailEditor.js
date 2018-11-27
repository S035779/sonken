import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map }            from 'rxjs/operators';
import { Mail, Selected } from 'Models/mail';

/**
 * MailEditor class.
 *
 * @constructor
 */
export default class MailEditor {
  static of() {
    return new MailEditor();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/mails':
        {
          const conditions = {};
          return Mail.find(conditions).exec();
        }
      case 'fetch/mail':
        {
          const { id } = options;
          const conditions = { _id: id };
          return Mail.findOne(conditions).exec();
        }
      case 'create/mail':
        {
          const { admin, data } = options;
          const docs = { 
            user:   admin
          , title:  data.title
          , body:   data.body
          };
          return Mail.create(docs);
        }
      case 'update/mail':
        {
          const { id, admin, data } = options;
          const conditions = { _id: id };
          const update = { 
            user:     admin
          , title:    data.title
          , body:     data.body
          , updated:  new Date
          };
          return Mail.findOneAndUpdate(conditions, update).exec();
        }
      case 'delete/mail':
        {
          const { id } = options;
          const conditions = { _id: id };
          return Mail.findOneAndRemove(conditions).exec();
        }
      case 'create/select':
        {
          const { id } = options;
          const conditions = { selected: id };
          const update = { updated: new Date };
          const params = { upsert: true };
          return Selected.updateMany(conditions, { $set: update }, params).exec();
        }
      case 'delete/select':
        {
          const { id } = options;
          const conditions = { selected: id };
          return Selected.deleteMany(conditions).exec();
        }
      case 'fetch/select':
        {
          const conditions = {};
          return  Selected.find(conditions).exec();
        }
      case 'upload/file':
        {
          const { id, admin, file } = options;
          const conditions = { _id: id };
          const update = { 
            user: admin
          , file: file
          , updated: new Date
          };
          return Mail.findOneAndUpdate(conditions, update).exec();
        }
      default:
        return new Promise((resolve, reject) => reject({ name: 'Error', message: 'request: ' + request }));
    }
  }

  getMails(admin) {
    return this.request('fetch/mails', { admin });
  }

  getMail(admin, id) {
    return this.request('fetch/mail', { admin, id });
  }

  addMail(admin, data) {
    return this.request('create/mail', { admin, data })
  }

  replaceMail(admin, id, data) {
    return this.request('update/mail', { admin, id, data });
  }

  removeMail(admin, id) {
    return this.request('delete/mail', { admin, id });
  }

  addSelect(admin, id) {
    return this.request('create/select', { admin, id });
  }

  removeSelect(admin, id) {
    return this.request('delete/select', { admin, id });
  }

  getSelect(admin) {
    return this.request('fetch/select', { admin });
  }

  //downFile(admin, id) {
  //  return this.request('download/file', { admin, id });
  //}

  upFile(admin, id, file) {
    return this.request('upload/file', { admin, id, file });
  }

  fetchMails({ admin }) {
    const observables = forkJoin([ this.getSelect(admin), this.getMails(admin) ]);
    const setSelect = objs => {
      const selected = R.map(obj => obj.selected, objs[0]); 
      return R.map(obj => {
          const mail = obj.toObject();
          const isSelected = R.contains(mail._id.toString(), selected);
          return R.merge(mail, { selected: isSelected });
        }, objs[1]);
    };
    return observables.pipe(
      map(setSelect)
    );
  }

  fetchMail({ admin, ids }) {
    const _promise = R.curry(this.getMail.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, ids);
    return forkJoin(observables);
  }

  createMail({ admin }) {
    const data = { title: 'Untitled', body: '' };
    return from(this.addMail(admin, data));
  }

  updateMail({ admin, id, data }) {
    return from(this.replaceMail(admin, id, data));
  }

  deleteMail({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeMail.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return forkJoin(observables);
  }

  createSelect({ admin, ids }) {
    const _promise = R.curry(this.addSelect.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, ids);
    return forkJoin(observables);
  }

  deleteSelect({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeSelect.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return forkJoin(observables);
  }

  uploadFile({ admin, id, file }) {
    return from(this.upFile(admin, id, file));
  }
}
