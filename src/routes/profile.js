import UserProfiler     from 'Routes/UserProfiler/UserProfiler';
import { logs as log }  from 'Utilities/logutils';

const profile = UserProfiler.of();

export default {
  fetchUsers(options) {
    return (req, res, next) => {
      profile.fetchUsers().subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , ()  => {
          log.info('Complete to fetch Users.');
      });
    };
  },

  fetchUser(options) {
    return (req, res, next) => {
      const { user, email, phone } = req.query;
      profile.fetchUser({ user, email, phone }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to fetch User.');
      });
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
      , () => {
          log.info('Complete to create User.');
      });
    };
  },

  updateUser(options) {
    return (req, res, next) => {
      const { admin, user, password, data } = req.body;
      profile.updateUser({ admin, user, password, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to update User.');
      });
    };
  },

  deleteUser(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      profile.deleteUser({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete User.');
      });
    };
  },

  authenticate(options) {
    return (req, res, next) => {
      const { admin, user, password } = req.body;
      profile.authenticate({ admin, user, password }).subscribe(
        obj => {
          if(obj && admin !== '') req.session.admin = admin;
          else if(obj && user !== '') req.session.user = user;
          console.log('isAuthenticated:', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Logged in.');
      });
    };
  },

  signout(options) {
    return (req, res, next) => {
      const { admin, user } = req.query;
      profile.signout({ admin, user }).subscribe(
        obj => {
          if(!obj) req.session.destroy();
          console.log('isAuthenticated:', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Logged out.');
      });
    };
  },

  sendmail(options) {
    return (req, res, next) => {
      const { admin, ids } = req.body;
      profile.sendmail({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Sendmail.');
      });
    };
  },

  approval(options) {
    return (req, res, next) => {
      const { admin, ids } = req.body;
      profile.approval({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Approval.');
      });
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
