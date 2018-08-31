import MailEditor from 'Routes/MailEditor/MailEditor';
import log        from 'Utilities/logutils';

const displayName = 'mail';
const mail = MailEditor.of();

export default {
  uploadFile() {
    return (req, res) => {
      const filename = req.headers['x-uploadedfilename'];
      const filedata = Buffer.alloc(+req.headers['content-length']);
      const admin    = filename.split('_')[0];
      const id       = filename.split('_')[1];
      let bufferOffset = 0;
      req.on('data', chunk => {
        chunk.copy(filedata, bufferOffset);
        bufferOffset += chunk.length;
      }).on('end', () => {
        mail.uploadFile({ admin, id, file: filedata }).subscribe(
          obj => { res.status(200).send(obj); }
        , err => { 
            res.status(500).send({ name: err.name, message: err.message });
            log.error(displayName, err.name, ':', err.message, ':', err.stack); 
          }
        , () => { log.info('Complete to upload Attach.'); }  
        );
      });
    };
  },

  fetchMails() {
    return (req, res) => {
      const { admin } = req.body;
      mail.fetchMails({ admin }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , ()  => { log.info('Complete to fetch Mails.'); });
    };
  },

  fetchSelectedMails() {
    return (req, res) => {
      const { admin } = req.body;
      mail.fetchMails({ admin }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , ()  => { log.info('Complete to fetch SelectedMails.'); });
    };
  },

  fetchMail() {
    return (req, res) => {
      const { admin, ids } = req.query;
      mail.fetchMail({ admin, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Mail.'); });
    };
  },

  createMail() {
    return (req, res) => {
      const { admin } = req.body;
      mail.createMail({ admin }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Mail.'); });
    };
  },

  updateMail() {
    return (req, res) => {
      const { admin, id, data } = req.body;
      mail.updateMail({ admin, id, data }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to update Mail.'); });
    };
  },

  deleteMail() {
    return (req, res) => {
      const { admin, ids } = req.query;
      mail.deleteMail({ admin, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Mail.'); });
    };
  },

  createSelect() {
    return (req, res) => {
      const { admin, ids } = req.body;
      mail.createSelect({ admin, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Select.'); });
    };
  },

  deleteSelect() {
    return (req, res) => {
      const { admin, ids } = req.query;
      mail.deleteSelect({ admin, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Select.'); });
    };
  },

  notImplemented() {
    return (req, res, next) => { next(new Error('not implemented')); };
  }
};
