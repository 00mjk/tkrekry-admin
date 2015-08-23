var helper = require('../spec_helper');

describe('Tkrekry Admin homepage', function() {

  var loginNameField = element(by.model('user.email')),
      loginPasswordField = element(by.model('user.password')),
      expect = helper.expect,
      loginButton = element(by.id('login-button')),
      loginPage = helper.loginPage;

  before(function(done) {
    helper.resetDB(function(err, res) {
      helper.seedDB(function(err, rs) {
        done();
      });
    });
  });

  after(function(done) {
    helper.resetDB(function(err, result) {
      done();
    });
  });


  it('admin user can login with correct credentials', function(done) {
    loginPage
      .validLogin(helper.users.admin.username, helper.users.admin.password)
      .then(function(email) {
        expect(email).to.be.equal(helper.users.admin.username + ', Kirjaudu ulos');
        loginPage.logout().then(function(err, res) {
          console.log(err, res);
          done();
        });
      });
  });

  it('normal user can login with correct credentials', function(done) {
    loginPage
      .validLogin(helper.users.normal.username, helper.users.normal.password)
      .then(function(email) {
        expect(email).to.be.equal(helper.users.normal.username + ', Kirjaudu ulos');
        loginPage.logout().then(function(err, res) {
          console.log(err, res);
          done();
        });
      });
  });

  it('normal user can login with correct credentials', function(done) {
    loginPage
      .invalidLogin('loreml@lipsum.com', 'sekretpassword')
      .then(function(errorMessage) {
        expect(errorMessage).to.be.equal('Sähköpostiosoite ja/tai salasana väärin.');
        done();
      });
  });

});