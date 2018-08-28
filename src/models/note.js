import dotenv   from 'dotenv';
import mongoose from 'mongoose';
import log      from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error;
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const noteSchema = new mongoose.Schema({
  user:       { type: String, required: true } 
, url:        String
, category:   { type: String, required: true }
, items:      [Schema.Types.Mixed]
, title:      { type: String, required: true }
, asin:       String
, name:       String
, price:      Number
, bidsprice:  Number
, body:       String
, AmazonUrl:  String
, AmazonImg:  String
, updated:    { type: Date, default: Date.now() } 
}, { collection: 'notes' });
noteSchema.set('toObject');

const readedSchema = new mongoose.Schema({
  readed:      { type: String, required: true }
, created:     { type: Date, default: Date.now() }
}, { collection: 'readed' });
readedSchema.index({ readed: 1 }, { unique: true });

const tradedSchema = new mongoose.Schema({
  traded:      { type: String, required: true }
, created:     { type: Date, default: Date.now() }
}, { collection: 'traded' });
tradedSchema.index({ traded: 1 }, { unique: true });

const bidedSchema = new mongoose.Schema({
  bided:       { type: String, required: true }
, created:     { type: Date, default: Date.now() }
}, { collection: 'bided' });
bidedSchema.index({ bided: 1 }, { unique: true });

const starredSchema = new mongoose.Schema({
  starred:     { type: String, required: true }
, created:     { type: Date, default: Date.now() }
}, { collection: 'starred' });
starredSchema.index({ starred: 1 }, { unique: true });

const listedSchema = new mongoose.Schema({
  listed:      { type: String, required: true }
, created:     { type: Date, default: Date.now() }
}, { collection: 'listed' });
listedSchema.index({ listed: 1 }, { unique: true });

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','profile connected.'));
db.on('close', () => log.info( '[MDB]','profile disconnected.'));
db.on('error', () => log.error('[MDB]','profile connection error.'));
db.openUri(mdb_url + '/feed');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'profile terminated.')));
export const Note     = db.model('Note',    noteSchema);
export const Readed   = db.model('Readed',  readedSchema);
export const Traded   = db.model('Traded',  tradedSchema);
export const Bided    = db.model('Bided',   bidedSchema);
export const Starred  = db.model('Starred', starredSchema);
export const Listed   = db.model('Listed',  listedSchema);

