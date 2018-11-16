import Agenda from 'agenda';
import log    from 'Utilities/logutils';

const mdb_url = process.env.MDB_URL || 'mongodb://localhost:27017';

const queue = name => {
  return new Promise((resolve, reject) => {
    const options = {
      db: { address: mdb_url + '/queue', collection: 'jobs', options: { useNewUrlParser: true } }
    , name: name
    , processEvery: '5 seconds'
    , maxConcurrency: 1
    , defaultConcurrency: 1 
    , lockLimit: 0
    , defaultLockLimit: 0
    , defaultLockLifetime: 0
    , sort: { nextRunAt: 1, priority: -1 }
    };
    const agenda = new Agenda(options);

    agenda.on('ready', () => {
      log.info(name, 'mongo connection successfully.');
      resolve(agenda);
    });
    agenda.on('error', err => {
      log.error(name, 'mongo connection error.', err);
      reject(err);
    });
  });
};

export default { queue };
