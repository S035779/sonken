import R                from 'ramda';
import Rx               from 'rx';
import mongoose         from 'mongoose';
import { Mail, Selected }  from 'Models/mail';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';


/**
 * MailEditor class.
 *
 * @constructor
 */
export default class MailEditor {
  constructor() {
  }

  static of() {
    return new MailEditor();
  }

  request(request, options) {
    log.debug(request, options);
    switch(request) {
      case 'fetch/mails':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Mail.find(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'fetch/mail':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Mail.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject(
              { name: 'Error', message: 'Mail not found.' });
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/mail':
        return new Promise((resolve, reject) => {
          const mail = new Mail({
            user:   options.admin
          , title:  options.data.title
          , body:   options.data.body
          });
          mail.save((err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'update/mail':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          const update = {
              user:     options.admin
            , title:    options.data.title
            , body:     options.data.body
            , updated:  Date.now()
            };
          Mail.findOneAndUpdate(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'delete/mail':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Mail.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/select':
        return new Promise((resolve, reject) => {
          const selected = new Selected({ selected: options.id });
          selected.save((err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/select':
        return new Promise((resolve, reject) => {
          const conditions = { selected: options.id };
          Selected.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/select':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Selected.find(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'Error', message: 'request: ' + request });
        });
        break;
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

  fetchMails({ admin }) {
    const observables = Rx.Observable
      .forkJoin([ this.getSelect(admin), this.getMails(admin) ]);
    return observables
    .map(objs => {
      const selected = R.map(obj => obj.selected, objs[0]); 
      return R.map(obj => {
          const mail = obj.toObject();
          const isSelected = R.contains(mail._id.toString(), selected);
          return R.merge(mail, { selected: isSelected });
        }, objs[1]);
    });
  }

  fetchMail({ admin, ids }) {
    const _promise = R.curry(this.getMail.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, ids);
    return Rx.Observable.forkJoin(observables);
  }

  createMail({ admin }) {
    const data = { title: 'Untitled', body: '' };
    return Rx.Observable.fromPromise(this.addMail(admin, data));
  }

  updateMail({ admin, id, data }) {
    return Rx.Observable.fromPromise(this.replaceMail(admin, id, data));
  }

  deleteMail({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeMail.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return Rx.Observable.forkJoin(observables);
  }

  createSelect({ admin, ids }) {
    const _promise = R.curry(this.addSelect.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, ids);
    return Rx.Observable.forkJoin(observables);
  }

  deleteSelect({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeSelect.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return Rx.Observable.forkJoin(observables);
  }
};
