import R                from 'ramda';
import Rx               from 'rxjs/Rx';
import mongoose         from 'mongoose';
import { Faq, Posted }  from 'Models/faq';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

/**
 * FaqEditor class.
 *
 * @constructor
 */
export default class FaqEditor {
  constructor() {
  }

  static of() {
    return new FaqEditor();
  }

  request(request, options) {
    //log.debug(request, options);
    switch(request) {
      case 'fetch/faqs':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Faq.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'fetch/faq':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Faq.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject(
              { name: 'Error', message: 'Faq not found.' });
            //log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/faq':
        return new Promise((resolve, reject) => {
          const faq = new Faq({
            user:   options.admin
          , title:  options.data.title
          , body:   options.data.body
          });
          faq.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'update/faq':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          const update = {
              user:     options.admin
            , title:    options.data.title
            , body:     options.data.body
            , updated:  new Date
            };
          Faq.findOneAndUpdate(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'delete/faq':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Faq.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/post':
        return new Promise((resolve, reject) => {
          const conditions = {
            posted: options.id
          };
          const update = {
            posted: options.id
          };
          Posted.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/post':
        return new Promise((resolve, reject) => {
          const conditions = {
            posted: options.id
          };
          Posted.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/post':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Posted.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'upload/file':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          const update = {
            user:     options.admin
          , file:     options.file
          , update:   new Date
          };
          Faq.findOneAndUpdate(conditions, update, (err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
        break;
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'Error', message: 'request: ' + request });
        });
        break;
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
    const observables = Rx.Observable
      .forkJoin([ this.getPost(admin), this.getFaqs(admin) ]);
    return observables
    .map(objs => {
      const posted = R.map(obj => obj.posted, objs[0]); 
      return R.map(obj => {
          const faq = obj.toObject();
          const isPosted = R.contains(faq._id.toString(), posted);
          return R.merge(faq, { posted: isPosted });
        }, objs[1]);
    });
  }

  fetchFaq({ admin, ids }) {
    const _promise = R.curry(this.getFaq.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, ids);
    return Rx.Observable.forkJoin(observables);
  }

  createFaq({ admin }) {
    const data = { title: 'Untitled', body: '' };
    return Rx.Observable.fromPromise(this.addFaq(admin, data));
  }

  updateFaq({ admin, id, data }) {
    return Rx.Observable.fromPromise(this.replaceFaq(admin, id, data));
  }

  deleteFaq({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeFaq.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return Rx.Observable.forkJoin(observables);
  }

  createPost({ admin, ids }) {
    const _promise = R.curry(this.addPost.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, ids);
    return Rx.Observable.forkJoin(observables);
  }

  deletePost({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removePost.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return Rx.Observable.forkJoin(observables);
  }

  uploadFile({ admin, id, file }) {
    return Rx.Observable.fromPromise(this.upFile(admin, id, file));
  }
};
