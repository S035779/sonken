import mongoose from 'mongoose';
import { logs as log } from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

mongoose.model('User', new mongoose.Schema ({
  user:             { type: String, unique: true } 
, password:         String
, isAuthenticated:  { type: Boolean, default: true }
, name:             String
, kana:             String
, email:            String
, phone:            String
, plan:             String
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'users' }));

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','profile connected.'));
db.on('close', () => log.info( '[MDB]','profile disconnected.'));
db.on('error', () => log.error('[MDB]','profile connection error.'));
db.openUri(mdb_url + '/profile');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'profile terminated.')));

export const User = db.model('User');
