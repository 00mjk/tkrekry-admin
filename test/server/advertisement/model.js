'use strict';

var helper = require('../spec_helper'),
    should = helper.should,
    factory = helper.factory,
    Advertisement = helper.Advertisement;

var advertisement;

describe('Advertisement Model', function() {
  beforeEach(function(done) {
    factory.build('advertisement', {}, function(doc) {
        advertisement = new Advertisement(doc);
        Advertisement.remove().exec();
        done();
    });
  });

  afterEach(function(done) {
    Advertisement.remove().exec();
    done();
  });

  it('store contacts on create', function(done) {
    advertisement.contacts.should.be.instanceof(Array).and.have.lengthOf(1);
    advertisement.save(function(err, res) {
      Advertisement.get(res._id, function(err, storedAdvertisement) {
        storedAdvertisement.contacts.should.be.instanceof(Array).and.have.lengthOf(1);
        done();
      });
    });
  });

  it('store contacts on update', function(done) {
    advertisement.contacts.should.be.instanceof(Array).and.have.lengthOf(1);

    advertisement.save(function(err, res) {
      var update_at = res.updated_at;
      Advertisement.get(res.id, function(err, storedAdvertisement) {
        storedAdvertisement.contacts.should.be.instanceof(Array).and.have.lengthOf(1);
        storedAdvertisement.updated_at.should.be.instanceof(Date);
        Advertisement.findByIdAndUpdate(res.id, {title: 'sdfdsfsfdfsdfsd'}, function(er, rs) {
          rs.updated_at.getTime().should.be.equal(update_at.getTime());
          done();
        });

      });
    });
  });

});