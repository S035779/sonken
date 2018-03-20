import mongoose from 'mongoose';
import { logs as log } from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const faqSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, title:            { type: String }
, body:             { type: String }
, file:             { type: Buffer, default: null }
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'faqs' });
faqSchema.set('toObject');

const postedSchema = new mongoose.Schema({
  posted:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'posted' });
postedSchema.index({ posted: 1 }, { unique: true });

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','faq connected.'));
db.on('close', () => log.info( '[MDB]','faq disconnected.'));
db.on('error', () => log.error('[MDB]','faq connection error.'));
db.openUri(mdb_url + '/faq');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'faq terminated.')));
export const Faq = db.model('Faq', faqSchema);
export const Posted = db.model('Posted', postedSchema);
