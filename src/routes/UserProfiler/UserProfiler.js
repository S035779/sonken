import R                from 'ramda';
import Rx               from 'rx';
import mongoose         from 'mongoose';
import { User }         from 'Models/profile';
import std              from 'Utilities/stdutils';
import { logs as log }  from 'Utilities/logutils';

//let users = [{
//  user: 'MyUserName', password: 'Test123$', isAuthenticated: false
//}]

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
    //log.trace(request, options);
    //const setUsers   = objs => { return users = objs };
    //const isUsr   = obj => obj.user === options.user;
    //const isPas = obj => options.password === obj.password;
    //const setAuth = obj => R.map(user => user.user === obj.user
    //  ? Object.assign({}, user, { isAuthenticated: true })
    //  : user ,users);
    //const delAuth = obj => R.map(user => user.user === obj.user
    //  ? Object.assign({}, user, { isAuthenticated: false })
    //  : user ,users);
    //const isAuth = R.compose(
    //  R.head
    //, R.map(obj => obj.isAuthenticated)
    //, R.filter(isUsr)
    //);
    switch(request) {
      case 'fetch/users':
        return new Promise((resolve, reject) => {
          User.find({}, (err, obj) => {
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
              { name: 'Error', message: 'Not found.' });
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
          const isData = !!options.data;
          const conditions = { user: options.user };
          const update = isData
            ? {
              name:   options.data.name
            , kana:   options.data.kana
            , email:  options.data.email
            , phone:  options.data.phone
            , plan:   options.data.plan
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
          const conditions = { user: options.user };
          User.remove(conditions, (err, obj) => {
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
          //const response = R.compose(
          //  () => isAuth(users)
          //, setUsers
          //, R.flatten
          //, R.map(setAuth)
          //, R.filter(isPas)
          //, R.filter(isUsr)
          //);
          //resolve(response(users));
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
          //const response = R.compose(
          //  () => isAuth(users)
          //, setUsers
          //, R.flatten
          ///, R.map(delAuth)
          //, R.filter(isUsr)
          //);
          //resolve(response(users));
        });
      default:
        return new Promise((resolve, reject) => {
          reject({ name: 'Error', message: 'request: ' + request });
        });
        break;
    }
  }

  getSaltAndHash(password, salt) {
    return std.crypto_pbkdf2(password, salt, 256);
  }

  getUsers() {
    return this.request('fetch/users', {});
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

  removeUser(user) {
    return this.request('delete/user', { user });
  }

  signinAdmin(admin, salt, hash) {
    return this.request('signin/admin', { admin, salt, hash });
  }

  signoutAdmin(admin) {
    return this.request('signout/admin', { admin });
  }

  signinUser(user, salt, hash) {
    return this.request('signin/user', { user, salt, hash });
  }

  signoutUser(user) {
    return this.request('signout/user', { user });
  }

  authenticate({ admin, user, password }) {
    const isAdmin = admin !== '';
    const signin = obj => isAdmin
      ? Rx.Observable
        .fromPromise(this.signinAdmin(admin, obj.salt, obj.hash))
      : Rx.Observable
        .fromPromise(this.signinUser(user, obj.salt, obj.hash));
    const options = isAdmin ? { user: admin } : { user: user };
    return this.fetchUser(options)
      .flatMap(obj => this.createSaltAndHash(password, obj.salt))
      .flatMap(obj => signin(obj))
      .flatMap(() => this.fetchUser(options))
      .map(obj => obj.isAuthenticated);
  }

  signout({ admin, user }) {
    const isAdmin = admin !== '';
    const signout = isAdmin 
      ? Rx.Observable.fromPromise(this.signoutAdmin(admin))
      : Rx.Observable.fromPromise(this.signoutUser(user));
    const options = isAdmin ? { user: admin } : { user: user };
    return signout
      .flatMap(() => this.fetchUser(options))
      .map(obj => obj.isAuthenticated);
  }

  fetchUsers() {
    return Rx.Observable.fromPromise(this.getUsers());
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

  updateUser({ user, password, data }) {
    return this.createSaltAndHash(password)
      .flatMap(obj => this._updateUser({ 
        user, salt: obj.salt, hash: obj.hash, data
      }));
  }

  _updateUser({ user, salt, hash, data }) {
    return Rx.Observable
      .fromPromise(this.replaceUser(user, salt, hash, data));
  }

  createSaltAndHash(password, salt) {
    return Rx.Observable.fromPromise(this.getSaltAndHash(password, salt));
  }

  deleteUser({ user }) {
    return Rx.Observable.fromPromise(this.removeUser(user));
  }
};
