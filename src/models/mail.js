import dotenv   from 'dotenv';
import mongoose from 'mongoose';
import log      from 'Utilities/logutils';

dotenv.config();
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const mailSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, title:            { type: String }
, body:             { type: String }
, file:             { type: Buffer, default: null }
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'mails' });
mailSchema.set('toObject');

const selectedSchema = new mongoose.Schema({
  selected:         { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'selected' });
selectedSchema.index({ selected: 1 }, { unique: true });

const displayName = '[MDB]';
const db = mongoose.createConnection();
db.on('open',  () => log.info( displayName,'mail connected.'));
db.on('close', () => log.info( displayName,'mail disconnected.'));
db.on('error', () => log.error(displayName,'mail connection error.'));
db.openUri(mdb_url + '/mail', { useNewUrlParser: true });

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info(displayName, 'mail terminated.')));
export const Mail = db.model('Mail', mailSchema);
export const Selected = db.model('Selected', selectedSchema);
