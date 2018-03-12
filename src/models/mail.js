import mongoose from 'mongoose';
import { logs as log } from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const mailSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, title:            { type: String }
, body:             { type: String }
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'mails' });
mailSchema.set('toObject');

const selectedSchema = new mongoose.Schema({
  selected:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'selected' });
selectedSchema.index({ selected: 1 }, { unique: true });

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','mail connected.'));
db.on('close', () => log.info( '[MDB]','mail disconnected.'));
db.on('error', () => log.error('[MDB]','mail connection error.'));
db.openUri(mdb_url + '/mail');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'mail terminated.')));
export const Mail = db.model('Mail', mailSchema);
export const Selected = db.model('Selected', selectedSchema);
