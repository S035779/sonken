import JobQueue   from 'Routes/JobQueue/JobQueue';
import log        from 'Utilities/logutils';

const displayName = 'job';
const job = JobQueue.of();

export default {
  fetchJobs() {
    return (req, res) => {
      const { user } = req.query;
      job.fetchJobs({ user }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info(displayName, 'download', 'Query to job Queue.'));
    };
  },

  download() {
    return (req, res) => {
      const { operation, ids, user, category, type, filter } = req.body;
      job.download(operation, { ids, user, category, type, filter }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info(displayName, 'download', 'Queue to download file.'));
    };
  },

  signedlink() {
    return (req, res) => {
      const { operation, ids, user, category, type, filter } = req.body;
      job.signedlink(operation, { ids, user, category, type, filter }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info(displayName, 'signedlink', 'Queue to signed link.'));
      };
  },

  notImplemented() {
    return (req, res, next) => next(new Error('not implemented'));
  }
};
