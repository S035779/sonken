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
      case 'fetch/user':
        return new Promise((resolve, reject) => {
          User.findOne({
            email: options.email
          , phone: new RegExp(options.phone + '$')
          }, (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(obj ? obj.user : '');
          });
        });
        break;
      case 'create/user':
        return new Promise((resolve, reject) => {
          const user = new User({
            user:     options.user
          , password: options.password
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
        break;
      case 'signin/admin':
        return new Promise((resolve, reject) => {
          const isAuthenticated = true;
          User.findOneAndUpdate({
            user:     options.user
          , password: options.password
          , isAdmin:  true
          }
          , { isAuthenticated }
          , (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(isAuthenticated);
          })
        });
        break;
      case 'signout/admin':
        return new Promise((resolve, reject) => {
          const isAuthenticated = false;
          User.update({
            user: options.user
          , isAdmin: true
          }
          , { isAuthenticated }
          , (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(isAuthenticated);
          });
        });
      case 'signin/authenticate':
        return new Promise((resolve, reject) => {
          const isAuthenticated = true;
          User.findOneAndUpdate({
            user:     options.user
          , password: options.password
          }
          , { isAuthenticated }
          , (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(isAuthenticated);
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
      case 'signout/authenticate':
        return new Promise((resolve, reject) => {
          const isAuthenticated = false;
          User.update({
            user: options.user
          }
          , { isAuthenticated }
          , (err, obj) => {
            if(err) return reject(err);
            log.trace(request, obj);
            resolve(isAuthenticated);
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

  getUser(email, phone) {
    return this.request('fetch/user', { email, phone });
  }

  addUser(user, password, data) {
    return this.request('create/user', { user, password, data })
  }

  replaceUser(user, password) {
    return this.request('update/user', { user, password });
  }

  removeUser(user) {
    return this.request('delete/user', { user });
  }

  logInAdmin(admin, password) {
    return this.request('signin/admin', { admin, password });
  }

  logOutAdmin(user) {
    return this.request('signout/admin', { admin });
  }

  logIn(user, password) {
    return this.request('signin/authenticate', { user, password });
  }

  logOut(user) {
    return this.request('signout/authenticate', { user });
  }

  authAdmin({ admin, password }) {
    return Rx.Observable.fromPromise(this.logInAdmin(admin, password));
  }

  signoutAdmin({ admin }) {
    return Rx.Observable.fromPromise(this.logOutAdmin(admin));
  }

  authenticate({ user, password }) {
    return Rx.Observable.fromPromise(this.logIn(user, password));
  }

  signout({ user }) {
    return Rx.Observable.fromPromise(this.logOut(user));
  }

  fetchUser({ email, phone }) {
    return Rx.Observable.fromPromise(this.getUser(email, phone));
  }

  createUser({ user, password, data }) {
    return Rx.Observable.fromPromise(this.addUser(user, password, data));
  }

  updateUser({ user, password }) {
    return Rx.Observable.fromPromise(this.replaceUser(user, password));
  }

  deleteUser({ user }) {
    return Rx.Observable.fromPromise(this.removeUser(user));
  }
};
