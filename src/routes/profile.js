import UserProfiler     from 'Routes/UserProfiler/UserProfiler';
import { logs as log }  from 'Utilities/logutils';

const profile = UserProfiler.of();

export default {
  fetchUser(options) {
    return (req, res, next) => {
      const { email, phone } = req.query;
      profile.fetchUser({ email, phone }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch User.'); }
      );
    };
  },

  createUser(options) {
    return (req, res, next) => {
      const { user, password, data } = req.body;
      profile.createUser({ user, password, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create User.'); }
      );
    };
  },

  updateUser(options) {
    return (req, res, next) => {
      const { user, password } = req.body;
      profile.updateUser({ user, password }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to update User.'); }
      );
    };
  },

  deleteUser(options) {
    return (req, res, next) => {
      const { user } = req.query;
      profile.deleteUser({ user }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete User.'); }
      );
    };
  },

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

  authAdmin(options) {
    return (req, res, next) => {
      const { admin, password } = req.body;
      profile.authAdmin({ admin, password }).subscribe(
        obj => {
          if(obj) req.session.admin = admin;
          console.log('isAuthenticated:', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to Logged in of ADMIN.'); }
      );
    };
  },

  signoutAdmin(options) {
    return (req, res, next) => {
      const { admin } = req.query;
      profile.signoutAdmin({ admin }).subscribe(
        obj => {
          if(!obj) req.session.destroy();
          console.log('isAuthenticated:', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to Logged out of ADMIN.'); }
      );
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
