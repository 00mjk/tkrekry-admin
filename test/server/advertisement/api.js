'use strict';

var helper = require('../spec_helper'),
    should = helper.should,
    factory = helper.factory,
    Advertisement = helper.Advertisement,
    Employer = helper.Employer,
    User = helper.User,
    async = helper.async,
    _ = helper._,
    Session = helper.Session;

var advertisementsForUser = [],
  advertisementsForUserIds = '',
  advertisements = [],
  advertisementIds = '',
  allAdvertisements = [],
  allAdvertisementsIds = '',
  employer,
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

describe( '/api/advertisements', function () {
  beforeEach( function ( done ) {
    async.waterfall( [
        function(cb) {
          User.remove({}, function(err, result) {
            Advertisement.remove({}, function(err, result) {
              Employer.remove({}, function(err, result) {
                cb(err);
              });
            });
          });
        },
        function ( cb ) {
          factory( 'employer', {}, function ( sampleUserEmployer ) {
            factory( 'employer', {}, function ( randomEmployer ) {
              factory( 'employer', {}, function ( randomEmployer ) {
                cb( null, sampleUserEmployer, randomEmployer );
              } );
            } );
          } );
        },
        function ( sampleUserEmployer, randomEmployer, cb ) {
          factory( 'user', _.merge( userDefaults, {
            employers: [ sampleUserEmployer._id ],
            email: 'test@test.com',
            role: 'user'
          } ), function ( createdUser ) {
            factory( 'user', _.merge( userDefaults, {
              role: 'admin',
              email: 'admin@test.com'
            } ), function () {
              cb( null, sampleUserEmployer, randomEmployer );
            } );
          } );
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
        advertisements = _.sortBy( _advertisements, 'updated_at' );
        advertisementIds = _.reduce( advertisements, function ( list, advert ) {
          return [ advert._id, list ].join( '-' );
        }, '' );

        allAdvertisements = _.sortBy( _advertisements.concat( _advertisementsForUser ), 'updated_at' );
        allAdvertisementsIds = _.reduce( allAdvertisements, function ( list, advert ) {
          return [ advert._id, list ].join( '-' );
        }, '' );


        advertisementsForUser = _.sortBy( _advertisementsForUser, 'updated_at' );
        advertisementsForUserIds = _.reduce( advertisementsForUser, function ( list, advert ) {
          return [ advert._id, list ].join( '-' );
        }, '' );

        userEmployer = _userEmployer;
        otherEmployer = _otherEmployer;

        done();
      } );
  } );

  describe( 'not autheticated user', function () {

    beforeEach( function () {
      this.sess = new Session();
    } );

    afterEach( function () {
      this.sess.destroy();
    } );


    it( 'GET /api/advertisement should respond with JSON array containing elements in correct order', function ( done ) {
      this.sess
        .get( '/api/advertisements' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );

          res.body.should.be.instanceof( Array )
            .and.have.lengthOf( allAdvertisements.length );
          _.reduce( res.body, function ( list, item ) {
            return [ item._id, list ].join( '-' );
          }, '' )
            .should.equal( allAdvertisementsIds );
          done();
        } );
    } );

    it( 'POST /api/advertisements is not allowed', function ( done ) {
      var self = this;
      factory.build( 'advertisement', {
        employer: otherEmployer._id
      }, function ( ad ) {
        self.sess
          .post( '/api/advertisements' )
          .send( ad )
          .expect( 401 )
          .expect( 'Content-Type', 'application/json; charset=utf-8' )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } )
      } );
    } );

    it( 'PUT /api/advertisements/:id is not allowed', function ( done ) {
      this.sess
        .put( '/api/advertisements/' + advertisementIds.split( '-' )[ 0 ] )
        .send( advertisements[ 0 ].toJSON() )
        .expect( 401 )
        .expect( 'Content-Type', 'application/json; charset=utf-8' )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'PUT /api/advertisements/1234 is not found', function ( done ) {
      this.sess
        .put( '/api/advertisements/' + advertisementIds.split( '-' )[ 0 ] + 1 )
        .send( advertisements[ 0 ].toJSON() )
        .expect( 401 )
        .expect( 'Content-Type', 'application/json; charset=utf-8' )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'DELETE /api/advertisements/:id is not allowed', function ( done ) {
      this.sess
        .del( '/api/advertisements/' + advertisementIds[ 0 ] )
        .expect( 401 )
        .expect( 'Content-Type', 'application/json; charset=utf-8' )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'POST /api/advertisements/:id/publish is not allowed', function ( done ) {
      this.sess
        .post( '/api/advertisements/' + advertisementIds[ 0 ] + '/publish' )
        .expect( 401 )
        .expect( 'Content-Type', 'application/json; charset=utf-8' )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'POST /api/advertisements/:id/unpublish is not allowed', function ( done ) {
      this.sess
        .post( '/api/advertisements/' + advertisements[ 0 ] + '/unpublish' )
        .expect( 404 )
        .expect( 'Content-Type', 'text/html; charset=utf-8' )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );
  } );

  describe( 'authenticated user', function () {
    beforeEach( function ( done ) {
      this.sess = new Session();

      this.sess
        .post( '/api/session' )
        .send( {
          email: 'test@test.com',
          password: 'password'
        } )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        return done( err );
      }
    } );

    afterEach( function ( done ) {
      this.sess
        .del( '/api/session' )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        return done( err );
      }
    } );

    it( 'GET /api/advertisement should respond with JSON array containing advertisements which are editable', function ( done ) {
      this.sess
        .get( '/api/advertisements' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );

          res.body.should.be.instanceof( Array )
            .and.have.lengthOf( advertisementsForUser.length );
          _.reduce( res.body, function ( list, item ) {
            return [ item._id, list ].join( '-' );
          }, '' )
            .should.equal( advertisementsForUserIds );
          done();
        } );
    } );

    describe( 'not in users employer', function () {

      it( 'POST /api/advertisements is not allowed', function ( done ) {
        var self = this;
        factory.build( 'advertisement', {
          employer: otherEmployer._id
        }, function ( ad ) {
          self.sess
            .post( '/api/advertisements' )
            .send( ad )
            .expect( 403 )
            .end( function ( err, res ) {
              if ( err ) return done( err );
              done();
            } )
        } );
      } );

      it( 'PUT /api/advertisements/:id is not allowed', function ( done ) {
        this.sess
          .put( '/api/advertisements/' + advertisements[ 0 ]._id )
          .send( advertisements[ 0 ].toJSON() )
          .expect( 403 )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'PUT /api/advertisements/1234 is not found', function ( done ) {
        this.sess
          .put( '/api/advertisements/' + advertisementIds.split( '-' )[ 0 ] + 1 )
          .send( advertisements[ 0 ].toJSON() )
          .expect( 404 )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'DELETE /api/advertisements/:id is not allowed', function ( done ) {
        this.sess
          .del( '/api/advertisements/' + advertisements[ 0 ]._id )
          .expect( 403 )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'POST /api/advertisements/:id/publish is not allowed', function ( done ) {
        this.sess
          .post( '/api/advertisements/' + advertisements[ 0 ]._id + '/publish' )
          .expect( 403 )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'POST /api/advertisements/:id/unpublish is not allowed', function ( done ) {
        this.sess
          .post( '/api/advertisements/' + advertisements[ 0 ]._id + '/unpublish' )
          .expect( 403 )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );
    } );

    describe( 'in users employer', function () {
      it( 'POST /api/advertisements is', function ( done ) {
        var self = this;
        factory.build( 'advertisement', {
          employer: userEmployer._id
        }, function ( ad ) {
          self.sess
            .post( '/api/advertisements' )
            .send( ad )
            .expect( 200 )
            .expect( 'Content-Type', /json/ )
            .end( function ( err, res ) {
              if ( err ) return done( err );
              done();
            } )
        } );
      } );

      it( 'PUT /api/advertisements/:id is allowed', function ( done ) {
        this.sess
          .put( '/api/advertisements/' + advertisementsForUser[ 0 ]._id )
          .send( advertisementsForUser[ 0 ].toJSON() )
          .expect( 200 )
          .expect( 'Content-Type', /json/ )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'PUT /api/advertisements/1234 is not found', function ( done ) {
        this.sess
          .put( '/api/advertisements/' + advertisementsForUserIds.split( '-' )[ 0 ] + 1 )
          .send( advertisements[ 0 ].toJSON() )
          .expect( 404 )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'DELETE /api/advertisements/:id is allowed', function ( done ) {
        this.sess
          .del( '/api/advertisements/' + advertisementsForUser[ 1 ]._id )
          .expect( 200 )
          .expect( 'Content-Type', /json/ )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'POST /api/advertisements/:id/publish is allowed', function ( done ) {
        this.sess
          .post( '/api/advertisements/' + advertisementsForUser[ 0 ]._id + '/publish' )
          .expect( 200 )
          .expect( 'Content-Type', /json/ )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );

      it( 'POST /api/advertisements/:id/unpublish is allowed', function ( done ) {
        this.sess
          .post( '/api/advertisements/' + advertisementsForUser[ 0 ]._id + '/unpublish' )
          .expect( 200 )
          .expect( 'Content-Type', /json/ )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } );
      } );
    } );
  } );


  describe( 'admin user', function () {
    beforeEach( function ( done ) {
      this.sess = new Session();

      this.sess
        .post( '/api/session' )
        .send( {
          email: 'admin@test.com',
          password: 'password'
        } )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        return done( err );
      }
    } );

    afterEach( function ( done ) {
      this.sess
        .del( '/api/session' )
        .expect( 200 )
        .end( onResponse );

      function onResponse( err, res ) {
        return done( err );
      }
    } );

    it( 'GET /api/advertisement should respond with JSON array containing advertisements which are editable', function ( done ) {
      this.sess
        .get( '/api/advertisements' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );

          res.body.should.be.instanceof( Array )
            .and.have.lengthOf( allAdvertisements.length );
          _.reduce( res.body, function ( list, item ) {
            return [ item._id, list ].join( '-' );
          }, '' )
            .should.equal( allAdvertisementsIds );
          done();
        } );
    } );

    it( 'POST /api/advertisements is', function ( done ) {
      var self = this;
      factory.build( 'advertisement', {
        employer: userEmployer._id
      }, function ( ad ) {
        self.sess
          .post( '/api/advertisements' )
          .send( ad )
          .expect( 200 )
          .expect( 'Content-Type', /json/ )
          .end( function ( err, res ) {
            if ( err ) return done( err );
            done();
          } )
      } );
    } );

    it( 'PUT /api/advertisements/:id is allowed', function ( done ) {
      this.sess
        .put( '/api/advertisements/' + advertisementsForUser[ 0 ]._id )
        .send( advertisementsForUser[ 0 ].toJSON() )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'PUT /api/advertisements/1234 is not found', function ( done ) {
      this.sess
        .put( '/api/advertisements/' + advertisementsForUserIds.split( '-' )[ 0 ] + 1 )
        .send( advertisements[ 0 ].toJSON() )
        .expect( 404 )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'DELETE /api/advertisements/:id is allowed', function ( done ) {
      this.sess
        .del( '/api/advertisements/' + advertisementsForUser[ 1 ]._id )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'POST /api/advertisements/:id/publish is allowed', function ( done ) {
      this.sess
        .post( '/api/advertisements/' + advertisementsForUser[ 0 ]._id + '/publish' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );

    it( 'POST /api/advertisements/:id/unpublish is allowed', function ( done ) {
      this.sess
        .post( '/api/advertisements/' + advertisementsForUser[ 0 ]._id + '/unpublish' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function ( err, res ) {
          if ( err ) return done( err );
          done();
        } );
    } );
  } );

} );
