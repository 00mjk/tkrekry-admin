'use strict';

var helper = require('../spec_helper'),
    should = helper.should,
    factory = helper.factory,
    Advertisement = helper.Advertisement,
    Employer = helper.Employer,
    User = helper.User,
    async = helper.async,
    _ = helper._,
    session = helper.session;

var firstsEmployer,
  userEmployer,
  otherEmployer,
  adminUse,
  normalUser,
  secondNormalUser,
  userDefaults = {
    provider: 'local',
    first_name: 'First name',
    last_name: 'Last name',
    email: 'test@test.com',
    password: 'password',
    role: 'user'
  };

describe( 'user management', function () {
  beforeEach( function ( done ) {
    async.waterfall( [
        function(cb) {
          User.remove({}, function() {
            Advertisement.remove({}, function() {
              Employer.remove({}, function() {
                cb(null);
              });
            });
          });
        },
        function ( cb ) {
          factory( 'employer', {}, function ( sampleUserEmployer ) {
            userEmployer = sampleUserEmployer;
            factory( 'employer', {}, function ( randomEmployer ) {
              firstsEmployer = randomEmployer
              factory( 'employer', {}, function ( secondRandomEmployer ) {
                otherEmployer = secondRandomEmployer;
                cb( null, sampleUserEmployer, randomEmployer );
              } );
            } );

          } );
        },
        function ( sampleUserEmployer, randomEmployer, cb ) {
          factory( 'user',
            _.merge( userDefaults, {
              employers: [ sampleUserEmployer._id ],
              email: 'test@test.com',
              role: 'user'
            } ),
            function ( createdUser ) {
              normalUser = createdUser;

              factory( 'user',
                _.merge( userDefaults, {
                  role: 'admin',
                  email: 'admin@test.com'
                } ),
                function ( adminUser ) {
                  adminUser = adminUser;

                  factory( 'user',
                    _.merge( userDefaults, {
                      role: 'user',
                      email: 'test-2@test.com'
                    } ),
                    function ( secondUser ) {
                      secondNormalUser = secondUser;
                      cb( null, sampleUserEmployer, randomEmployer );
                    } );
                } );
            }
          );
        },
        function ( sampleUserEmployer, randomEmployer, cb ) {
          var count = 0;
          var _advertisementsForUser = [],
            _advertisements = [];

          async.whilst(
            function () {
              return count < 2;
            },
            function ( callback ) {
              count++;
              factory.create( 'advertisement', {
                employer: sampleUserEmployer
              }, function ( advertisementForUser ) {
                _advertisementsForUser.push( advertisementForUser );
                factory.create( 'advertisement', {
                  employer: randomEmployer
                }, function ( ad ) {
                  _advertisements.push( ad );
                  callback( null, _advertisementsForUser, _advertisements );
                } );

              } );
            },
            function ( err ) {
              cb( err, _advertisementsForUser, _advertisements, sampleUserEmployer, randomEmployer );
            }
          );
        },
      ],

      function ( err, _advertisementsForUser, _advertisements, _userEmployer, _otherEmployer ) {
        done();
      } );
  } );


  describe( 'authenticated user', function () {
    beforeEach( function ( done ) {
      this.userSession = session(helper.app);

      this.userSession
        .post( '/api/session' )
        .send( {
          email: 'test@test.com',
          password: 'password'
        } )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        if ( err ) return done( err );
        return done();
      }
    } );

    it('POST /api/users is not allowed for normal user', function (done) {
       this.userSession
        .post( '/api/users')
        .send(userDefaults)
        .expect( 403 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );

          done();
        });
    } );

    it( 'DELETE /api/users/:userId is not allowed for normal user', function ( done ) {
      this.userSession
        .delete( '/api/users/' + secondNormalUser._id)
        .expect( 403 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );

          done();
        });
    } );


    afterEach( function ( done ) {
      this.userSession
        .delete( '/api/session' )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        if ( err ) return done( err );
        return done();
      }
    } );
  } );

  describe( 'authenticated admin', function () {
    beforeEach( function ( done ) {
      this.userSession = session(helper.app);
      this.userSession
        .post( '/api/session' )
        .send( {
          email: 'admin@test.com',
          password: 'password'
        } )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        if ( err ) return done( err );
        return done();
      }
    } );

    it('POST /api/users is allowed for admin user', function (done) {
       this.userSession
        .post( '/api/users')
        .send(_.merge(userDefaults, {email: 'new-user@email.com'}))
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        });
    });

    it('POST /api/users wont create user with existing email', function (done) {
       this.userSession
        .post( '/api/users')
        .send(userDefaults)
        .expect( 400 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        });
    });

    it( 'DELETE /api/users/:userId is allowed for admin user', function ( done ) {
      this.userSession
        .delete( '/api/users/' + secondNormalUser._id)
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );

          done();
        });
    } );


    afterEach( function ( done ) {
      this.userSession
        .delete( '/api/session' )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        if ( err ) return done( err );
        return done();
      }
    } );
  } );

} );
