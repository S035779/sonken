import R from 'ramda';
import Rx from 'rx';
import mongoose from 'mongoose';
import { Users } from 'Models/profiles';
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
    //this.logTrace('users:', users);
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
      case 'signin/iuser':
        return new Promise((resolve, reject) => {
          const response = R.compose(
            () => isAuth(users)
          , setUsers
          , R.flatten
          , R.map(setAuth)
          , R.filter(isPas)
          , R.filter(isUsr)
          );
          resolve(response(users));
        });
        break;
      case 'signout/user':
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

  confirmUser(email, phone) {
    return this.request('confirm/user', { email, phone });
  }

  createUser(user, password, data) {
    return this.request('create/user', { user, password, data })
  }

  updatePass(user, password) {
    return this.request('update/password', { user, password });
  }

  logIn(user, password) {
    return this.request('signin/user', { user, password });
  }

  logOut(user) {
    return this.request('signout/user', { user });
  }

  authenticate({ user, password }) {
    return Rx.Observable.fromPromise(this.logIn(user, password));
  }

  signout({ user }) {
    return Rx.Observable.fromPromise(this.logOut(user));
  }

  confirmation({ email, phone }) {
    return Rx.Observable.fromPromise(this.confirmUser(email, phone));
  }

  regirtration({ user, password, data }) {
    return Rx.Observable
      .fromPromise(this.createUser(user, password, data));
  }

  changePassword({ user, password }) {
    return Rx.Observable.fromPromise(this.updatePass(user, password));
  }

  logTrace(name, message) {
    log.trace('Trace:', name, message);
  }
};
