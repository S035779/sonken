import FeedParser from 'Routes/FeedParser/FeedParser';
import log        from 'Utilities/logutils';

const displayName = 'feed';
const feed = FeedParser.of();

export default {
  uploadNotes() {
    return (req, res) => {
      const filename = req.headers['x-uploadedfilename'];
      const filetype = req.headers['x-uploadedfiletype'];
      const filedata = Buffer.alloc(+req.headers['content-length']);

      const username = filename.split('_')[0];
      const category = filename.split('_')[1];

      let bufferOffset = 0;
      req.on('data', chunk => {
        chunk.copy(filedata, bufferOffset);
        bufferOffset += chunk.length;
      }).on('end', () => {
        feed.uploadNotes({ user: username, category: category
        , file: { type: filetype, content: filedata } }).subscribe(
          obj => { res.status(200).send(obj); }
        , err => {
            res.status(500).send({ name: err.name, message: err.message });
            log.error(displayName, err.name, ':', err.message, ':', err.stack);
          }
        , () => { log.info('Complete to upload Note.'); }  
        );
      });
    };
  },

  downloadNotes() {
    return (req, res) => {
      const { user, category } = req.query;
      feed.downloadNotes({ user, category }).subscribe(
        obj => {
          res.set('Content-Type', 'application/octet-stream');
          res.status(200).send(obj);
        }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to download Note.'); }  
      );
    };
  },

  downloadItems() {
    return (req, res) => {
      const { user, ids, filter } = req.body;
      feed.downloadItems({ user, ids, filter }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to download Items.'); }  
      );
    };
  },

  deleteList() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteList({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete List.'); }  
      );
    };
  },

  createList() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createList({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create List.'); }  
      );
    };
  },

  deleteStar() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteStar({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Star.'); }  
      );
    };
  },

  createStar() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createStar({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Star.'); }  
      );
    };
  },

  deleteBids() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteBids({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Bids.'); }  
      );
    };
  },

  createBids() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createBids({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Bids.'); }  
      );
    };
  },

  deleteTrade() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteTrade({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Trade.'); }  
      );
    };
  },

  createTrade() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createTrade({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Trade.'); }  
      );
    };
  },

  deleteRead() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteRead({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Read.'); }  
      );
    };
  },

  createRead() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createRead({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Read.'); }  
      );
    };
  },

  deleteAdd() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteAdd({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Add.'); }  
      );
    };
  },

  createAdd() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createAdd({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Add.'); }  
      );
    };
  },

  deleteDelete() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteDelete({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Delete.'); }  
      );
    };
  },

  createDelete() {
    return (req, res) => {
      const { user, ids } = req.body;
      feed.createDelete({ user, ids }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Delete.'); }  
      );
    };
  },

  fetchNote() {
    return (req, res) => {
      const { user, id, skip, limit } = req.query;
      feed.fetchNote({ user, id, skip, limit }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Note.'); }  
      );
    };
  },

  createNote() {
    return (req, res) => {
      const { user, url, category, categoryIds, title } = req.body;
      feed.createNote({ user, url, category, categoryIds, title }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Note.'); }  
      );
    };
  },

  deleteNote() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteNote({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Note.'); }  
      );
    };
  },

  updateNote() {
    return (req, res) => {
      const { user, id, data } = req.body;
      feed.updateNote({ user, id, data }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to update Note.'); }  
      );
    };
  },

  createCategory() {
    return (req, res) => {
      const { user, category, subcategory } = req.body;
      feed.createCategory({ user, category, subcategory }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to create Category.'); }  
      );
    };
  },

  deleteCategory() {
    return (req, res) => {
      const { user, ids } = req.query;
      feed.deleteCategory({ user, ids }).subscribe(
        obj => {  res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to delete Category.'); }  
      );
    };
  },

  updateCategory() {
    return (req, res) => {
      const { user, id, data } = req.body;
      feed.updateCategory({ user, id, data }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to update Category.'); }  
      );
    };
  },

  fetchAddedNotes() {
    return (req, res) => {
      const { user } = req.query;
      feed.fetchAddedNotes({ user }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Added.'); }  
      );
    };
  },

  fetchDeletedNotes() {
    return (req, res) => {
      const { user } = req.query;
      feed.fetchDeletedNotes({ user }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Deleted.'); }  
      );
    };
  },

  fetchReadedNotes() {
    return (req, res) => {
      const { user } = req.query;
      feed.fetchReadedNotes({ user }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Readed.'); }  
      );
    };
  },

  fetchTradedNotes() {
    return (req, res) => {
      const { user, skip, limit } = req.query;
      feed.fetchTradedNotes({ user, skip, limit }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Traded.'); }  
      );
    };
  },

  fetchBidedNotes() {
    return (req, res) => {
      const { user, skip, limit } = req.query;
      feed.fetchBidedNotes({ user, skip, limit }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Bided.'); }  
      );
    };
  },

  fetchStarredNotes() {
    return (req, res) => {
      const { user } = req.query;
      feed.fetchStarredNotes({ user }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Starred.'); }  
      );
    };
  },

  fetchListedNotes() {
    return (req, res) => {
      const { user } = req.query;
      feed.fetchListedNotes({ user }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Listed.'); }  
      );
    };
  },

  fetchCategory() {
    return (req, res) => {
      const { user, id } = req.query;
      feed.fetchCategory({ user, id }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Category.'); }  
      );
    };
  },

  fetchNotes() {
    return (req, res) => {
      const { user, category, skip, limit } = req.query;
      feed.fetchNotes({ user, category, skip, limit }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Notes.'); }  
      );
    };
  },

  fetchCategorys() {
    return (req, res) => {
      const { user, category, skip, limit } = req.query;
      feed.fetchCategorys({ user, category, skip, limit }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Categorys.'); }  
      );
    };
  },

  notImplemented() {
    return (req, res, next) => {
      next(new Error('not implemented'));
    };
  }
};
