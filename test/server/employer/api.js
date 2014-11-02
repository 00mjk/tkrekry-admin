'use strict';

var should = require('should'),
    app = require('../../../server'),
    factory = require('../../support/fixtures/factory'),
    mongoose = require('mongoose'),
    Advertisement = mongoose.model('Advertisement'),
    Employer = mongoose.model('Employer'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash'),
    Session = require('supertest-session')({
        app: app
    });

var firstsEmployer,
    userEmployer,
    otherEmployer,
    userDefaults = {
        provider: 'local',
        first_name: 'First name',
        last_name: 'Last name',
        email: 'test@test.com',
        password: 'password',
        role: 'user'
    };


describe('/api/employers', function() {
    beforeEach(function(done) {
        User.remove().exec();
        Advertisement.remove().exec();
        Employer.remove().exec();

        async.waterfall([
                function(cb) {
                    factory('employer', {}, function(sampleUserEmployer) {
                        userEmployer = sampleUserEmployer;
                        factory('employer', {}, function(randomEmployer) {
                            firstsEmployer = randomEmployer
                            factory('employer', {}, function(secondRandomEmployer) {
                                otherEmployer = secondRandomEmployer;
                                cb(null, sampleUserEmployer, randomEmployer);
                            });
                        });

                    });
                },
                function(sampleUserEmployer, randomEmployer, cb) {
                    factory('user', _.merge(userDefaults, {
                        employers: [sampleUserEmployer._id],
                        email: 'test@test.com',
                        role: 'user'
                    }), function(createdUser) {
                        factory('user', _.merge(userDefaults, {
                            role: 'admin',
                            email: 'admin@test.com'
                        }), function() {
                            cb(null, sampleUserEmployer, randomEmployer);
                        });
                    });
                },
                function(sampleUserEmployer, randomEmployer, cb) {
                    var count = 0;
                    var _advertisementsForUser = [],
                        _advertisements = [];

                    async.whilst(
                        function() {
                            return count < 2;
                        },
                        function(callback) {
                            count++;
                            factory.create('advertisement', {
                                employer: sampleUserEmployer
                            }, function(advertisementForUser) {
                                _advertisementsForUser.push(advertisementForUser);
                                factory.create('advertisement', {
                                    employer: randomEmployer
                                }, function(ad) {
                                    _advertisements.push(ad);
                                    callback(null, _advertisementsForUser, _advertisements);
                                });

                            });
                        },
                        function(err) {
                            cb(err, _advertisementsForUser, _advertisements, sampleUserEmployer, randomEmployer);
                        }
                    );
                },
            ],

            function(err, _advertisementsForUser, _advertisements, _userEmployer, _otherEmployer) {
                done();
            });
    });

    describe('not autheticated user', function() {

        beforeEach(function() {
            this.sess = new Session();
        });

        afterEach(function() {
            this.sess.destroy();
        });

        it('GET /api/employers should respond with JSON array containing elements in correct order', function(done) {
            var ids = _.sortBy([otherEmployer, userEmployer, firstsEmployer], ['name']).map(function(d) {
                return d.name;
            }).join('-');

            this.sess
                .get('/api/employers')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.be.instanceof(Array).and.have.lengthOf(3);
                    _.map(res.body, function(d) {
                        return d.name;
                    }).join('-').should.equal(ids);
                    done();
                });
        });


        it('POST /api/employers is not allowed', function(done) {
            var self = this;
            factory.build('employer', {}, function(employer) {
                self.sess
                    .post('/api/employers')
                    .send(employer)
                    .expect(401)
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    })
            });
        });

        it('PUT /api/employers/:id is not allowed', function(done) {
            this.sess
                .put('/api/employers/' + firstsEmployer._id)
                .send(firstsEmployer.toJSON())
                .expect(401)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('PUT /api/employers/1234 is not found', function(done) {
            this.sess
                .put('/api/employers/' + otherEmployer._id + '0')
                .send(otherEmployer.toJSON())
                .expect(401)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('DELETE /api/employers/:id is not allowed', function(done) {
            this.sess
                .del('/api/employers/' + otherEmployer._id)
                .expect(401)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

    });

    describe('authenticaed user', function() {
        beforeEach(function(done) {
            this.sess = new Session();

            this.sess
                .post('/api/session')
                .send({
                    email: 'test@test.com',
                    password: 'password'
                })
                .expect(200)
                .end(onResponse);

            function onResponse(err, res) {
                if (err) return done(err);
                return done();
            }
        });

        afterEach(function(done) {
            this.sess
                .del('/api/session')
                .expect(200)
                .end(onResponse);

            function onResponse(err, res) {
                if (err) return done(err);
                return done();
            }
        });

        it('GET /api/employer should respond with JSON array containing employers which are editable', function(done) {
            this.sess
                .get('/api/employers')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.be.instanceof(Array).and.have.lengthOf(1);
                    _.reduce(res.body, function(list, item) {
                        return [item._id, list].join('');
                    }, '').should.equal(userEmployer._id + '');
                    done();
                });
        });

        describe('not in users employer', function() {

            it('POST /api/employers is not allowed', function(done) {
                var self = this;
                factory.build('employer', {}, function(ad) {
                    self.sess
                        .post('/api/employers')
                        .send(ad)
                        .expect(403)
                        .end(function(err, res) {
                            if (err) return done(err);
                            done();
                        })
                });
            });

            it('PUT /api/employers/:id is not allowed', function(done) {
                this.sess
                    .put('/api/employers/' + otherEmployer._id)
                    .send(otherEmployer.toJSON())
                    .expect(403)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });

            it('PUT /api/employers/1234 is not found', function(done) {
                this.sess
                    .put('/api/employers/' + otherEmployer._id + 1)
                    .send(otherEmployer.toJSON())
                    .expect(404)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });

            it('DELETE /api/employers/:id is not allowed', function(done) {
                this.sess
                    .del('/api/employers/' + otherEmployer._id)
                    .expect(403)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });
        });

        describe('in users employer', function() {
            it('POST /api/employers is', function(done) {
                var self = this;
                factory.build('employer', {}, function(ad) {
                    self.sess
                        .post('/api/employers')
                        .send(ad)
                        .expect(403)
                        .expect('Content-Type', /json/)
                        .end(function(err, res) {
                            if (err) return done(err);
                            done();
                        })
                });
            });

            it('PUT /api/employers/:id is allowed', function(done) {
                this.sess
                    .put('/api/employers/' + userEmployer._id)
                    .send(userEmployer.toJSON())
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });

            it('PUT /api/employers/1234 is not found', function(done) {
                this.sess
                    .put('/api/employers/' + userEmployer._id + 1)
                    .send(userEmployer.toJSON())
                    .expect(404)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });

            it('DELETE /api/employers/:id is allowed', function(done) {
                this.sess
                    .del('/api/employers/' + userEmployer._id)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    });
            });
        });
    });


    describe('admin user', function() {
        beforeEach(function(done) {
            this.sess = new Session();

            this.sess
                .post('/api/session')
                .send({
                    email: 'admin@test.com',
                    password: 'password'
                })
                .expect(200)
                .end(onResponse);

            function onResponse(err, res) {
                if (err) return done(err);
                return done();
            }
        });

        afterEach(function(done) {
            this.sess
                .del('/api/session')
                .expect(200)
                .end(onResponse);

            function onResponse(err, res) {
                if (err) return done(err);
                return done();
            }
        });

        it('GET /api/employer should respond with JSON array containing employers which are editable', function(done) {
            var ids = _.sortBy([otherEmployer, userEmployer, firstsEmployer], ['name']).map(function(d) {
                return d.name;
            }).join('-');

            this.sess
                .get('/api/employers')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.be.instanceof(Array).and.have.lengthOf(3);
                    _.map(res.body, function(d) {
                        return d.name;
                    }).join('-').should.equal(ids);
                    done();
                });
        });

        it('POST /api/employers is', function(done) {
            var self = this;
            factory.build('employer', {}, function(ad) {
                self.sess
                    .post('/api/employers')
                    .send(ad)
                    .expect(403)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        done();
                    })
            });
        });

        it('PUT /api/employers/:id is allowed', function(done) {
            this.sess
                .put('/api/employers/' + otherEmployer._id)
                .send(otherEmployer.toJSON())
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('PUT /api/employers/1234 is not found', function(done) {
            this.sess
                .put('/api/employers/' + firstsEmployer._id + '1')
                .send(firstsEmployer.toJSON())
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('DELETE /api/employers/:id is allowed', function(done) {
            this.sess
                .del('/api/employers/' + firstsEmployer._id)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

    });
});
