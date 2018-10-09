import dotenv           from 'dotenv';
import * as R           from 'ramda';
import mongoose         from 'mongoose';
import log              from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error;
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

// Jobs model.
const jobSchema = new mongoose.Schema({
  worker:           { type: String, required: true }
, jobname:          { type: String, required: true }
, params:           { type: Object, required: true }
, timeout:          { type: Date }
, delay:            { type: Date }
, priority:         { type: Number }
, status:           { type: String }
, enqueued:         { type: Date, required: true, default: Date.now }
, dequeued:         { type: Date }
, result:           { type: String }
}, { collection: 'jobs' });
jobSchema.index({ worker: 1, jobname: 1 });

const displayName = '[MDB]';
const db = mongoose.createConnection();
db.on('open',  () => log.info( displayName,'queue connected.'));
db.on('close', () => log.info( displayName,'queue disconnected.'));
db.on('error', () => log.error(displayName,'queue connection error.'));
db.openUri(mdb_url + '/queue', { useNewUrlParser: true });

process.on('SIGINT', () => mongoose.disconnect(() => log.info(displayName, 'queue terminated.')));
export const Job      = db.model('Job',       jobSchema);
