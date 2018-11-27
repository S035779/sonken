import dotenv   from 'dotenv';
import mongoose from 'mongoose';
import log      from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error;
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const faqSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, title:            { type: String }
, body:             { type: String }
, file:             { type: Buffer, default: null }
, created:          { type: Date, required: true, default: Date.now } 
, updated:          { type: Date, required: true, default: Date.now } 
}, { collection: 'faqs' });

const postedSchema = new mongoose.Schema({
  posted:           { type: String, required: true }
, updated:          { type: Date, required: true, default: Date.now }
}, { collection: 'posted' });
postedSchema.index({ posted: 1 }, { unique: true });

const displayName = '[MDB]';
const db = mongoose.createConnection();
db.on('open',  () => log.info( displayName,'faq connected.'));
db.on('close', () => log.info( displayName,'faq disconnected.'));
db.on('error', () => log.error(displayName,'faq connection error.'));
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
db.openUri(mdb_url + '/faq', {
  reconnectTries: Number.MAX_VALUE  // Never stop trying to reconnect
, reconnectInterval: 500            // Reconnect every 500ms
});

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info(displayName, 'faq terminated.')));
export const Faq = db.model('Faq', faqSchema);
export const Posted = db.model('Posted', postedSchema);
