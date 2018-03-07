import mongoose from 'mongoose';
import { logs as log } from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';
const Schema = mongoose.Schema;
const usersSchema = new Schema ({
  name:     String
, kana:     String
, email:    String
, phone:    String
, user:     { type: String, unique: true } 
, password: String
, plan:     String
, isAuthenticate: Boolean
, updated:  { type: Date, default: Date.now() } 
}, { collection: 'users' });
mongoose.model('User', usersSchema);

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','profile connected.'));
db.on('close', () => log.info( '[MDB]','profile disconnected.'));
db.on('error', () => log.error('[MDB]','profile connection error.'));
db.openUri(mdb_url + '/profile');
process.on('SIGINT', () => {
  mongoose.disconnect(() => log.info('[API]', 'MDB[profile] terminated.'));
});

export const User = db.model('User');
