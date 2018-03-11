import mongoose from 'mongoose';
import { logs as log } from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const userSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, salt:             { type: String, required: true }
, hash:             { type: String, required: true }
, isAuthenticated:  { type: Boolean, default: true }
, isAdmin:          { type: Boolean, default: true }
, name:             { type: String, required: true }
, kana:             { type: String, required: true }
, email:            { type: String, required: true }
, phone:            { type: String, required: true }
, plan:             { type: String, required: true }
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'users' });
userSchema.index({ user: 1, email: 1 }, { unique: true });
userSchema.set('toObject');

const approvedSchema = new mongoose.Schema({
  approved:         { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'approved' });
approvedSchema.index({ approved: 1 }, { unique: true });

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','profile connected.'));
db.on('close', () => log.info( '[MDB]','profile disconnected.'));
db.on('error', () => log.error('[MDB]','profile connection error.'));
db.openUri(mdb_url + '/profile');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'profile terminated.')));
export const User = db.model('User', userSchema);
export const Approved = db.model('Approved', approvedSchema);
