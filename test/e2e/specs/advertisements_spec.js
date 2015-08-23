var helper = require('../spec_helper');

describe('Tkrekry Admin homepage', function() {

  var ptor = browser,
      expect = helper.expect,
      loginPage = helper.loginPage,
      advertisementPage = helper.advertisementPage,
      _ = helper._;


  before(function(done) {
    helper.resetDB(function(err, res) {
      helper.seedDB(function(err, rs) {
        done();
      });
    });
  });

  after(function(done) {
      helper.resetDB(function(err, res) {
        done();
      });
  });

  describe('as Admin User', function() {
    beforeEach(function(done) {
      loginPage
        .validLogin(helper.users.admin.username, helper.users.admin.password).then(done);
    });

    afterEach(function(done) {
      loginPage.logout().then(done);
    });

    it('see all employers in dropdown list', function() {
      expect(advertisementPage.employerDropDownList()).to.eventually.have.length(2);
    });

    it('add new advertisement', function(done) {
      advertisementPage.addNew(true).then(function (clicked) {
        done();
      });
    });

  });

  describe('as Normal User', function() {
    before(function(done) {
      loginPage
        .validLogin(helper.users.normal.username, helper.users.normal.password).then(done);
    });

    afterEach(function(done) {
      loginPage.logout().then(done);
    });

    it('add new advertisement', function(done) {
      advertisementPage.addNew(false).then(function (clicked) {
        done();
      });
    });
  });

});