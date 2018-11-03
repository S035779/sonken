import FaqEditor  from 'Routes/FaqEditor/FaqEditor';
import log        from 'Utilities/logutils';

const displayName = 'faq';
const faq = FaqEditor.of();

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
        faq.uploadFile({ admin, id, file: filedata }).subscribe(
          obj => res.send(obj)
        , err => {
            res.status(500).send({ name: err.name, message: err.message });
            log.error(displayName, err.name, ':', err.message, ':', err.stack);
          }
        , () => log.info('Complete to upload Attach.')  
        );
      });
    };
  },

  fetchFaqs() {
    return (req, res) => {
      const { admin } = req.body;
      faq.fetchFaqs({ admin }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , ()  => log.info('Complete to fetch Faqs.')
      );
    };
  },

  fetchPostedFaqs() {
    return (req, res) => {
      const { admin } = req.body;
      faq.fetchFaqs({ admin }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , ()  => log.info('Complete to fetch PostedFaqs.')
      );
    };
  },

  fetchFaq() {
    return (req, res) => {
      const { admin, ids } = req.query;
      faq.fetchFaq({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to fetch Faq.')
      );
    };
  },

  createFaq() {
    return (req, res) => {
      const { admin } = req.body;
      faq.createFaq({ admin }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to create Faq.')
      );
    };
  },

  updateFaq() {
    return (req, res) => {
      const { admin, id, data } = req.body;
      faq.updateFaq({ admin, id, data }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to update Faq.')
      );
    };
  },

  deleteFaq() {
    return (req, res) => {
      const { admin, ids } = req.query;
      faq.deleteFaq({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to delete Faq.')
      );
    };
  },

  createPost() {
    return (req, res) => {
      const { admin, ids } = req.body;
      faq.createPost({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to create Post.')
      );
    };
  },

  deletePost() {
    return (req, res) => {
      const { admin, ids } = req.query;
      faq.deletePost({ admin, ids }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Complete to delete Post.')
      );
    };
  },

  notImplemented() {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
