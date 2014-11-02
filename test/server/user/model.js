'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    Employer = mongoose.model('Employer'),
    User = mongoose.model('User'),
    factory = require('../../support/fixtures/factory');

var user, userDefaultAttributes, employer,
    userDefaults = {
        provider: 'local',
        first_name: 'First name',
        last_name: 'Last name',
        email: 'test@test.com',
        password: 'password',
        employers: []
    };

describe('User Model', function() {
    beforeEach(function(done) {
        // Clear users before testing
        User.remove().exec();
        factory('employer', {}, function(sampleUserEmployer) {
            employer = sampleUserEmployer;
            userDefaults.employers[0] = sampleUserEmployer._id;
            factory.build('user', userDefaults, function(userAttributes) {
                userDefaultAttributes = userAttributes;
                user = new User(userAttributes);
                done();
            });
        });
    });

    afterEach(function(done) {
        User.remove().exec();
        done();
    });

    it('should begin with no users', function(done) {
        User.find({}, function(err, users) {
            users.should.have.length(0);
            done();
        });
    });

    it('should fail when saving a duplicate user', function(done) {
        user.save();
        var userDup = new User(userDefaultAttributes);
        userDup.save(function(err, result) {
            should.exist(err);
            done();
        });
    });

    it('should fail when saving without an email', function(done) {
        user.email = '';
        user.save(function(err) {
            should.exist(err);
            done();
        });
    });

    it("should authenticate user if password is valid", function() {
        user.authenticate('password').should.be.true;
    });

    it("should not authenticate user if password is invalid", function() {
        user.authenticate('blah').should.not.be.true;
    });

    it("should increment login_count and last_login when authenticated", function(done) {
        user.save(function(err) {
            if (err)
                done(err);

            user.authenticate('password').should.be.true;
            user.model(user.constructor.modelName).findOne({
                    _id: user._id
                },
                function(err, reloadedUser) {
                    if (err)
                        done(err);

                    reloadedUser.login_count.should.be.equal(1);
                    done();
                }
            );
        });

    });

    it("should strip password and other sensitive fields from JSON presentation", function() {
        user.toJSON.should.not.have.property('hashedPassword');
        user.toJSON.should.not.have.property('__v');
        user.toJSON.should.not.have.property('salt');
    });

    it("should remove users employer", function(done) {
        user.save(function(er) {
            User.removeFromEmployer(employer._id, function(err, changed) {
                User.find({_id: user._id}, function(err, data) {
                    data[0].employers.length.should.be.equal(0);
                    done();
                });
            });
        });


    });

});
