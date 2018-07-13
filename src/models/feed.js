import dotenv           from 'dotenv';
import mongoose         from 'mongoose';
import { logs as log }  from 'Utilities/logutils';

dotenv.config();
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
, pubDate:          { type: Date, default: Date.now() }
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
, items:            [itemSchema]
, AmazonUrl:        String
, AmazonImg:        String
, updated:          { type: Date, default: Date.now() } 
}, { collection: 'notes' });

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
, created:          { type: Date, default: Date.now() }
}, { collection: 'added' });
addedSchema.index({ added: 1 }, { unique: true });

const deletedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, deleted:          { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'deleted' });
deletedSchema.index({ deleted: 1 }, { unique: true });

const readedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, readed:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'readed' });
readedSchema.index({ readed: 1 }, { unique: true });

const tradedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, traded:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'traded' });
tradedSchema.index({ traded: 1 }, { unique: true });

const bidedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, bided:            { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'bided' });
bidedSchema.index({ bided: 1 }, { unique: true });

const starredSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, starred:          { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'starred' });
starredSchema.index({ starred: 1 }, { unique: true });

const listedSchema = new mongoose.Schema({
  user:             { type: String, required: true } 
, listed:           { type: String, required: true }
, created:          { type: Date, default: Date.now() }
}, { collection: 'listed' });
listedSchema.index({ listed: 1 }, { unique: true });

const db = mongoose.createConnection();
db.on('open',  () => log.info( '[MDB]','feed connected.'));
db.on('close', () => log.info( '[MDB]','feed disconnected.'));
db.on('error', () => log.error('[MDB]','feed connection error.'));
db.openUri(mdb_url + '/feed');

process.on('SIGINT', () =>
  mongoose.disconnect(() => log.info('[MDB]', 'feed terminated.')));
export const Note     = db.model('Note',      noteSchema);
export const Category = db.model('Category',  categorySchema);
export const Added    = db.model('Added',     addedSchema);
export const Deleted  = db.model('Deleted',   deletedSchema);
export const Readed   = db.model('Readed',    readedSchema);
export const Traded   = db.model('Traded',    tradedSchema);
export const Bided    = db.model('Bided',     bidedSchema);
export const Starred  = db.model('Starred',   starredSchema);
export const Listed   = db.model('Listed',    listedSchema);
