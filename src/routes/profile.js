import UserProfiler from 'Routes/UserProfiler/UserProfiler';
import log          from 'Utilities/logutils';
import std          from 'Utilities/stdutils';

const displayName = 'profile';
const profile = UserProfiler.of();

export default {
  fetchUsers() {
    return (req, res) => {
      const { admin } = req.body;
      profile.fetchUsers({ admin }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , ()  => log.info('Complete to fetch Users.')
      );
    };
  },

  fetchPreference() {
    return (req, res) => {
      profile.fetchPreference().subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to fetch Preference.')
      );
    };
  },

  createPreference() {
    return (req, res) => {
      const { admin, data } = req.body;
      profile.createPreference({ admin, data }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to create Preference.')
      );
    };
  },

  updatePreference() {
    return (req, res) => {
      const { admin, data } = req.body;
      profile.updatePreference({ admin, data }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to update Preference.')
      );
    };
  },

  deletePreference() {
    return (req, res) => {
      const { admin, id } = req.query;
      profile.deletePreference({ admin, id }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to delete Preference.')
      );
    };
  },

  fetchUser() {
    return (req, res) => {
      const { user, email, phone } = req.query;
      profile.fetchUser({ user, email, phone }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to fetch User.')
      );
    };
  },

  createUser() {
    return (req, res) => {
      const { user, password, data } = req.body;
      profile.createUser({ user, password, data }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to create User.')
      );
    };
  },

  updateUser() {
    return (req, res) => {
      const { admin, user, password, data } = req.body;
      profile.updateUser({ admin, user, password, data }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to update User.')
      );
    };
  },

  deleteUser() {
    return (req, res) => {
      const { admin, ids } = req.query;
      profile.deleteUser({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to delete User.')
      );
    };
  },

  authenticate() {
    return (req, res) => {
      const { admin, user, password, auto } = req.body;
      profile.authenticate({ admin, user, password, auto }).subscribe(
        obj => {
          const isAdmin = obj && admin !== '';
          const isUser  = obj && user  !== '';
          const isAuto  = obj && auto;
          const key     = std.rndString(10);
          const hash    = std.crypto_sha256(key, 'koobkooCedoN');
          const params  = { maxAge: 60 * 60 * 1000, httpOnly: true };
          if(isAdmin)   req.session.admin = admin;
          if(isUser)    req.session.user  = user;
          if(isAuto) {
            req.session.auto  = hash;
            res.cookie('auto', hash, params);
          } else {
            req.session.auto  = '';
            res.clearCookie('auto');
          }
          res.status(200).send(obj);
          log.info(displayName, 'req.cookies:', req.cookies);
          log.info(displayName, 'req.session:', req.session);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to Authenticate.')
      );
    };
  },

  autologin() {
    return(req, res) => {
      const admin = req.session.admin ? req.session.admin : '';
      const user  = req.session.user  ? req.session.user  : '';
      const auto  = req.session.auto  ? req.session.auto  : '';
      profile.autologin({ admin, user }).subscribe(
        obj => {
          const isAuth = obj && req.cookies.auto === auto;
          const key     = std.rndString(10);
          const hash    = std.crypto_sha256(key, 'koobkooCedoN');
          const params  = { maxAge: 60 * 60 * 1000, httpOnly: true };
          if(isAuth) {
            req.session.auto = hash;
            res.cookie('auto', hash, params);
            res.status(200).send({ admin, user, isAuthenticated: obj });
          } else {
            res.status(401).send({ name: 'Client Error', message: 'Unauthorized.' });
            log.error(displayName, 'Client Error', ':', 'Unauthorized.');
          }
          log.info(displayName, 'req.cookies:', req.cookies);
          log.info(displayName, 'req.session:', req.session);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to Auto login.')
      );
    };
  },

  signout() {
    return (req, res) => {
      const { admin, user } = req.query;
      profile.signout({ admin, user }).subscribe(
        obj => {
          if(!obj) {
            req.session.destroy();
            res.clearCookie('auto');
            res.status(200).send(obj);
          } else {
            res.status(401).send({ name: 'Client Error', message: 'Unauthorized.' });
            log.error(displayName, 'Client Error', ':', 'Unauthorized.');
          }
          log.info(displayName, 'req.cookies:', req.cookies);
          log.info(displayName, 'req.session:', req.session);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to Sign out.')
      );
    };
  },

  sendmail() {
    return (req, res) => {
      const { admin, ids } = req.body;
      profile.sendmail({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to Sendmail.')
      );
    };
  },

  createApproval() {
    return (req, res) => {
      const { admin, ids } = req.body;
      profile.createApproval({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to create Approval.')
      );
    };
  },

  deleteApproval() {
    return (req, res) => {
      const { admin, ids } = req.query;
      profile.deleteApproval({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to delete Approval.')
      );
    };
  },

  inquiry() {
    return (req, res) => {
      const { user, data } = req.body;
      profile.inquiry({ user, data }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to Inquiry.')
      );
    };
  },

  notImplemented() {
    return (req, res, next) => { next(new Error('not implemented')); };
  }
};
