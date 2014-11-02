'use strict';

var debug  = require('debug')('tkrekry:controllers:employers'),
    mongoose = require('mongoose'),
    express  = require('express'),
    routes = express.Router(),
    middleware = require('../middleware'),
    Employer = mongoose.model('Employer'),
    Advertisement = mongoose.model('Advertisement'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    Contact = mongoose.model('Contact'),
    Office = mongoose.model('Office'),
    async = require('async'),
    sessionFilters = require('./session');

routes.use(middleware.disableCache);

routes.get('/', function(req, res) {
    sessionFilters.filterByUser(req.user, function(err, employers) {
        if (err) {
            debug("error %o while trying to find all", err);
            return res.status(500).json({});
        }

        Employer.findAllByEmployers(employers, function(err, employers) {
          if (err) {
            debug("error %o while trying to find all", err);
            return res.status(500).json({});
          }

          if ( employers && employers.length > 0 ) {
            debug( "filtering by %o employers", employers );
          }

          return res.status(200).json(_.sortBy(employers, ['name']));
        });
    });
});

routes.get('/:id', function(req, res) {
    Employer.get(req.params.id, function(err, employer) {
        if (err) {
            debug("error %o while trying to find with '%s'", err, req.params.id);
            return res.status(404).json({});
        } else {
            return res.status(200).json(employer);
        }
    });
});

routes.post('/', middleware.auth, function(req, res) {
    sessionFilters.isAllowed(req.user, req.body.employer, function(allowed) {
        if (!allowed) {
            debug( "%s %s is trying to create employer without correct rights", req.user.first_name, req.user.last_name);
            return res.status(403).json({});
        }
        var employer = new Employer(req.body.employer);
        employer.save(function(err, data) {
            if (err) {
                debug("error: '%o' when %s %s was trying to create employer.", err, req.user.first_name, req.user.last_name);
                return res.status(500).json(err);
            } else {
                return res.status(201).json({});
            }
        });
    });
});


routes.put('/:id', middleware.auth, function(req, res) {
    Employer.get(req.params.id, function(err, employer) {
        if (err) {
          debug("error %o while trying to find with '%s'", err, req.params.id);
          return res.status(404).json({});
        }

        if ( !employer ) {
            debug("error %o while trying to find with '%s'", err, req.params.id);
            return res.status(404).json({});
        }

        var updateEmployer = req.body;
        var updateEmployerId = updateEmployer._id;

        delete updateEmployer._id;
        delete updateEmployer.__v;

        sessionFilters.isAllowed(req.user, [updateEmployerId, employer._id], function(allowed) {
            if (!allowed) {
                debug( "%s %s is trying to update employer (%s) without correct rights", req.user.first_name, req.user.last_name, employer._id);
                return res.status(403).json({});
            }

            var contacts = _.reduce(updateEmployer.contacts, function(list, contact) {
                contact.employer = updateEmployerId;
                delete contact._id;
                return list.concat(contact);
            }, []);

            var offices = _.reduce(updateEmployer.offices, function(list, office) {
                office.employer = updateEmployerId;
                delete office._id;
                return list.concat(office);
            }, []);

            var users = _.reduce(updateEmployer.users, function(list, user) {
                return list.concat(user.id);
            }, []);

            delete updateEmployer.contacts;
            delete updateEmployer.offices;
            delete updateEmployer.users;

            updateEmployer.updated_at = new Date();

            Employer.findByIdAndUpdate(employer._id,
                updateEmployer, {
                    safe: true,
                    upsert: true
                },
                function(err, data) {
                    if (err) {
                        debug("error: '%o' failed to update employer (%s) %s", err, updateEmployer._id, updateEmployer.name);
                        return res.status(422).json(err);
                    } else {
                        async.series([
                            function(callback) {
                                User.removeFromEmployer(employer._id, callback);
                            },
                            function(callback) {
                                User.addToEmployer(users, employer._id, callback);
                            },
                            function(callback) {
                                Office.setAllByEmployers(employer._id, offices, callback);
                            },
                            function(callback) {
                                Contact.setAllByEmployers(employer._id, contacts, callback);
                            }
                        ], function(erros, results) {
                            Employer.update({
                                _id: employer._id
                            }, {
                                offices: results[2],
                                contacts: results[3]
                            }, function(err) {
                                if (err) {
                                    return res.status(500).json({});
                                }

                                return res.status(200).json({});
                            });
                        });
                    }
                });
        });
    });
});

routes.delete('/:id', middleware.auth, function(req, res) {
    Employer.get(req.params.id, function(err, employer) {
        if (err) {
          debug("error %o while trying to find with '%s'", err, req.params.id);
          return res.status(404).json({});
        }

        if ( !employer ) {
            debug("error %o while trying to find with '%s'", err, req.params.id);
            return res.status(404).json({});
        }

        sessionFilters.isAllowed(req.user, employer._id, function(allowed) {
            if (!allowed) {
                debug( "%s %s is trying to delete employer (%s) without correct rights", req.user.first_name, req.user.last_name, employer._id);
                return res.status(403).json({});
            }

            Employer.delete(employer._id, function(err, result) {
                debug("Employer destroyd: % by %s %s", employer.name, req.user.first_name, req.user.last_name);
                return res.status(200).json(req.params.id);
            });
        });
    });
});

module.exports = routes;