import FeedParser       from 'Routes/FeedParser/FeedParser';
import { logs as log }  from 'Utilities/logutils';

const feed = FeedParser.of();

export default {
  deleteList(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteList({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete List.'); }  
      );
    };
  },

  createList(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createList({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create List.'); }  
      );
    };
  },

  deleteStar(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteStar({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Star.'); }  
      );
    };
  },

  createStar(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createStar({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Star.'); }  
      );
    };
  },

  deleteBids(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteBids({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Bids.'); }  
      );
    };
  },

  createBids(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createBids({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Bids.'); }  
      );
    };
  },

  deleteTrade(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteTrade({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Trade.'); }  
      );
    };
  },

  createTrade(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createTrade({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Trade.'); }  
      );
    };
  },

  deleteItem(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteItem({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Item.'); }  
      );
    };
  },

  deleteRead(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteRead({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Read.'); }  
      );
    };
  },

  createRead(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createRead({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Read.'); }  
      );
    };
  },

  deleteNote(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteNote({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Note.'); }  
      );
    };
  },

  updateNote(options) {
    return (req, res, next) => {
      const { user, id, data } = req.body;
      feed.updateNote({ user, id, data }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to update Note.'); }  
      );
    };
  },

  fetchReadedNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchReadedNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Readed.'); }  
      );
    };
  },

  fetchTradedNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchTradedNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Traded.'); }  
      );
    };
  },

  fetchBidedNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchBidedNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Bided.'); }  
      );
    };
  },

  fetchStarredNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchStarredNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Starred.'); }  
      );
    };
  },

  fetchListedNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchListedNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Listed.'); }  
      );
    };
  },

  fetchNote(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchNote({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Note.'); }  
      );
    };
  },

  fetchNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Notes.'); }  
      );
    };
  },

  createNote(options) {
    return (req, res, next) => {
      const { user, url, category } = req.body;
      feed.createNote({ user, url, category }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Note.'); }  
      );
    };
  },

  notImplemented(options) {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
