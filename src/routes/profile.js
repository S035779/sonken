import UserProfiler     from 'Routes/UserProfiler/UserProfiler';
import { logs as log }  from 'Utilities/logutils';

const profile = UserProfiler.of();

export default {
  authenticate(options) {
    return (req, res, next) => {
      const { user, password } = req.body;
      profile.authenticate({ user, password }).subscribe(
        obj => {
          if(obj) req.session.user = user;
          console.log('isAuthenticated:', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to Logged in.'); }
      );
    };
  },

  signout(options) {
    return (req, res, next) => {
      const { user } = req.query;
      profile.signout({ user }).subscribe(
        obj => {
          if(!obj) req.session.destroy();
          console.log('isAuthenticated:', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to Logged out.'); }
      );
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
