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

const deleteRead = (req, res, next) => {
  const { user, ids } = req.body;
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
    obj => { res.json(obj); }
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

router.route('/readed')
.get(fetchReadedNotes)
.put(notImplemented)
.post(createRead)
.delete(deleteRead);

router.route('/notes')
.get(fetchNotes)
.put(notImplemented)
.post(notImplemented)
.delete(notImplemented);

router.route('/note')
.get(fetchNote)
.put(updateNote)
.post(createNote)
.delete(deleteNote);

app.use('/api', router);
http.createServer(app).listen(http_port, http_host, () => {
  log.info(`HTTP Server listening on ${http_host}:${http_port}`);
});
