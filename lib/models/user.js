'use strict';

var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
    last_name: {
        type: String
    },
    first_name: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        index: true
    },
    fallback_email: {
        type: String
    },
    last_login: {
        type: Date,
        default: new Date()
    },
    previous_login: {
        type: Date
    },
    login_count: {
        type: Number,
        default: 0
    },
    employers: [{
        type: Schema.ObjectId,
        ref: 'Employer'
    }],
    role: {
        type: String,
        default: 'user'
    },
    hashedPassword: {
        type: String
    },
    provider: {
        type: String
    },
    salt: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

// Basic info to identify the current authenticated user in the app
UserSchema
    .virtual('userInfo')
    .get(function() {
        return {
            'id': this._id,
            'first_name': this.first_name,
            'last_name': this.last_name,
            'email': this.email,
            'role': this.role,
            'provider': this.provider,
            'employers': this.employers,
            'phone': this.phone,
            'last_login': this.last_login,
            'previous_login': this.previous_login,
            'login_count': this.login_count,
            'fallback_email': this.fallback_email,
            'updated_at': this.updated_at,
            'full_name': [this.last_name, this.first_name].join(', '),
        };
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            'id': this._id,
            'full_name': [this.last_name, this.first_name].join(', '),
            'first_name': this.first_name,
            'last_name': this.last_name,
            'role': this.role,
            'employers': this.employers
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function(value) {
        return value.length;
    }, 'Sähköposti ei voi olla tyhjä');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function(hashedPassword) {
        return hashedPassword.length;
    }, 'Salasana ei voi olla tyhjä');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        this.constructor.findOne({
            email: value
        }, function(err, user) {
            if (err) throw err;
            if (user) {
                if (String(self._id) === String(user._id)) return respond(true);
                return respond(false);
            }
            respond(true);
        });
    }, 'sähköposti on jo käytössä');


UserSchema
    .path('first_name')
    .validate(function(first_name) {
        return first_name.length;
    }, 'Etunimi ei voi olla tyhjä');


UserSchema
    .path('last_name')
    .validate(function(last_name) {
        return last_name.length;
    }, 'Etunimi ei voi olla tyhjä');


var validatePresenceOf = function(value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {

        var now = new Date();
        this.updated_at = now;
        if (!this.created_at) {
            this.created_at = now;
        }

        if (!this.isNew) return next();

        if (!validatePresenceOf(this.hashedPassword))
            next(new Error('Invalid password'));
        else
            next();
    });

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        var valid = this.encryptPassword(plainText) === this.hashedPassword;
        if (valid) {
            this.update({
                $inc: {
                    login_count: 1
                },
                previous_login: this.last_login,
                last_login: new Date()
            }, {
                w: 1
            }, function(err, doc) {});
        }

        return valid;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

UserSchema.statics = {
    removeFromEmployer: function(employerId, callback) {
        this.update({
            employers: {
                $in: [employerId]
            }
        }, {
            $pull: {
                employers: employerId
            }
        }, {
            multi: true
        }, callback);
    },

    addToEmployer: function(userIds, employerId, callback) {
        this.update({
            _id: {
                $in: userIds
            }
        }, {
            $push: {
                employers: employerId
            }
        }, {
            multi: true
        }, callback);
    }

};


UserSchema.set('toJSON', {
    transform: function(doc, json_response, options) {
        delete json_response.__v;
        delete json_response.hashedPassword;
        return json_response;
    }
});

module.exports = mongoose.model('User', UserSchema);
