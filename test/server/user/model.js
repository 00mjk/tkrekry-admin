const helper = require('../spec_helper');
const should = helper.should;
const _ = helper._;
const factory = helper.factory;
const Employer = helper.Employer;
const User = helper.User;

var user,
  userDefaultAttributes,
  employer,
  userDefaults = {
    provider: 'local',
    first_name: 'First name',
    last_name: 'Last name',
    email: 'test@test.com',
    password: 'password',
    employers: []
  };

describe('User Model', function () {
  beforeEach(function (done) {
    User.remove({}).exec()
      .then(() => {
        factory('employer', {}, function (sampleUserEmployer) {
          employer = sampleUserEmployer;
          userDefaults.employers[0] = sampleUserEmployer._id;
          factory.build('user', userDefaults, function (userAttributes) {
            userDefaultAttributes = userAttributes;
            user = new User(userAttributes);
            done();
          });
        });
      });
  });

  afterEach(function () {
    return User.remove({}).exec();
  });

  it('should begin with no users', function () {
    return User.find({}).exec()
      .then((users) => users.should.have.length(0));
  });

  it('should fail when saving a duplicate user', function () {
    return user.save()
      .then(() => new User(userDefaultAttributes))
      .then((userDup) => userDup.save())
      .then((dupped) => should.not.exist(dupped))
      .catch((error) => should.exist(error));
  });

  it('should fail when saving without an email', function () {
    user.email = '';
    return user.save()
      .catch((error) => should.exist(error));
  });

  it("should authenticate user if password is valid", function () {
    user.authenticate('password').should.be.true;
  });

  it("should not authenticate user if password is invalid", function () {
    user.authenticate('blah').should.not.be.true;
  });

  it("should increment login_count and last_login when authenticated", function (done) {
    user.save().then(() => {
      user.authenticate('password').should.be.true;
      // TODO: Related to above authenticate because it's incrementing login_count
      setTimeout(function () {
        User.findOne({
          _id: user._id
        }).then((reloadedUser) => {
          reloadedUser.login_count.should.be.equal(1);
          done();
        });
      }, 200);
    });

  });

  it("should strip password and other sensitive fields from JSON presentation", function () {
    user.toJSON.should.not.have.property('hashedPassword');
    user.toJSON.should.not.have.property('__v');
    user.toJSON.should.not.have.property('salt');
  });

  it("should remove users employer", function () {
    return user.save()
      .then(() => User.removeFromEmployer(employer._id))
      .then(() => User.find({ _id: user._id }))
      .then(([firstUser,]) => firstUser.employers.length.should.be.equal(0));
  });
});
