import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import FeedParser from 'Routes/FeedParser/FeedParser';
import { logs as log } from 'Utilities/logutils';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const http_port = process.env.API_PORT || 8082;
const http_host = process.env.API_HOST || '127.0.0.1';

if (env === 'development') {
  log.config('console', 'color', 'api-server', 'TRACE');
} else if (env === 'staging') {
  log.config('file', 'basic', 'api-server', 'DEBUG');
} else if (env === 'production') {
  log.config('file', 'json', 'api-server', 'INFO');
}

const app = express();
const router = express.Router();
app.use(log.connect());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const feed = FeedParser.of();

const authenticate = (req, res, next) => {
  const { user, password } = req.body;
  feed.authenticate({ user, password }).subscribe(
    obj => { res.status(200).send(obj); }
  , err => {
      res.status(500).send({ name: err.name, message: err.message });
      log.error(err.name, ':', err.message);
    }
  , () => { log.info('Complete to Logged in.'); }
  );
};

const signout = (req, res, next) => {
  const { user } = req.query;
  feed.signout({ user }).subscribe(
    obj => { res.status(200).send(obj); }
  , err => {
      res.status(500).send({ name: err.name, message: err.message });
      log.error(err.name, ':', err.message);
    }
  , () => { log.info('Complete to Logged out.'); }
  );
};

const deleteList = (req, res, next) => {
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

const createList = (req, res, next) => {
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

const deleteStar = (req, res, next) => {
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

const createStar = (req, res, next) => {
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

const deleteBids = (req, res, next) => {
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

const createBids = (req, res, next) => {
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

const deleteTrade = (req, res, next) => {
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

const createTrade = (req, res, next) => {
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

const deleteItem = (req, res, next) => {
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

const deleteRead = (req, res, next) => {
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

const createRead = (req, res, next) => {
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

const deleteNote = (req, res, next) => {
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

const updateNote = (req, res, next) => {
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

const fetchReadedNotes = (req, res, next) => {
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

const fetchTradedNotes = (req, res, next) => {
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

const fetchBidedNotes = (req, res, next) => {
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

const fetchStarredNotes = (req, res, next) => {
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

const fetchListedNotes = (req, res, next) => {
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

const fetchNote = (req, res, next) => {
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

const fetchNotes = (req, res, next) => {
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

const createNote = (req, res, next) => {
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

const notImplemented = (req, res, next) => {
  next(new Error('not implemented'));
};

router.route('/authenticate')
.get(notImplemented)
.put(notImplemented)
.post(authenticate)
.delete(signout);

router.route('/traded')
.get(fetchTradedNotes)
.put(createTrade)
.post(notImplemented)
.delete(deleteTrade);

router.route('/bided')
.get(fetchBidedNotes)
.put(createBids)
.post(notImplemented)
.delete(deleteBids);

router.route('/starred')
.get(fetchStarredNotes)
.put(createStar)
.post(notImplemented)
.delete(deleteStar);

router.route('/listed')
.get(fetchListedNotes)
.put(createList)
.post(notImplemented)
.delete(deleteList);

router.route('/item')
.get(notImplemented)
.put(notImplemented)
.post(notImplemented)
.delete(deleteItem);

router.route('/readed')
.get(fetchReadedNotes)
.put(createRead)
.post(notImplemented)
.delete(deleteRead);

router.route('/notes')
.get(fetchNotes)
.put(notImplemented)
.post(notImplemented)
.delete(notImplemented);

router.route('/note')
.get(fetchNote)
.put(createNote)
.post(updateNote)
.delete(deleteNote);

app.use('/api', router);
http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
