import dotenv   from 'dotenv';
import mongoose from 'mongoose';
import log      from 'Utilities/logutils';

dotenv.config();
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

const menuSchema = new mongoose.Schema({
  id:               { type: String, required: true }
, name:             { type: String, required: true }
, link:             { type: String, required: true }
, number:           { type: Number, required: true }
, price:            { type: Number, required: true }
});

const adminSchema = new mongoose.Schema({
  appname:          { type: String, required: true }
, from:             { type: String, required: true }
, menu:             [menuSchema]
, advertisement:    { type: Object, required: true }
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'admin' });
adminSchema.index({ appname: 1 }, { unique: true });

const displayName = '[MDB]';
const db = mongoose.createConnection();
db.on('open',  () => log.info( displayName,'profile connected.'));
db.on('close', () => log.info( displayName,'profile disconnected.'));
db.on('error', () => log.error(displayName,'profile connection error.'));
db.openUri(mdb_url + '/profile', { useNewUrlParser: true });

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info(displayName, 'profile terminated.')));
export const User = db.model('User', userSchema);
export const Approved = db.model('Approved', approvedSchema);
export const Admin = db.model('Admin', adminSchema);
