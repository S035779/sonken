import dotenv           from 'dotenv';
import * as R           from 'ramda';
import mongoose         from 'mongoose';
import log              from 'Utilities/logutils';

const config = dotenv.config();
if(config.error) throw config.error;
const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const itemSchema = new mongoose.Schema({
  title:            { type: String, required: true }
, link:             { type: String, required: true }
, description:      { type: Object, required: true }
, attr_HREF:        { type: String, required: true }
, img_SRC:          { type: String, required: true }
, img_ALT:          { type: String, required: true }
, img_BORDER:       Number
, img_WIDTH:        Number
, img_HEIGHT:       Number
, details:          { type: Array, required: true }
, guid:             { type: Object, required: true }
, guid__:           { type: String, required: true }
, guid_isPermaLink: Boolean
, bidStopTime:      Date
, bids:             String
, price:            String
, buynow:           String
, offers:           String
, market:           String
, seller:           String
, countdown:        String
, item_condition:   String
, item_categorys:   String
, item_categoryid:  String
, explanation:      String
, payment:          String
, shipping:         String
, ship_price:       String
, ship_buynow:      String
, images:           Array
, sale:             Number
, sold:             Number
, asins:            Array
, pubDate:          { type: Date, default: Date.now() }
}, { collection: 'items' });
itemSchema.index({ bidStopTime: 1, guid__: 1 });
itemSchema.post('remove', doc => {
  const promises = [
    Listed.remove({ user: doc.user, listed: doc.guid__ }).exec()
  , Traded.remove({ user: doc.user, traded: doc.guid__ }).exec()
  , Bided.remove({ user: doc.user, bided: doc.guid__ }).exec()
  , Added.remove({ user: doc.user, added: doc.guid__ }).exec()
  , Deleted.remove({ user: doc.user, deleted: doc.guid__ }).exec()
  , Readed.remove({ user: doc.user, readed: doc.guid__ }).exec()
  , Starred.remove({ user: doc.user, starred: doc.guid__ }).exec()
  ];
  return Promise.all(promises);
});

const noteSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, url:              String
, category:         { type: String, required: true }
, categoryIds:      [mongoose.Schema.Types.ObjectId]
, title:            { type: String, required: true }
, asin:             String
, name:             String 
, price:            Number
, bidsprice:        Number
, body:             String
, items:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'Items' }]
, AmazonUrl:        String
, AmazonImg:        String
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'notes' });
noteSchema.index({ updated: 1 });
noteSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));
noteSchema.post('remove', doc => {
  const delItems = id => Items.remove({ user: doc.user, _id: id }).exec();
  const promises = R.map(delItems, doc.items);
  return Promise.all(promises);
});

const categorySchema = new mongoose.Schema({
  user:             { type: String, required: true }
, category:         { type: String, required: true }
, subcategory:      { type: String, required: true }
, subcategoryId:    mongoose.Schema.Types.ObjectId
, created:          { type: Date, default: Date.now() }
}, { collection: 'categorys' });

const addedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, added:            { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'added' });
addedSchema.index({ added: 1 }, { unique: true });
addedSchema.virtual('items', { ref: 'Items', localField: 'added', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
addedSchema.set('toObject', { virtuals: true });
addedSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const deletedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, deleted:          { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'deleted' });
deletedSchema.index({ deleted: 1 }, { unique: true });
deletedSchema.virtual('items', { ref: 'Items', localField: 'deleted', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
deletedSchema.set('toObject', { virtuals: true });
deletedSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const readedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, readed:           { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'readed' });
readedSchema.index({ readed: 1 }, { unique: true });
readedSchema.virtual('items', { ref: 'Items', localField: 'readed', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
readedSchema.set('toObject', { virtuals: true });
readedSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const starredSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, starred:          { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'starred' });
starredSchema.index({ starred: 1 }, { unique: true });
starredSchema.virtual('items', { ref: 'Items', localField: 'starred', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
starredSchema.set('toObject', { virtuals: true });
starredSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const tradedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, traded:           { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'traded' });
tradedSchema.index({ traded: 1 }, { unique: true });
tradedSchema.virtual('items', { ref: 'Items', localField: 'traded', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
tradedSchema.set('toObject', { virtuals: true });
tradedSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const bidedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, bided:            { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'bided' });
bidedSchema.index({ bided: 1 }, { unique: true });
bidedSchema.virtual('items', { ref: 'Items', localField: 'bided', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
bidedSchema.set('toObject', { virtuals: true });
bidedSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const listedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, listed:           { type: String, required: true }
, updated:          { type: Date, default: Date.now() }
}, { collection: 'listed' });
listedSchema.index({ listed: 1 }, { unique: true });
listedSchema.virtual('items', { ref: 'Items', localField: 'listed', foreignField: 'guid__', justOne: false
, options: { sort: { bidStopTime: 'desc' }, skip: 0, limit: 1 }
});
listedSchema.set('toObject', { virtuals: true });
listedSchema.pre('create', () => this.update({}, { $set: { updated: Date.now() } }));

const displayName = '[MDB]';
const db = mongoose.createConnection();
db.on('open',  () => log.info( displayName,'feed connected.'));
db.on('close', () => log.info( displayName,'feed disconnected.'));
db.on('error', () => log.error(displayName,'feed connection error.'));
db.openUri(mdb_url + '/feed', { useNewUrlParser: true });

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info(displayName, 'feed terminated.')));
export const Items    = db.model('Items',     itemSchema);
export const Note     = db.model('Note',      noteSchema);
export const Category = db.model('Category',  categorySchema);
export const Added    = db.model('Added',     addedSchema);
export const Deleted  = db.model('Deleted',   deletedSchema);
export const Readed   = db.model('Readed',    readedSchema);
export const Traded   = db.model('Traded',    tradedSchema);
export const Bided    = db.model('Bided',     bidedSchema);
export const Starred  = db.model('Starred',   starredSchema);
export const Listed   = db.model('Listed',    listedSchema);
