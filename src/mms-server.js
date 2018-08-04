import dotenv         from 'dotenv';
import { SMTPServer } from 'smtp-server';
import fs             from 'fs';
import path           from 'path';
import log            from './utils/logutils';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const smtp_host = '127.0.0.1';
const ssmtp_host = '127.0.0.1';
const user = process.env.MMS_USER;
const pass = process.env.MMS_PASS;
const smtp_port = process.env.MMS_PORT || 2525;
const ssmtp_port  = process.env.MMS_SSL || 4465;
const ssl_keyset = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
};

if (env === 'development') 
  log.config('console', 'color', 'mms-server', 'TRACE');
if (env === 'staging') 
  log.config('file', 'basic', 'mms-server', 'DEBUG');
if (env === 'production') 
  log.config('file', 'json', 'mms-server', 'INFO');

const onAuth = (auth, session, callback) => {
  if ((auth.username === user && auth.password === pass) ||
    (auth.username === user
      && auth.method === 'CRAM-MD5' && auth.validatePassword(pass))) {
    return callback(null, { user: 'userdata' });
  }
  callback(new Error('Authentication failed'));
};

const onMailFrom = (address, session, callback) => {
  if (/^deny/i.test(address.address))
    return callback(new Error('Not accepted'));
  callback();
};

const onRcptTo = (address, session, callback) => {
  let err;
  if (/^deny/i.test(address.address)) {
    return callback(new Error('Not accepted'));
  }
  if (address.address.toLowerCase() === 'almost-full@example.com'
    && Number(session.envelope.mailFrom.args.SIZE) > 100) {
    err = new Error('Insufficient channel storage: ' + address.address);
    err.responseCode = 452;
    return callback(err);
  }
  callback();
};

const onData = (stream, session, callback) => {
  stream.pipe(process.stdout);
  stream.on('end', () => {
    let err;
    if (stream.sizeExceeded) {
      err = new Error(
        'Error: message exceeds fixed maximum message size 10MB');
      err.responceCode = 552;
      return callback(err);
    }
    callback(null, 'Message queued as abcdef');
  });
};

const option = {
  logger: true,
  banner: 'Welcome to My Awesome SMTP Server',
  secure:  false,
  disabledCommands: ['STARTTLS'],
  authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],
  size: 10 * 1024 * 1024,
  useXClient: true,
  onAuth,
  onMailFrom,
  onRcptTo,
  onData
};

const smtp = new SMTPServer(option);
smtp.on('error', err => {
  if(err) log.error('[MMS]', err.name, ':', err.message); }
);
smtp.listen(smtp_port, smtp_host, () => {
  log.info('[MMS]', `listening on ${smtp_host}:${smtp_port}`);
});

const ssl_option = {
  logger: true,
  banner: 'Welcome to My Awesome Secure SMTP Server',
  secure:  true,
  key: ssl_keyset.key,
  cert: ssl_keyset.cert,
  authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],
  size: 10 * 1024 * 1024,
  useXClient: true,
  onAuth,
  onMailFrom,
  onRcptTo,
  onData
};
const ssmtp = new SMTPServer(ssl_option);
ssmtp.on('error', err => {
  if(err) log.error('[MMS]', err.name, ':', err.message); }
);
ssmtp.listen(ssmtp_port, ssmtp_host, () => {
  log.info('[MMS]', `listening on ${ssmtp_host}:${ssmtp_port}`);
});
