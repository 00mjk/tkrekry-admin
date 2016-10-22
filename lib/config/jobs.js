const debug = require('debug')('tkrekry:jobs');
const Promise = require('bluebird');
const config = require('./config');
const Agenda = require('agenda');
const mongoose = require('mongoose');
mongoose.Promise = Promise
const Advertisement = mongoose.model('Advertisement');
const agenda = new Agenda({
  db: {
    address: config.mongo.uri,
    collection: 'agendaJobs',
    options: config.mongo.server
  }
});

agenda.define('ManageAdvertisements', (job, done) => {
  Promise.join(
    Advertisement.publishWaiting(),
    Advertisement.unpublishObsolete(),
    (published, unpublished) => {
      debug("Published advertisements: %o", published);
      debug("Unpublished advertisements: %o", unpublished);
    }
  ).catch((error) => {
    debug("Job failed, error: %o", error);
  }).finally(done)
});

module.exports = agenda;
