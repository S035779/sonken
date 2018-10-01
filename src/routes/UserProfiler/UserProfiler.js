import dotenv                     from 'dotenv';
import * as R                     from 'ramda';
import { from, forkJoin }         from 'rxjs';
import { map, flatMap }           from 'rxjs/operators';
import { User, Approved, Admin }  from 'Models/profile';
import { Mail, Selected }         from 'Models/mail';
import std                        from 'Utilities/stdutils';
import Sendmail                   from 'Utilities/Sendmail';
import log                        from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error();
const node_env    = process.env.NODE_ENV;
const app_name    = process.env.APP_NAME;
const admin_user  = process.env.ADMIN_USER;
const admin_pass  = process.env.ADMIN_PASS;
const mms_from    = process.env.MMS_FROM;
const smtp_port   = process.env.MMS_PORT;
const ssmtp_port  = process.env.MMS_SSL;
const isSSL       = ssmtp_port ? true : false;
const mail_keyset = {
  host:   process.env.MMS_HOST
, secure: isSSL
, port:   isSSL ? ssmtp_port : smtp_port
, auth: {
    user: process.env.MMS_USER
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
    this.createMenu({ admin: admin_user }).subscribe(
        obj => log.info(UserProfiler.displayName, obj)
      , err => log.warn(UserProfiler.displayName, err.name, err.message)
      , ()  => log.info(UserProfiler.displayName, 'Complete to create Menu!!'));
    this.createAdmin({ admin: admin_user, password: admin_pass }).subscribe(
        obj => log.info(UserProfiler.displayName, obj)
      , err => log.warn(UserProfiler.displayName, err.name, err.message)
      , ()  => log.info(UserProfiler.displayName, 'Complete to create Administrator!!'));
  }

  static of() {
    return new UserProfiler();
  }

  request(request, options) {
    switch(request) {
      case 'fetch/users':
        return new Promise((resolve, reject) => {
          User.find({}).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'signin/user':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user, salt: options.salt, hash: options.hash };
          const update = { isAuthenticated: true };
          User.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          })
        });
      case 'signout/user':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.user };
          const update = { isAuthenticated: false };
          User.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          const isUser = options.user !=='';
          const isEmail = !!options.email;
          if(!isUser) 
            return reject({ name: 'Request error', message: 'The user name is not included in the request.' });
          const conditions = isEmail
            ? { email: options.email, phone: new RegExp(options.phone + '$') } : { user: options.user };
          User.findOne(conditions).exec((err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject({ name: 'Request error', message: 'User not found for request.' });
            log.info(UserProfiler.displayName, 'fetchUser', obj);
            resolve(obj);
          });
        });
      case 'create/user':
        return new Promise((resolve, reject) => {
          const isAdmin = !!options.admin;
          const create = isAdmin ? {
              user:   options.admin
            , isAdmin:  true
            , salt:   options.salt
            , hash:   options.hash
            , name:   options.data.name
            , kana:   options.data.kana
            , email:  options.data.email
            , phone:  options.data.phone
            , plan:   options.data.plan
            } : {
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
          const user = new User(create);
          user.save((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'update/user':
        return new Promise((resolve, reject) => {
          const isAdmin = !!options.admin;
          const isData = !!options.data;
          const isPass = !!options.hash && !!options.salt;
          let conditions = isAdmin ? { user: options.data.user } : { user: options.user };
          let update = isAdmin && isData ? {
              isAdmin:  options.data.isAdmin
            , name:     options.data.name
            , kana:     options.data.kana
            , email:    options.data.email
            , phone:    options.data.phone
            , plan:     options.data.plan
            , updated:  new Date
            } : isData && isPass 
              ? {
                name:   options.data.name
              , kana:   options.data.kana
              , email:  options.data.email
              , phone:  options.data.phone
              , plan:   options.data.plan
              , salt:   options.salt
              , hash:   options.hash
              , updated: new Date
              } : isData
                ? {
                  name:   options.data.name
                , kana:   options.data.kana
                , email:  options.data.email
                , phone:  options.data.phone
                , plan:   options.data.plan
                , updated: new Date
                } : {
                  salt:   options.salt
                , hash:   options.hash
                , updated: new Date
                };
          User.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/user':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'mail/address':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          User.findOne(conditions).exec((err, obj) => {
            if(err) return reject(err);
            if(obj === null) return reject( { name: 'Error', message: 'User not found.' });
            resolve(obj.email);
          });
        });
      case 'mail/selected':
        return new Promise((resolve, reject) => {
          Selected.find({}).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'mail/message':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.id };
          Mail.findOne(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'create/approval':
        return new Promise((resolve, reject) => {
          const conditions  = { approved: options.id };
          const update      = { approved: options.id };
          Approved.update(conditions, update, { upsert: true }).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'delete/approval':
        return new Promise((resolve, reject) => {
          const conditions = { approved: options.id };
          Approved.remove(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/approval':
        return new Promise((resolve, reject) => {
          const isId = !!options.id;
          const conditions = isId ? { approved: options.id } : {};
          Approved.find(conditions).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'signin/admin':
        return new Promise((resolve, reject) => {
          const conditions = {
            user: options.admin
          , salt: options.salt
          , hash: options.hash
          , isAdmin: true
          };
          const update = { isAuthenticated: true };
          User.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          })
        });
      case 'signout/admin':
        return new Promise((resolve, reject) => {
          const conditions = { user: options.admin, isAdmin: true };
          const update = { isAuthenticated: false };
          User.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      case 'fetch/preference':
        return new Promise((resolve, reject) => {
          Admin.findOne({}).exec((err, obj) => {
            if(err) return reject(err);
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
            resolve(obj);
          });
        });
      case 'update/preference':
        return new Promise((resolve, reject) => {
          const conditions = { _id: options.data._id };
          const update = {
            appname:        options.data.appname
          , from:           options.data.from
          , menu:           options.data.menu
          , advertisement:  options.data.advertisement
          , updated:        new Date
          };
          Admin.update(conditions, update).exec((err, obj) => {
            if(err) return reject(err);
            resolve(obj);
          });
        });
      default:
        return new Promise((resolve, reject) => reject({ name: 'Error', message: 'request: ' + request }));
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

  getApproval(id) {
    return this.request('fetch/approval', { id });
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
      ? from(this.signinAdmin(admin, obj.salt, obj.hash))
      : from(this.signinUser(user, obj.salt, obj.hash));
    const options = isAdmin ? { user: admin } : { user: user };
    return this.fetchUser(options).pipe(
      flatMap(obj => this.createSaltAndHash(password, obj.salt))
    , flatMap(obj => observable(obj))
    , flatMap(() => this.fetchUser(options))
    , flatMap(obj => this.fetchApproved(obj))
    )
    ;
  }

  fetchApproved(user) {
    const id = user._id.toString();
    const isId = obj => obj && obj.approved === id;
    const observable = from(this.getApproval(id));
    return observable.pipe(
      map(obj => isId(obj[0]) && user.isAuthenticated)
    );
  }

  signout({ admin, user }) {
    const isAdmin = admin !== '';
    const observable = isAdmin 
      ? from(this.signoutAdmin(admin))
      : from(this.signoutUser(user));
    const options = isAdmin ? { user: admin } : { user: user };
    return observable.pipe(
      flatMap(() => this.fetchUser(options))
    , map(obj => obj.isAuthenticated)
    );
  }

  fetchUsers({ admin }) {
    const observables = forkJoin([
      this.getApproval()
    , this.getUsers(admin)
    ]);
    const setAttribute = objs => R.compose(
      this.setApproved(objs[0])
    , this.toObject
    )(objs[1]);
    return observables.pipe(
      map(setAttribute)
    );
  }

  toObject(objs) {
    return R.isNil(objs) ? [] : R.map(obj => obj.toObject(), objs);
  }

  setApproved(approved) {
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
    return from(this.getUser(user, email, phone));
  }

  createUser({ user, password, data }) {
    const setUser = obj => 
      this._createUser({ user, salt: obj.salt, hash: obj.hash, data })
    return this.createSaltAndHash(password).pipe(
      flatMap(setUser)
    );
  }

  _createUser({ user, salt, hash, data }) {
    return from(this.addUser(user, salt, hash, data));
  }

  updateUser({ admin, user, password, data }) {
    const isPass = !!password;
    const isAdmin = !!admin;
    const isData = !!data;
    //log.debug(isAdmin, isData, isPass);
    if(isPass && isData) return this.createSaltAndHash(password).pipe(
        flatMap(obj => 
          this._updateUser({ user, salt: obj.salt, hash: obj.hash, data}))
      , flatMap(() => this.fetchUser({ user }))
      );

    if(isAdmin && isData) return this._updateUser({ admin, data }).pipt(
        flatMap(() => this.fetchUser({ user: data.user }))
      );
    
    if(isData) return this._updateUser({ user, data }).pipe(
        flatMap(() => this.fetchUser({ user }))
      );
    
    if(isPass) return this.createSaltAndHash(password).pipe(
        flatMap(obj => 
          this._updateUser({ user, salt: obj.salt, hash: obj.hash}))
      , flatMap(() => this.fetchUser({ user }))
      );
  }

  _updateUser({ admin, user, salt, hash, data }) {
    return from(this.replaceUser(admin, user, salt, hash, data));
  }

  createSaltAndHash(password, salt) {
    return from(this.getSaltAndHash(password, salt));
  }

  deleteUser({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeUser.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return forkJoin(observables);
  }

  sendmail({ admin, ids }) {
    const observables = objs => forkJoin([
      this.fetchPreference()
    , this.forAddress(admin, ids)
    , this.forMessage(admin, objs)
    ]);
    return this.fetchSelected(admin).pipe(
      flatMap(objs => observables(objs))
    , map(objs => this.setMessage(objs[0], objs[1], objs[2]))
    , flatMap(objs => this.postMessages(objs))
    );
  }

  inquiry({ user, data }) {
    const observables = obj => forkJoin([ 
      this.getPreference()
    , this.getUser(obj) 
    ]);
    return observables(user).pipe(
      map(objs => this.setInquiry(objs[0], objs[1], data))
    , flatMap(obj => this.postMessage(obj))
    );
  }
  
  setInquiry(sender, user, message) {
    return {
      from:     sender.from
    , to:       user.email
    , subject:  `(${app_name})`
      + ` ${user.name} 様より問合せがありました。` 
    , text:     `氏    名： ${user.name}\n`
      + `アドレス： ${user.email}\n`
      + `ユーザID： ${user.user}\n`
      + `タイトル： ${message.title}\n`
      + `問い合せ： ${message.body}\n\n`
      + `-------------------------------\n`
      + `${app_name}\n`
    };
  }

  forAddress(admin, ids) {
    const observables = R.map(id => this.fetchAddress(admin, id), ids);
    return forkJoin(observables);
  }

  forMessage(admin, objs) {
    const observables =
      R.map(obj => this.fetchMessage(admin, obj.selected), objs);
    return forkJoin(observables);
  }

  fetchAddress(admin, id) {
    return from(this.getAddress(admin, id));
  }

  fetchMessage(admin, id) {
    return from(this.getMessage(admin, id));
  }

  fetchSelected(admin) {
    return from(this.getSelected(admin));
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
        ? [{ filename: 'content.zip', content: Buffer.from(obj.file) }]
        : null;
      return attachments
        ? Object.assign({}, message, { attachments }) : message;
    }
    return R.compose(R.map(setMessage), R.filter(obj => !!obj))(messages);
  }

  createApproval({ admin, ids }) {
    const _promise = R.curry(this.addApproval.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, ids);
    return forkJoin(observables);
  }

  deleteApproval({ admin, ids }) {
    const _ids = R.split(',', ids);
    const _promise = R.curry(this.removeApproval.bind(this));
    const observable = id => from(_promise(admin, id));
    const observables = R.map(observable, _ids);
    return forkJoin(observables);
  }

  fetchPreference() {
    return from(this.getPreference());
  }

  createPreference({ admin }) {
    let plan;
    switch(node_env) {
      case 'production':
        plan = this.productionMenu();
        break;
      case 'staging':
        plan = this.stagingMenu();
        break;
      default:
        plan = this.stagingMenu();
        break;
    }
    return from(this.addPreference(admin, plan));
  }

  updatePreference({ admin, data }) {
    return from(this.replacePreference(admin, data)).pipe(
      flatMap(() => this.fetchPreference({ admin }))
    );
  }

  deletePreference({ admin, id }) {
    return from(this.removePreference(admin, id));
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
    return this.createSaltAndHash(password).pipe(
      flatMap(obj => this._createAdmin(setAdmin(obj)))
    );
  }

  _createAdmin({ admin, salt, hash, data }) {
    return from(this.addAdmin(admin, salt, hash, data));
  }

  createMenu({ admin }) {
    let plan;
    switch(node_env) {
      case 'production':
        plan = this.productionMenu();
        break;
      case 'staging':
        plan = this.stagingMenu();
        break;
      default:
        plan = this.stagingMenu();
        break;
    }
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
    const setMenu  = obj => ({
      _id:            obj._id
    , appname:        plan.appname 
    , from:           plan.from
    , menu:           plan.menu
    , advertisement:  plan.advertisement
    });

    const observable1 = forkJoin([
      this.fetchUsers({ admin })
    , this.fetchPreference({ admin })
    ]);
    const observable2 = objs => forkJoin([
      this.updateUsers(objs[0])
    , this.updatePreference({ admin, data: objs[1] })
    ]);
    return observable1.pipe(
      map(objs => ([setPlans(objs), setMenu(objs[1])]))
    , flatMap(objs => observable2(objs))
    //, map(R.tap(log.debug.bind(this)))
    );
  }

  updateUsers(users) {
    const promises = R.map(obj => this.updateUser({ user: obj.user, data: obj.data }));
    return forkJoin(promises(users));
  }

  productionMenu() {
    return {
      appname: app_name
    , from: mms_from
    , menu: [
        { id: '0001', name: 'リスト  500（月払）（税込980 円）'
        , number: 250
        , price: 980,   link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=GFG9P9PNRSKVS' }
      , { id: '0002', name: 'リスト 1000（月払）（税込1580 円）'
        , number: 500
        , price: 1580,  link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=VQCL9U88ZRX4S' }
      , { id: '0003', name: 'リスト 2500（月払）（税込1980 円）'
        , number: 1250
        , price: 1980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=58NFUNXEUKDJ2' }
      , { id: '0004', name: 'リスト 5000（月払）（税込3980 円）'
        , number: 2500
        , price: 3980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=BFBCTGES3H5ME' }
      , { id: '0005', name: 'リスト 7500（月払）（税込4980 円）'
        , number: 3750
        , price: 4980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=ATSKP3DRXKBCG' }
      , { id: '0006', name: 'リスト10000（月払）（税込5980 円）'
        , number: 5000
        , price: 5980,  link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=MWVH6EQRB7UP8' }
      , { id: '0007', name: 'リスト 5000（半年払）（税込19800 円）'
        , number: 2500
        , price: 19800, link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=K588XS2F9X8TG' }
      , { id: '0008', name: 'リスト 7500（半年払）（税込24800 円）'
        , number: 3750
        , price: 24800, link: 'https://www.paypal.com/cgi-bin/webscr?'
          + 'cmd=_s-xclick&hosted_button_id=XCEEMUTH5PLTS' }
      , { id: '0009', name: 'リスト10000（半年払）（税込29800 円）'
        , number: 5000
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

  stagingMenu() {
    return {
      appname: app_name
    , from: mms_from
    , menu: [
        { id: '0001', name: 'リスト  3（無料)',     number: 3
        , price: 0,   link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=XXXXXXXXXXXXX' }
      , { id: '0002', name: 'リスト  5（無料)',     number: 5
        , price: 0,   link: 'https://www.paypal.com/cgi-bin/webscr?'
            + 'cmd=_s-xclick&hosted_button_id=XXXXXXXXXXXXX' }
      ]
    , advertisement: {
        url1: '/advertisement1.html'
      , url2: '/advertisement2.html'
      , url3: '/advertisement3.html'
      , url4: '/advertisement4.html'
      }
    };
  }
}
UserProfiler.displayName = 'UserProfiler';
