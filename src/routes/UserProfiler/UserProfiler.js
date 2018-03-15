import dotenv             from 'dotenv';
import R                  from 'ramda';
import Rx                 from 'rx';
import mongoose           from 'mongoose';
import { User, Approved, Admin }
                          from 'Models/profile';
import { Mail, Selected } from 'Models/mail';
import std                from 'Utilities/stdutils';
import Sendmail           from 'Utilities/Sendmail';
import { logs as log }    from 'Utilities/logutils';

dotenv.config()
const mms_from = process.env.MMS_FROM || 'info@example.com';
const smtp_port = process.env.MMS_PORT || 2525;
const ssmtp_port = process.env.MMS_SSL;
const isSSL = ssmtp_port ? true : false;
const mail_keyset = {
  host:   process.env.MMS_HOST
, secure: isSSL
, port:   isSSL ? ssmtp_port : smtp_port
, auth: {
    user:   process.env.MMS_USER
    , pass: process.env.MMS_PASS
  }
};

/**
 * UserProfiler class.
 *
 * @constructor
 */
export default class UserProfiler {
  constructor() {
  }

  static of() {
    return new UserProfiler();
  }

  request(request, options) {
    log.debug(request, options);
    switch(request) {
      case 'fetch/users':
        return new Promise((resolve, reject) => {
          const conditions = {};
          User.find(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'fetch/admin':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Admin.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/admin':
        return new Promise((resolve, reject) => {
          const admin = new Admin({
            from:           options.data.from
          , agreement:      options.data.agreement
          , menu:           options.data.menu
          , advertisement:  options.data.advertisement
          });
          admin.save((err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'update/admin':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          const update = {
            from:           options.data.from
          , agreement:      options.data.agreement
          , menu:           options.data.menu
          , advertisement:  options.data.advertisement
          , updated:        Date.now()
          };
          Admin.findOneAndUpdate(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'delete/admin':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          const isUser = options.user !=='';
          const isEmail = !!options.email;
          if(!isUser) return reject(
            { name: 'Error', message: 'Request error.' });
          const conditions = isEmail
            ? { email: options.email
              , phone: new RegExp(options.phone + '$')}
            : { user: options.user };
          User.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject(
              { name: 'Error', message: 'User not found.' });
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/user':
        return new Promise((resolve, reject) => {
          const user = new User({
            user:   options.user
          , salt:   options.salt
          , hash:   options.hash
          , name:   options.data.name
          , kana:   options.data.kana
          , email:  options.data.email
          , phone:  options.data.phone
          , plan:   options.data.plan
          });
          user.save((err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'update/user':
        return new Promise((resolve, reject) => {
          const isAdmin = !!options.admin;
          const isData = !!options.data;
          const conditions = isAdmin
            ? { user: options.data.user }
            : { user: options.user };
          const update = isAdmin
            ? {
              name:   options.data.name
            , kana:   options.data.kana
            , email:  options.data.email
            , phone:  options.data.phone
            , plan:   options.data.plan
            , updated: Date.now()
            }
            : isData
              ? {
                  name:   options.data.name
                , kana:   options.data.kana
                , email:  options.data.email
                , phone:  options.data.phone
                , plan:   options.data.plan
                , salt:   options.salt
                , hash:   options.hash
                , updated: Date.now()
              }
              : {
                salt:   options.salt
              , hash:   options.hash
              , updated: Date.now()
              };
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj.password);
          });
        });
        break;
      case 'delete/user':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'mail/address':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject(
              { name: 'Error', message: 'User not found.' });
            log.trace(request, obj);
            resolve(obj.email);
          });
        });
        break;
      case 'mail/selected':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Selected.find(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'mail/message':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Mail.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'create/approval':
        return new Promise((resolve, reject) => {
          const approved = new Approved({ approved: options.id });
          approved.save((err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'delete/approval':
        return new Promise((resolve, reject) => {
          const conditions = { approved: options.id };
          Approved.findOneAndRemove(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'fetch/approval':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Approved.find(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'signin/admin':
        return new Promise((resolve, reject) => {
          const conditions = {
            user:     options.admin
          , salt:     options.salt
          , hash:     options.hash
          , isAdmin:  true
          };
          const update = { isAuthenticated: true };
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          })
        });
        break;
      case 'signout/admin':
        return new Promise((resolve, reject) => {
          const conditions = {
            user: options.admin
          , isAdmin: true
          };
          const update = { isAuthenticated: false };
          const isAuthenticated = false;
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'signin/user':
        return new Promise((resolve, reject) => {
          const conditions = {
            user: options.user
          , salt: options.salt
          , hash: options.hash
          };
          const update = { isAuthenticated: true };
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          })
        });
        break;
      case 'signout/user':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          const update = { isAuthenticated: false };
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
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

  getAdmin(admin, id) {
    return this.request('fetch/admin', { admin, id });
  }

  addAdmin(admin, data) {
    return this.request('create/admin', { admin, data });
  }

  replaceAdmin(admin, id, data) {
    return this.request('update/admin', { admin, id, data });
  }

  removeAdmin(admin, id) {
    return this.request('delete/admin', { admin,id });
  }

  getSaltAndHash(password, salt) {
    return std.crypto_pbkdf2(password, salt, 256);
  }

  getUser(user, email, phone) {
    return this.request('fetch/user', { user, email, phone });
  }

  addUser(user, salt, hash, data) {
    return this.request('create/user', { user, salt, hash, data })
  }

  replaceUser(user, salt, hash, data) {
    return this.request('update/user', { user, salt, hash, data });
  }

  signinUser(user, salt, hash) {
    return this.request('signin/user', { user, salt, hash });
  }

  signoutUser(user) {
    return this.request('signout/user', { user });
  }

  getUsers(admin) {
    return this.request('fetch/users', { admin });
  }

  removeUser(admin, id) {
    return this.request('delete/user', { admin, id });
  }

  getAddress(admin, id, message) {
    return this.request('mail/address', { admin, id, message });
  }

  getMessage(admin, id) {
    return this.request('mail/message', { admin, id });
  }

  getSelected(admin) {
    return this.request('mail/selected', { admin });
  }

  addApproval(admin, id) {
    return this.request('create/approval', { admin, id });
  }

  removeApproval(admin, id) {
    return this.request('delete/approval', { admin, id });
  }

  getApproval(admin) {
    return this.request('fetch/approval', { admin });
  }

  signinAdmin(admin, salt, hash) {
    return this.request('signin/admin', { admin, salt, hash });
  }

  signoutAdmin(admin) {
    return this.request('signout/admin', { admin });
  }

  authenticate({ admin, user, password }) {
    const isAdmin = admin !== '';
    const observable = obj => isAdmin
      ? Rx.Observable
        .fromPromise(this.signinAdmin(admin, obj.salt, obj.hash))
      : Rx.Observable
        .fromPromise(this.signinUser(user, obj.salt, obj.hash));
    const options = isAdmin ? { user: admin } : { user: user };
    return this.fetchUser(options)
      .flatMap(obj => this.createSaltAndHash(password, obj.salt))
      .flatMap(obj => observable(obj))
      .flatMap(() => this.fetchUser(options))
      .map(obj => obj.isAuthenticated);
  }

  signout({ admin, user }) {
    const isAdmin = admin !== '';
    const observable = isAdmin 
      ? Rx.Observable.fromPromise(this.signoutAdmin(admin))
      : Rx.Observable.fromPromise(this.signoutUser(user));
    const options = isAdmin ? { user: admin } : { user: user };
    return observable
      .flatMap(() => this.fetchUser(options))
      .map(obj => obj.isAuthenticated);
  }

  fetchUsers({ admin }) {
    const observables = Rx.Observable
      .forkJoin([ this.getApproval(admin), this.getUsers(admin) ]);
    return observables
    .map(objs => {
      const approved = R.map(obj => obj.approved, objs[0]); 
      return R.map(obj => {
          const user = obj.toObject();
          const isApproved = R.contains(user._id.toString(), approved);
          return R.merge(user, { approved: isApproved });
        }, objs[1]);
    });
  }

  fetchUser({ user, email, phone }) {
    return Rx.Observable
      .fromPromise(this.getUser(user, email, phone));
  }

  createUser({ user, password, data }) {
    return this.createSaltAndHash(password)
      .flatMap(obj => this._createUser({
        user, salt: obj.salt, hash: obj.hash, data
      }));
  }

  _createUser({ user, salt, hash, data }) {
    return Rx.Observable
      .fromPromise(this.addUser(user, salt, hash, data));
  }

  updateUser({ admin, user, password, data }) {
    const isAdmin = !!admin;
    const isData = !!data;
    return isAdmin
      ? this._updateUser({ admin, data })
        .flatMap(() => this.fetchUser({ user: data.user }))
      : isData
        ? this.createSaltAndHash(password).flatMap(obj => 
            this._updateUser({
              user, salt: obj.salt, hash: obj.hash, data
            })).flatMap(() => this.fetchUser({ user }))
        : this.createSaltAndHash(password).flatMap(obj => 
            this._updateUser({
              user, salt: obj.salt, hash: obj.hash
            })).flatMap(() => this.fetchUser({ user }));
  }

  _updateUser({ user, salt, hash, data }) {
    return Rx.Observable
      .fromPromise(this.replaceUser(user, salt, hash, data));
  }

  createSaltAndHash(password, salt) {
    return Rx.Observable.fromPromise(this.getSaltAndHash(password, salt));
  }

  deleteUser({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeUser.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return Rx.Observable.forkJoin(observables);
  }

  sendmail({ admin, ids }) {
    let messages = [];
    const sender = 'info@example.com';
    return this.fetchSelected(admin)
    .flatMap(objs => this.forMessage(admin, objs))
    .map(arr => { messages = arr; })
    .flatMap(() => this.forAddress(admin, ids))
    .map(maillist => this.setMessage(sender, maillist, messages))
    .flatMap(objs => this.postMessages(objs));
  }

  forAddress(admin, ids) {
    const observables = R.map(id => this.fetchAddress(admin, id), ids);
    return Rx.Observable.forkJoin(observables);
  }

  forMessage(admin, objs) {
    const observables =
      R.map(obj => this.fetchMessage(admin, obj.selected), objs);
    return Rx.Observable.forkJoin(observables);
  }

  fetchAddress(admin, id) {
    return Rx.Observable.fromPromise(this.getAddress(admin, id));
  }

  fetchMessage(admin, id) {
    log.trace(admin, id);
    return Rx.Observable.fromPromise(this.getMessage(admin, id));
  }

  fetchSelected(admin) {
    return Rx.Observable.fromPromise(this.getSelected(admin));
  }

  postMessages(objs) {
    return Sendmail.of(mail_keyset).createMessages(objs);
  }

  setMessage(sender, maillist, messages) {
   return R.map(obj => ({
      from:       sender
      , to:       sender
      , bcc:      maillist
      , subject:  obj.title
      , text:     obj.body
    }), messages);
  }

  createApproval({ admin, ids }) {
    const _promise = R.curry(this.addApproval.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, ids);
    return Rx.Observable.forkJoin(observables);
  }

  deleteApproval({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeApproval.bind(this));
    const observable = id => Rx.Observable
      .fromPromise(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return Rx.Observable.forkJoin(observables);
  }

  fetchAdmin({ admin, id }) {
    return Rx.Observable.fromPromise(this.getAdmin(admin, id));
  }

  createAdmin({ admin }) {
    const data = {
      from: mms_from
    , agreement: 'http://www.example.com'
    , menu: { num1: 9999, num2: 300, num3: 50, num4: 20 }
    , advertisement: {
        url1: 'http://www1.example.com'
      , url2: 'http://www2.example.com'
      , url3: 'http://www3.example.com'
      , url4: 'http://www4.example.com'
      }
    };
    return Rx.Observable.fromPromise(this.addAdmin(admin, data));
  }

  updateAdmin({ admin, id, data }) {
    return Rx.Observable.fromPromise(this.replaceAdmin(admin, id, data));
  }

  deleteAdmin({ admin, id }) {
    return Rx.Observable.fromPromise(this.removeAdmin(admin, id));
  }
};
