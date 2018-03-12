import MailEditor     from 'Routes/MailEditor/MailEditor';
import { logs as log }  from 'Utilities/logutils';

const mail = MailEditor.of();

export default {
  fetchMails(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      mail.fetchMails({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , ()  => {
          log.info('Complete to fetch Mails.');
      });
    };
  },

  fetchSelectedMails(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      mail.fetchMails({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , ()  => {
          log.info('Complete to fetch SelectedMails.');
      });
    };
  },

  fetchMail(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      mail.fetchMail({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to fetch Mail.');
      });
    };
  },

  createMail(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      mail.createMail({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to create Mail.');
      });
    };
  },

  updateMail(options) {
    return (req, res, next) => {
      const { admin, id, data } = req.body;
      console.log(id);
      mail.updateMail({ admin, id, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to update Mail.');
      });
    };
  },

  deleteMail(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      mail.deleteMail({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete Mail.');
      });
    };
  },

  createSelect(options) {
    return (req, res, next) => {
      const { admin, ids } = req.body;
      mail.createSelect({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to create Select.');
      });
    };
  },

  deleteSelect(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      mail.deleteSelect({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete Select.');
      });
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
