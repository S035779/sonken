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
      const subcategory = filename.split('_')[2];
      let bufferOffset = 0;
      req.on('data', chunk => {
        chunk.copy(filedata, bufferOffset);
        bufferOffset += chunk.length;
      }).on('end', () => {
        feed.uploadNotes({ user: username, category, subcategory, file: { type: filetype, content: filedata } }).subscribe(
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
        obj => { res.status(200).send(obj); }
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
      const { user, ids, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction
      , aucStartTime, aucStopTime, sold } = req.body;
      const filter = allAuction === false ? {
        lastWeekAuction
      , twoWeeksAuction
      , lastMonthAuction
      , allAuction
      , inAuction
      , aucStartTime
      , aucStopTime
      , sold
      } : null;
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

  downloadImages() {
    return (req, res) => {
      const { user, id, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction
      , aucStartTime, aucStopTime, sold } = req.body;
      const filter = allAuction === false ? {
        lastWeekAuction
      , twoWeeksAuction
      , lastMonthAuction
      , allAuction
      , inAuction
      , aucStartTime
      , aucStopTime
      , sold
      } : null;
      feed.downloadImages({ user, id, filter }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to download Images.'); }  
      );
    };
  },

  downloadTrade() {
    return (req, res) => {
      const { user, endAuction, allAuction, inAuction, bidStartTime, bidStopTime } = req.body;
      const filter = allAuction === false ? {
        endAuction
      , allAuction
      , inAuction
      , bidStartTime
      , bidStopTime
      } : null;
      feed.downloadTrade({ user, filter }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to download Traded Items.'); }  
      );
    }
  },

  downloadBids() {
    return (req, res) => {
      const { user, endAuction, allAuction, inAuction, bidStartTime, bidStopTime } = req.body;
      const filter = allAuction === false ? {
        endAuction
      , allAuction
      , inAuction
      , bidStartTime
      , bidStopTime 
      } : null;
      feed.downloadBids({ user, filter }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to download Bided Items.'); }  
      );
    }
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
      const { user, id, skip, limit, lastWeekAuction, twoWeeksAuction, lastMonthAuction, allAuction, inAuction
      , aucStartTime, aucStopTime, sold } = req.query;
      const filter = allAuction && allAuction ==='false' ? {
        lastWeekAuction:  lastWeekAuction === 'true'
      , twoWeeksAuction:  twoWeeksAuction === 'true'
      , lastMonthAuction: lastMonthAuction === 'true'
      , allAuction:       false
      , inAuction:        inAuction === 'true'
      , aucStartTime
      , aucStopTime
      , sold
      } : null;
      feed.fetchNote({ user, id, skip, limit, filter }).subscribe(
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

  fetchTradedNotes() {
    return (req, res) => {
      const { user, skip, limit, endTrading, allTrading, inBidding, bidStartTime, bidStopTime } = req.query;
      const filter = allTrading && allTrading === 'false' ? { endTrading: endTrading === 'true'
      , allTrading: false, inBidding: inBidding === 'true', bidStartTime, bidStopTime } : null;
      feed.fetchTradedNotes({ user, skip, limit, filter }).subscribe(
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
      const { user, skip, limit, endBidding, allBidding, inBidding, bidStartTime, bidStopTime } = req.query;
      const filter = allBidding && allBidding === 'false' ? { endBidding: endBidding === 'true'
      , allBidding: false , inBidding: inBidding === 'true', bidStartTime, bidStopTime } : null;
      feed.fetchBidedNotes({ user, skip, limit, filter }).subscribe(
        obj => { res.status(200).send(obj); }
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message, ':', err.stack);
        }
      , () => { log.info('Complete to fetch Bided.'); }  
      );
    };
  },

  fetchListedNotes() {
    return (req, res) => {
      const { user, skip, limit, endListing, allListing, inBidding, bidStartTime, bidStopTime } = req.query;
      const filter = allListing && allListing === 'false' ? { endListing: endListing === 'true'
      , allListing: false , inBidding: inBidding === 'true', bidStartTime, bidStopTime } : null;
      feed.fetchListedNotes({ user, skip, limit, filter }).subscribe(
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
