import R from 'ramda';
import Rx from 'rx';
import mongoose from 'mongoose';
import { User } from 'Models/profile';
import { logs as log } from 'Utilities/logutils';

let users = [{
  user: 'MyUserName', password: 'Test123$', isAuthenticated: false
}]

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
    log.trace('users:', users);
    const setUsers   = objs => { return users = objs };
    const isUsr   = obj => obj.user === options.user;
    const isPas = obj => options.password === obj.password;
    const setAuth = obj => R.map(user => user.user === obj.user
      ? Object.assign({}, user, { isAuthenticated: true })
      : user ,users);
    const delAuth = obj => R.map(user => user.user === obj.user
      ? Object.assign({}, user, { isAuthenticated: false })
      : user ,users);
    const isAuth = R.compose(
      R.head
    , R.map(obj => obj.isAuthenticated)
    , R.filter(isUsr)
    );

    switch(request) {
      case 'fetch/user':
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
            console.log(obj);
            resolve(obj);
          });
        });
        break;
      case 'update/user':
        break;
      case 'delete/user':
        break;
      case 'signin/authenticate':
        return new Promise((resolve, reject) => {
          User.find({ user: options.user }, (err, obj) => {
            if(err) return reject(err);
            console.log(obj);
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
      case 'signout/authenticate':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => isAuth(users)
          , setUsers
          , R.flatten
          , R.map(delAuth)
          , R.filter(isUsr)
          );
          resolve(response(users));
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

  logIn(user, password) {
    return this.request('signin/authenticate', { user, password });
  }

  logOut(user) {
    return this.request('signout/authenticate', { user });
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
