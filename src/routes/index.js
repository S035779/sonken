import FeedParser from 'Routes/FeedParser/FeedPaeser';

export default {
  feed(req, res, next) {
    const { url } = req.body;
    const feed = FeedPaeser.of();
    feed.paserRss({ url }).subscribe(
        data => { res.json(data); }
      , err  => { res.state(500)
        .send({ name: err.name, message: err.message });
        log.error(err.name, ':', err.message); }
      , ()   => { log.info('Complete to parse XML.'); }  
    );
  }
};
