import JobQueue   from 'Routes/JobQueue/JobQueue';
import log        from 'Utilities/logutils';

const displayName = 'job';
const job = JobQueue.of();

export default {
  downloadFile() {
    return (req, res) => {
      const { operation, user, category, type, filter } = req.body;
      job.downloadFile(operation, { user, category, type, filter }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Queue to download file.'));
    };
  },

  downloadLink() {
    return (req, res) => {
      const { operation, user, category, type, filter } = req.body;
      job.downloadLink(operation, { user, category, type, filter }).subscribe(
        obj => res.status(200).send(obj)
      , err => {
          res.status(500).send({ name: err.name, message: err.message });
          log.error(displayName, err.name, ':', err.message);
        }
      , () => log.info('Queue to download link.'));
    };
  },

  notImplemented() {
    return (req, res, next) => next(new Error('not implemented'));
  }
};
