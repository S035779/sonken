import dotenv           from 'dotenv';
import mongoose         from 'mongoose';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const noteSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, url:              { type: String, required: true }
, category:         { type: String, required: true }
, title:            { type: String, required: true }
, asin:             String
, name:             String 
, price:            Number
, bidprice:         Number
, body:             String
, items:            [mongoose.Schema.Types.Mixed]
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'notes' });
noteSchema.index({ user: 1 }, { unique: true });
noteSchema.set('toObject');

const readedSchema = new mongoose.Schema({
  readed:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'readed' });
readedSchema.index({ readed: 1 }, { unique: true });

const tradedSchema = new mongoose.Schema({
  traded:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'traded' });
tradedSchema.index({ traded: 1 }, { unique: true });

const bidedSchema = new mongoose.Schema({
  bided:            { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'bided' });
bidedSchema.index({ bided: 1 }, { unique: true });

const starredSchema = new mongoose.Schema({
  starred:          { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'starred' });
starredSchema.index({ starred: 1 }, { unique: true });

const listedSchema = new mongoose.Schema({
  listed:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'listed' });
listedSchema.index({ listed: 1 }, { unique: true });

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','feed connected.'));
db.on('close', () => log.info( '[MDB]','feed disconnected.'));
db.on('error', () => log.error('[MDB]','feed connection error.'));
db.openUri(mdb_url + '/feed');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'feed terminated.')));
export const Note = db.model('Note', noteSchema);
export const Readed = db.model('Readed', readedSchema);
