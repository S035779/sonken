import UserProfiler from 'Routes/UserProfiler/UserProfiler';
import log          from 'Utilities/logutils';

const displayName = 'profile';
const profile = UserProfiler.of();

export default {
  fetchUsers(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      profile.fetchUsers({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , ()  => {
          log.info('Complete to fetch Users.');
      });
    };
  },

  fetchPreference(options) {
    return (req, res, next) => {
      profile.fetchPreference().subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to fetch Preference.');
      });
    };
  },

  createPreference(options) {
    return (req, res, next) => {
      const { admin, data } = req.body;
      profile.createPreference({ admin, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to create Preference.');
      });
    };
  },

  updatePreference(options) {
    return (req, res, next) => {
      const { admin, data } = req.body;
      profile.updatePreference({ admin, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to update Preference.');
      });
    };
  },

  deletePreference(options) {
    return (req, res, next) => {
      const { admin, id } = req.query;
      profile.deletePreference({ admin, id }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete Preference.');
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          //log.info('Authenticate', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Authenticate.');
      });
    };
  },

  signout(options) {
    return (req, res, next) => {
      const { admin, user } = req.query;
      profile.signout({ admin, user }).subscribe(
        obj => {
          if(!obj) req.session.destroy();
          //log.info('SignOut', obj, req.session);
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Sign out.');
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
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Sendmail.');
      });
    };
  },

  createApproval(options) {
    return (req, res, next) => {
      const { admin, ids } = req.body;
      profile.createApproval({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to create Approval.');
      });
    };
  },

  deleteApproval(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      profile.deleteApproval({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete Approval.');
      });
    };
  },

  inquiry(options) {
    return (req, res, next) => {
      const { user, data } = req.body;
      profile.inquiry({ user, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to Inquiry.');
      });
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
