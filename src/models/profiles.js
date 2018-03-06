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
}, { collection: 'users' });
mongoose.model('Users', usersSchema);

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','profiles connected.'));
db.on('close', () => log.info( '[MDB]','profiles disconnected.'));
db.on('error', () => log.error('[MDB]','profiles connection error.'));
db.openUri(mdb_url + '/profiles');
process.on('SIGINT', () => {
  mongoose.disconnect(() => log.info('[API]', 'mongoose #2 terminated.'));
});

export const Users = db.model('Users');
