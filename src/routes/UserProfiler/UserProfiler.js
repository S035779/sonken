import R from 'ramda';
import Rx from 'rx';
import mongoose from 'mongoose';
import { User } from 'Models/profile';
import { logs as log } from 'Utilities/logutils';

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
    //log.trace('users:', users);
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
          const conditions = options.email
            ? { email: options.email
              , phone: new RegExp(options.phone + '$')}
            : { user: options.user
              , password: options.password };
          User.findOne(conditions, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            const res = {
              user: obj.user
            , isAuthenticated: obj.isAuthenticated
            };
            resolve(res);
          });
        });
        break;
      case 'create/user':
        return new Promise((resolve, reject) => {
          const user = new User({
            user:     options.user
          , salt:     options.salt
          , hash:     options.hash
          , name:     options.data.name
          , kana:     options.data.kana
          , email:    options.data.email
          , phone:    options.data.phone
          , plan:     options.data.plan
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
          User.update({
            user: options.user
          }, {
            password: options.password
          , updated: Date.now()
          }, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj.password);
          });
        });
        break;
      case 'delete/user':
        return new Promise((resolve, reject) => {
          User.remove({
            user: options.user
          }, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
        break;
      case 'signin/admin':
        return new Promise((resolve, reject) => {
          const isAuthenticated = true;
          User.update({
            user:     options.admin
          , password: options.password
          , isAdmin:  true
          }
          , { isAuthenticated }
          , (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          })
        });
        break;
      case 'signout/admin':
        return new Promise((resolve, reject) => {
          const isAuthenticated = false;
          User.update({
            user: options.admin
          , isAdmin: true
          }
          , { isAuthenticated }
          , (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj);
          });
        });
      case 'signin/user':
        return new Promise((resolve, reject) => {
          const isAuthenticated = true;
          User.update({
            user:     options.user
          , password: options.password
          }
          , { isAuthenticated }
          , (err, obj) => {
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
          const isAuthenticated = false;
          User.update({
            user: options.user
          }
          , { isAuthenticated }
          , (err, obj) => {
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
          reject({ name: 'error', message: 'request: ' + request });
        });
        break;
    }
  }

  getSaltAndHash({ password }) {
    return std.crypto_pbkdf2(password, 256);
  }

  getUsers() {
    return this.request('fetch/users', {});
  }

  getUser({ user, password, email, phone }) {
    return this.request('fetch/user', { user, password, email, phone });
  }

  addUser(user, salt, hash, data) {
    return this.request('create/user', { user, salt, hash, data })
  }

  replaceUser(user, password) {
    return this.request('update/user', { user, password });
  }

  removeUser(user) {
    return this.request('delete/user', { user });
  }

  signinAdmin(admin, password) {
    return this.request('signin/admin', { admin, password });
  }

  signoutAdmin(admin) {
    return this.request('signout/admin', { admin });
  }

  signinUser(user, password) {
    return this.request('signin/user', { user, password });
  }

  signoutUser(user) {
    return this.request('signout/user', { user });
  }

  authenticate({ admin, user, password }) {
    const isAdmin = admin !== '';
    const observable = isAdmin
      ? Rx.Observable.fromPromise(this.signinAdmin(admin, password))
      : Rx.Observable.fromPromise(this.signinUser(user, password));
    const options = isAdmin
      ? { user: user , password}
      : { user: admin, password };
    return observable
      .flatMap(() => fetchUser(options))
      .map(obj = obj.isAuthenticated);
  }

  signout({ admin, user }) {
    const isAdmin = admin !== '';
    const observable = isAdmin 
      ? Rx.Observable.fromPromise(this.signoutAdmin(admin))
      : Rx.Observable.fromPromise(this.signoutUser(user));
    return observable
      .flatMap(() => this.fetchUser(options))
      .map(obj => obj.isAuthenticated);
  }

  fetchUsers() {
    return Rx.Observable.fromPromise(this.getUsers());
  }


  fetchUser(options) {
    return Rx.Observable.fromPromise(this.getUser(options));
  }

  createUser({ user, password, data }) {
    return this.createSaltAndHash(password)
      .flatMap(obj => this._createUser(user, obj.salt, obj.hash, data));
  }

  _createUser({ user, salt, hash, data }) {
    return Rx.Observable
      .fromPromise(this.addUser(user, salt, hash, data));
  }

  createSaltAndHash({ password }) {
    return Rx.Observable.fromPromise(this.getSaltAndHash(password));
  }

  updateUser({ user, password }) {
    return Rx.Observable.fromPromise(this.replaceUser(user, password));
  }

  deleteUser({ user }) {
    return Rx.Observable.fromPromise(this.removeUser(user));
  }
};
