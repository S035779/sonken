import FeedParser       from 'Routes/FeedParser/FeedParser';
import { logs as log }  from 'Utilities/logutils';

const displayName = 'feed';
const feed = FeedParser.of();

export default {
  uploadNotes(options) {
    return (req, res, next) => {
      const filename = req.headers['x-uploadedfilename'];
      const filedata = new Buffer(+req.headers['content-length']);
      let bufferOffset = 0;
      req.on('data', chunk => {
        chunk.copy(filedata, bufferOffset);
        bufferOffset += chunk.length;
      }).on('end', () => {
        const user = filename.split('_')[0];
        const category = filename.split('_')[1];
        const file = filedata;
        feed.uploadNotes({ user, category, file }).subscribe(
          obj => { res.send(obj); }
        , err => {
            res.status(500)
              .send({ name: err.name, message: err.message });
            log.error(displayName, err.name, ':', err.message);
          }
        , () => { log.info('Complete to upload Note.'); }  
        );
      });
    };
  },

  downloadNotes(options) {
    return (req, res, next) => {
      const { user, id } = req.query;
      feed.downloadNotes({ user, id }).subscribe(
        obj => {
          res.set('Content-Type', 'application/octet-stream');
          res.send(obj);
        }
      , err => {
          res.status(500)
            .send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to download Note.'); }  
      );
    };
  },

  downloadItems(options) {
    return (req, res, next) => {
      const { user, items } = req.body;
      feed.downloadItems({ user, items }).subscribe(
        obj => { res.send(obj); }
      , err => {
          res.status(500)
            .send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to download Items.'); }  
      );
    };
  },

  deleteList(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteList({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Trade.'); }  
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Read.'); }  
      );
    };
  },

  deleteAdd(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteAdd({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Add.'); }  
      );
    };
  },

  createAdd(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createAdd({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Add.'); }  
      );
    };
  },

  deleteDelete(options) {
    return (req, res, next) => {
      const { user, ids } = req.query;
      feed.deleteDelete({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Delete.'); }  
      );
    };
  },

  createDelete(options) {
    return (req, res, next) => {
      const { user, ids } = req.body;
      feed.createDelete({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to create Delete.'); }  
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
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to delete Note.'); }  
      );
    };
  },

  updateNote(options) {
    return (req, res, next) => {
      const { user, id, data } = req.body;
      //log.trace(user,id,data);
      feed.updateNote({ user, id, data }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to update Note.'); }  
      );
    };
  },

  fetchAddedNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchAddedNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Added.'); }  
      );
    };
  },

  fetchDeletedNotes(options) {
    return (req, res, next) => {
      const { user } = req.query;
      feed.fetchDeletedNotes({ user }).subscribe(
        obj => { res.json(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => { log.info('Complete to fetch Deleted.'); }  
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
          log.error(displayName, err.name, ':', err.message);
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
