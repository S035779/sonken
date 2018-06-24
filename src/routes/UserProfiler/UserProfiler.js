import dotenv             from 'dotenv';
import R                  from 'ramda';
import Rx                 from 'rxjs/Rx';
import mongoose           from 'mongoose';
import { User, Approved, Admin }
                          from 'Models/profile';
import { Mail, Selected } from 'Models/mail';
import std                from 'Utilities/stdutils';
import Sendmail           from 'Utilities/Sendmail';
import { logs as log }    from 'Utilities/logutils';

dotenv.config()
const app_name = process.env.APP_NAME;
const admin_user = process.env.ADMIN_USER;
const admin_pass = process.env.ADMIN_PASS;
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
    this.updateMenu({ admin: admin_user })
      .subscribe(
        obj => { log.info(obj); }
      , err => { log.warn('Failed to update the menu.'); }
      , ( ) => { log.info('Complete to create Administrator!!'); }
      );
    this.createAdmin({ admin: admin_user, password: admin_pass })
      .subscribe(
        obj => { log.info(obj); }
      , err => { log.warn('Adminitrator has already registered.'); }
      , ( ) => { log.info('Complete to create Administrator!!'); }
      );
  }

  static of() {
    return new UserProfiler();
  }

  request(request, options) {
    //log.debug(request, options);
    switch(request) {
      case 'fetch/users':
        return new Promise((resolve, reject) => {
          const conditions = {};
          User.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
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
            //log.trace(request, obj);
            resolve(obj);
          })
        });
      case 'signout/user':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          const update = { isAuthenticated: false };
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const isUser = options.user !=='';
          const isEmail = !!options.email;
          if(!isUser) return reject({
            name: 'Error', message: 'Request error.'
          });
          const conditions = isEmail
            ? {
              email: options.email
            , phone: new RegExp(options.phone + '$')
            }
            : {
              user: options.user
            };
          User.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject({
              name: 'Error', message: 'User not found.'
            });
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/user':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const isAdmin = !!options.admin;
          const create = isAdmin 
            ? {
              user:   options.admin
            , isAdmin:  true
            , salt:   options.salt
            , hash:   options.hash
            , name:   options.data.name
            , kana:   options.data.kana
            , email:  options.data.email
            , phone:  options.data.phone
            , plan:   options.data.plan
            }
            : {
              user:   options.user
            , isAdmin:  false
            , salt:   options.salt
            , hash:   options.hash
            , name:   options.data.name
            , kana:   options.data.kana
            , email:  options.data.email
            , phone:  options.data.phone
            , plan:   options.data.plan
            };
          //log.debug(isAdmin, create);
          const user = new User(create);
          user.save((err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'update/user':
        return new Promise((resolve, reject) => {
          //log.debug(request, options);
          const isAdmin = !!options.admin;
          const isData = !!options.data;
          const isPass = !!options.hash && !!options.salt;
          //log.debug(isAdmin, isData, isPass, isAdmin && isData);
          let conditions = isAdmin
            ? { user: options.data.user }
            : { user: options.user };
          let update = isAdmin && isData
            ? {
              isAdmin:  options.data.isAdmin
            , name:     options.data.name
            , kana:     options.data.kana
            , email:    options.data.email
            , phone:    options.data.phone
            , plan:     options.data.plan
            , updated:  new Date
            }
            : isData && isPass 
              ? {
                name:   options.data.name
              , kana:   options.data.kana
              , email:  options.data.email
              , phone:  options.data.phone
              , plan:   options.data.plan
              , salt:   options.salt
              , hash:   options.hash
              , updated: new Date
              }
              : isData
                ? {
                  name:   options.data.name
                , kana:   options.data.kana
                , email:  options.data.email
                , phone:  options.data.phone
                , plan:   options.data.plan
                , updated: new Date
                }
                : {
                  salt:   options.salt
                , hash:   options.hash
                , updated: new Date
                };
          //log.debug(conditions, update);
          User.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/user':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'mail/address':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject(
              { name: 'Error', message: 'User not found.' });
            //log.trace(request, obj);
            resolve(obj.email);
          });
        });
      case 'mail/selected':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Selected.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'mail/message':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Mail.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/approval':
        return new Promise((resolve, reject) => {
          const conditions = {
            approved: options.id
          };
          const update = {
            approved: options.id
          };
          Approved.update(conditions, update, { upsert: true }
          , (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'delete/approval':
        return new Promise((resolve, reject) => {
          const conditions = {
            approved: options.id
          };
          Approved.remove(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/approval':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Approved.find(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
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
            //log.trace(request, obj);
            resolve(obj);
          })
        });
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
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'fetch/preference':
        return new Promise((resolve, reject) => {
          const conditions = {};
          Admin.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'create/preference':
        return new Promise((resolve, reject) => {
          const admin = new Admin({
            appname:        options.data.appname
          , from:           options.data.from
          , menu:           options.data.menu
          , advertisement:  options.data.advertisement
          });
          admin.save((err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'update/preference':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.data._id };
          const update = {
            from:           options.data.from
          , menu:           options.data.menu
          , advertisement:  options.data.advertisement
          , updated:        new Date
          };
          Admin.update(conditions, update, (err, obj) => {
            if(err) return reject(err);
            //log.trace(request, obj);
            resolve(obj);
          });
        });
      //case 'delete/preference':
      //  return new Promise((resolve, reject) => {
      //    const conditions = { _id: options.id };
      //    User.findOneAndRemove(conditions, (err, obj) => {
      //      if(err) return reject(err);
      //      log.trace(request, obj);
      //      resolve(obj);
      //    });
      //  });
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'Error', message: 'request: ' + request });
        });
    }
  }

  getPreference() {
    return this.request('fetch/preference');
  }

  addPreference(admin, data) {
    return this.request('create/preference', { admin, data });
  }

  replacePreference(admin, data) {
    return this.request('update/preference', { admin, data });
  }

  removePreference(admin, id) {
    return this.request('delete/preference', { admin,id });
  }

  getSaltAndHash(password, salt) {
    return std.crypto_pbkdf2(password, salt, 256);
  }

  getUser(user, email, phone) {
    return this.request('fetch/user', { user, email, phone });
  }

  addAdmin(admin, salt, hash, data) {
    return this.request('create/user', { admin, salt, hash, data })
  }

  addUser(user, salt, hash, data) {
    return this.request('create/user', { user, salt, hash, data })
  }

  replaceUser(admin, user, salt, hash, data) {
    return this.request('update/user', { admin, user, salt, hash, data });
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
    const observables = Rx.Observable.forkJoin([
      this.getApproval(admin)
    , this.getUsers(admin)
    ]);
    const setAttribute = objs => R.compose(
      this.setApproved(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.map(setAttribute);
  }

  toObject(objs) {
    return R.isNil(objs) ? [] : R.map(obj => obj.toObject(), objs);
  }

  setApproved(approved) {
    //log.trace('setApproved', approved);
    const ids = 
      objs => R.isNil(objs) ? [] : R.map(obj => obj.approved, objs);
    const isId = id => R.contains(id, ids(approved));
    const _setApproved =
      obj => R.merge(obj, { approved: isId(obj._id.toString()) });
    const results = 
      objs => R.isNil(objs) ? [] : R.map(_setApproved, objs);
    return results;
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
    const isPass = !!password;
    const isAdmin = !!admin;
    const isData = !!data;
    //log.debug(isAdmin, isData, isPass);
    if(isPass && isData) return this.createSaltAndHash(password)
      .flatMap(obj => 
        this._updateUser({ user, salt: obj.salt, hash: obj.hash, data}))
      .flatMap(() => this.fetchUser({ user }))

    if(isAdmin && isData) return this._updateUser({ admin, data })
      .flatMap(() => this.fetchUser({ user: data.user }));
    
    if(isData) return this._updateUser({ user, data })
      .flatMap(() => this.fetchUser({ user }));
    
    if(isPass) return this.createSaltAndHash(password)
      .flatMap(obj => 
        this._updateUser({ user, salt: obj.salt, hash: obj.hash}))
      .flatMap(() => this.fetchUser({ user }))
  }

  _updateUser({ admin, user, salt, hash, data }) {
    return Rx.Observable
      .fromPromise(this.replaceUser(admin, user, salt, hash, data));
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
    const observables = objs => Rx.Observable.forkJoin([
      this.fetchPreference()
    , this.forAddress(admin, ids)
    , this.forMessage(admin, objs)
    ]);
    return this.fetchSelected(admin)
      .flatMap(objs => observables(objs))
      .map(objs => this.setMessage(objs[0], objs[1], objs[2]))
      .flatMap(objs => this.postMessages(objs));
  }

  inquiry({ user, data }) {
    return Rx.Observable
      .forkJoin([ this.getPreference(), this.getUser(user) ])
      .map(objs => this.setInquiry(objs[0], objs[1], data))
      .flatMap(obj => this.postMessage(obj));
  }
  
  setInquiry(sender, user, message) {
    return {
      from:     sender.from
    , to:       user.email
    , subject:  '(ヤフオク！RSSリーダ)'
      + ` ${user.name} 様より問合せがありました。` 
    , text:
        `氏　　名： ${user.name}\n`
      + `アドレス： ${user.email}\n`
      + `ユーザID： ${user.user}\n`
      + `タイトル： ${message.title}\n`
      + `問い合せ： ${message.body}\n\n`
      + `-------------------------------\n`
      + `ヤフオク！RSSリーダー\n`
    };
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
    //log.trace(admin, id);
    return Rx.Observable.fromPromise(this.getMessage(admin, id));
  }

  fetchSelected(admin) {
    return Rx.Observable.fromPromise(this.getSelected(admin));
  }

  postMessages(objs) {
    return Sendmail.of(mail_keyset).createMessages(objs);
  }

  postMessage(obj) {
    return Sendmail.of(mail_keyset).createMessage(obj);
  }

  setMessage(sender, maillist, messages) {
    const setMessage = obj => {
      const message = {
          from:     sender.from
        , to:       sender.from
        , bcc:      maillist
        , subject:  obj.title
        , text:     obj.body
      };
      const attachments = obj.file
        ? [{ filename: 'content.zip', content: new Buffer(obj.file) }]
        : null;
      return attachments
        ? Object.assign({}, message, { attachments }) : message;
    }
    return R.compose(R.map(setMessage), R.filter(obj => !!obj))(messages);
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

  fetchPreference() {
    return Rx.Observable.fromPromise(this.getPreference());
  }

  createPreference({ admin }) {
    const data = this.setPreference();
    return Rx.Observable.fromPromise(this.addPreference(admin, data));
  }

  updatePreference({ admin, data }) {
    return Rx.Observable.fromPromise(this.replacePreference(admin, data))
    .flatMap(() => this.fetchPreference({ admin }));
  }

  deletePreference({ admin, id }) {
    return Rx.Observable.fromPromise(this.removePreference(admin, id));
  }

  createAdmin({ admin, password }) {
    const setAdmin = obj => ({
      admin
    , salt: obj.salt
    , hash: obj.hash
    , data: {
        name: '管理者'
      , kana: 'カンリシャ'
      , email: mms_from
      , phone: '090-1234-5678'
      , plan: 1
      }
    });
    return this.createSaltAndHash(password)
      .flatMap(obj => this._createAdmin(setAdmin(obj)));
  }

  _createAdmin({ admin, salt, hash, data }) {
    return Rx.Observable
      .fromPromise(this.addAdmin(admin, salt, hash, data));
  }

  updateMenu({ admin }) {
    const setPlans = objs => {
      const isPlan  = obj => R.find(R.propEq('name', obj.plan))(objs[1].menu);
      const setPlan = obj => isPlan(obj) ? isPlan(obj).id : obj.plan;
      const setUser = obj => ({
        user: obj.user
      , data: { 
          name: obj.name
        , kana: obj.kana
        , email: obj.email
        , phone: obj.phone
        , plan: setPlan(obj)
        }
      });
      return R.map(obj => setUser(obj), objs[0])
    };

    const new_plan = this.setPreference();
    const setMenu  = obj => ({
      _id:            obj._id
    , menu:           new_plan.menu
    , from:           new_plan.from
    , advertisement:  new_plan.advertisement
    });

    const observable1 = Rx.Observable.forkJoin([
      this.fetchUsers({ admin })
    , this.fetchPreference({ admin })
    ]);
    const observable2 = objs => Rx.Observable.forkJoin([
      this.updateUsers(objs[0])
    , this.updatePreference({ admin, data: objs[1] })
    ]);
    return observable1
      .map(objs => ([setPlans(objs), setMenu(objs[1])]))
      .flatMap(objs => observable2(objs))
      //.map(R.tap(log.debug.bind(this)))
    ;
  }

  updateUsers(users) {
    const promises = R.map(obj => this.updateUser({ user: obj.user, data: obj.data }));
    return Rx.Observable.forkJoin(promises(users));
  }

  setPreference() {
    return {
      appname: app_name
    , from: mms_from
    , menu: [
        { id: '0001', name: 'リスト  500（月払  ：  980 円）',   number: 500
        , price: 980,   link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=GFG9P9PNRSKVS' }
      , { id: '0002', name: 'リスト 1000（月払  ： 1580 円）',   number: 1000
        , price: 1580,  link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=VQCL9U88ZRX4S' }
      , { id: '0003', name: 'リスト 2500（月払  ： 1980 円）',   number: 2500
        , price: 1980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=58NFUNXEUKDJ2' }
      , { id: '0004', name: 'リスト 5000（月払  ： 3980 円）',   number: 5000
        , price: 3980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=BFBCTGES3H5ME' }
      , { id: '0005', name: 'リスト 7500（月払  ： 4980 円）',   number: 7500
        , price: 4980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=ATSKP3DRXKBCG' }
      , { id: '0006', name: 'リスト10000（月払  ： 5980 円）',   number: 10000
        , price: 5980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=MWVH6EQRB7UP8' }
      , { id: '0007', name: 'リスト 5000（半年払：19800 円）',   number: 5000
        , price: 19800, link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=K588XS2F9X8TG' }
      , { id: '0008', name: 'リスト 7500（半年払：24800 円）',   number: 7500
        , price: 24800, link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=XCEEMUTH5PLTS' }
      , { id: '0009', name: 'リスト10000（半年払：29800 円）',   number: 10000
        , price: 29800, link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=LZ6XDEFS76GV2' }
      ]
    , advertisement: {
        url1: '/advertisement1.html'
      , url2: '/advertisement2.html'
      , url3: '/advertisement3.html'
      , url4: '/advertisement4.html'
      }
    };
  }

  //oldPreference() {
  //  return {
  //    appname: app_name
  //  , from: mms_from
  //  , menu: [
  //      { id: 1, name: 'リスト500（月払）',     number: 500
  //      , price: 980,   link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=GFG9P9PNRSKVS' }
  //    , { id: 2, name: 'リスト1000（月払）',    number: 1000
  //      , price: 1580,  link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=VQCL9U88ZRX4S' }
  //    , { id: 3, name: 'リスト2500（月払）',    number: 2500
  //      , price: 1980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=58NFUNXEUKDJ2' }
  //    , { id: 4, name: 'リスト5000（月払）',    number: 5000
  //      , price: 3980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=BFBCTGES3H5ME' }
  //    , { id: 5, name: 'リスト7500（月払）',    number: 7500
  //      , price: 4980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=ATSKP3DRXKBCG' }
  //    , { id: 6, name: 'リスト10000（月払）',   number: 10000
  //      , price: 5980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=MWVH6EQRB7UP8' }
  //    , { id: 7, name: 'リスト5000（半年払）',  number: 5000
  //      , price: 19800, link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=K588XS2F9X8TG' }
  //    , { id: 8, name: 'リスト7500（半年払）',  number: 7500
  //      , price: 24800, link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=XCEEMUTH5PLTS' }
  //    , { id: 9, name: 'リスト10000（半年払）', number: 10000
  //      , price: 29800, link: 'https://www.paypal.com/cgi-bin/webscr?'
  //          + 'cmd=_s-xclick&hosted_button_id=LZ6XDEFS76GV2' }
  //    ]
  //  , advertisement: {
  //      url1: '/advertisement1.html'
  //    , url2: '/advertisement2.html'
  //    , url3: '/advertisement3.html'
  //    , url4: '/advertisement4.html'
  //    }
  //  };
  //}
};
