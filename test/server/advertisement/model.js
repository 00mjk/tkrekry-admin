'use strict';

var helper = require('../spec_helper'),
    Promise = require('bluebird'),
    should = helper.should,
    factory = helper.factory,
    Advertisement = helper.Advertisement;

var advertisementFactory = Promise.promisify(
  (options = {}, callback) =>
    factory.build('advertisement', options, (doc) => callback(null, doc)));

const createAdvertisement = (options) =>
  advertisementFactory(options)
    .then((fields) => new Advertisement(fields))
    .then((advertisement) => advertisement.save());

describe('Advertisement Model', function() {
  beforeEach(() => Advertisement.remove().exec());
  afterEach(() => Advertisement.remove().exec());

  it('rejects if not found by id', function() {
    return advertisementFactory({ published: true })
      .then((fields) => new Advertisement(fields))
      .then(({_id}) => Advertisement.get(_id))
      .catch((error) => {
        error.status.should.be.equal(404);
      });
  });

  it('store contacts on create', function() {
    return advertisementFactory({ published: true })
      .then((fields) => new Advertisement(fields))
      .then((advertisement) => {
        advertisement.contacts.should.be.instanceof(Array).and.have.lengthOf(1);
        return advertisement;
      })
      .then((advertisement) => advertisement.save())
      .then(({_id}) => Advertisement.get(_id))
      .then((storedAdvertisement) => {
        storedAdvertisement.contacts.should.be.instanceof(Array).and.have.lengthOf(1);
      });
  });

  it('find all published', function() {
    return createAdvertisement({ published: true })
      .then(() => createAdvertisement({ published: false }))
      .then(() => createAdvertisement({ published: true }))
      .then(() => createAdvertisement({ published: false }))
      .then(() => Advertisement.published())
      .then((advertisements) => {
        advertisements.should.be.instanceof(Array).and.have.lengthOf(2);
      });
  });

  it('store contacts on update', function() {
    return createAdvertisement({ published: true })
      .then(({id}) => Advertisement.get(id))
      .then(({contacts, updated_at, _id}) => {
        contacts.should.be.instanceof(Array).and.have.lengthOf(1);
        updated_at.should.be.instanceof(Date);
        return Promise.resolve(_id);
      })
      .then((id) => Advertisement.findByIdAndUpdate(id, { title: 'Updated title' }, { new: true }).exec())
      .then(({updated_at, title, contacts }) => {
        contacts.should.be.instanceof(Array).and.have.lengthOf(1);
        title.should.be.equal('Updated title');
      });
    });
});
