import FaqEditor     from 'Routes/FaqEditor/FaqEditor';
import { logs as log }  from 'Utilities/logutils';

const faq = FaqEditor.of();

export default {
  fetchFaqs(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      faq.fetchFaqs({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , ()  => {
          log.info('Complete to fetch Faqs.');
      });
    };
  },

  fetchPostedFaqs(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      faq.fetchFaqs({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , ()  => {
          log.info('Complete to fetch PostedFaqs.');
      });
    };
  },

  fetchFaq(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      faq.fetchFaq({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to fetch Faq.');
      });
    };
  },

  createFaq(options) {
    return (req, res, next) => {
      const { admin } = req.body;
      faq.createFaq({ admin }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to create Faq.');
      });
    };
  },

  updateFaq(options) {
    return (req, res, next) => {
      const { admin, id, data } = req.body;
      console.log(id);
      faq.updateFaq({ admin, id, data }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to update Faq.');
      });
    };
  },

  deleteFaq(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      faq.deleteFaq({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete Faq.');
      });
    };
  },

  createPost(options) {
    return (req, res, next) => {
      const { admin, ids } = req.body;
      faq.createPost({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to create Post.');
      });
    };
  },

  deletePost(options) {
    return (req, res, next) => {
      const { admin, ids } = req.query;
      faq.deletePost({ admin, ids }).subscribe(
        obj => {
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => {
          log.info('Complete to delete Post.');
      });
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
