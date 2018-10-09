import * as R             from 'ramda';
import { from, forkJoin } from 'rxjs';
import { map }            from 'rxjs/operators';
import { Faq, Posted }    from 'Models/faq';

/**
 * FaqEditor class.
 *
 * @constructor
 */
export default class FaqEditor {
  static of() {
    return new FaqEditor();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/faqs':
        {
          const conditions = {};
          return Faq.find(conditions).exec();
        }
      case 'fetch/faq':
        {
          const conditions = { _id: options.id };
          return Faq.findOne(conditions).exec();
        }
      case 'create/faq':
        {
          const docs = { 
            user: options.admin
          , title: options.data.title
          , body: options.data.body
          };
          return Faq.create(docs);
        }
      case 'update/faq':
        {
          const conditions = { _id: options.id };
          const update = {
            user: options.admin
          , title: options.data.title
          , body: options.data.body
          , updated: new Date
          };
          return Faq.findOneAndUpdate(conditions, update).exec();
        }
      case 'delete/faq':
        {
          const conditions = { _id: options.id };
          return Faq.findOneAndRemove(conditions).exec();
        }
      case 'create/post':
        {
          const conditions = { posted: options.id };
          const update = { posted: options.id };
          const params = { upsert: true };
          return Posted.update(conditions, update, params).exec();
        }
      case 'delete/post':
        {
          const conditions = { posted: options.id };
          return Posted.remove(conditions).exec();
        }
      case 'fetch/post':
        {
          const conditions = {};
          return Posted.find(conditions).exec();
        }
      case 'upload/file':
        {
          const conditions = { _id: options.id };
          const update = {
            user: options.admin
          , file: options.file
          , update: new Date
          };
          return Faq.findOneAndUpdate(conditions, update).exec();
        }
      default:
        return new Promise((resolve, reject) => reject({ name: 'Error', message: 'request: ' + request }));
    }
  }

  getFaqs(admin) {
    return this.request('fetch/faqs', { admin });
  }

  getFaq(admin, id) {
    return this.request('fetch/faq', { admin, id });
  }

  addFaq(admin, data) {
    return this.request('create/faq', { admin, data })
  }

  replaceFaq(admin, id, data) {
    return this.request('update/faq', { admin, id, data });
  }

  removeFaq(admin, id) {
    return this.request('delete/faq', { admin, id });
  }

  addPost(admin, id) {
    return this.request('create/post', { admin, id });
  }

  removePost(admin, id) {
    return this.request('delete/post', { admin, id });
  }

  getPost(admin) {
    return this.request('fetch/post', { admin });
  }

  upFile(admin, id, file) {
    return this.request('upload/file', { admin, id, file });
  }

  fetchFaqs({ admin }) {
    const observables = forkJoin([ this.getPost(admin), this.getFaqs(admin) ]);
    const setPost = objs => {
      const posted = R.map(obj => obj.posted, objs[0]); 
      return R.map(obj => {
          const faq = obj.toObject();
          const isPosted = R.contains(faq._id.toString(), posted);
          return R.merge(faq, { posted: isPosted });
        }, objs[1]);
    };
    return observables.pipe(
      map(setPost)
    );
  }

  fetchFaq({ admin, ids }) {
    const _promise = R.curry(this.getFaq.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, ids);
    return forkJoin(observables);
  }

  createFaq({ admin }) {
    const data = { title: 'Untitled', body: '' };
    return from(this.addFaq(admin, data));
  }

  updateFaq({ admin, id, data }) {
    return from(this.replaceFaq(admin, id, data));
  }

  deleteFaq({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeFaq.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return forkJoin(observables);
  }

  createPost({ admin, ids }) {
    const _promise = R.curry(this.addPost.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, ids);
    return forkJoin(observables);
  }

  deletePost({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removePost.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return forkJoin(observables);
  }

  uploadFile({ admin, id, file }) {
    return from(this.upFile(admin, id, file));
  }
}
FaqEditor.displayName = 'FaqEditor';
