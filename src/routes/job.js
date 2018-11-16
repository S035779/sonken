import JobQueue   from 'Routes/JobQueue/JobQueue';
import log        from 'Utilities/logutils';

const displayName = 'job';
const job = JobQueue.of();

export default {
  download() {
    return (req, res) => {
      const { operation, params } = req.body;
      job.download({ operation, params }).subscribe(
        obj => res.status(201).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Queue to download.'));
    };
  },

  notImplemented() {
    return (req, res, next) => next(new Error('not implemented'));
  }
};
