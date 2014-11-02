var Factory = require('factory-lady'),
    Faker = require('Faker'),
    mongoose = require('mongoose'),
    Employer = mongoose.model('Employer'),
    Advertisement = mongoose.model('Advertisement'),
    Office = mongoose.model('Office'),
    Contact = mongoose.model('Contact'),
    User = mongoose.model('User');

var emailCounter = 1;

Factory.define('employer', Employer, {
    name: Faker.Company.companyName(),
    short_name: Faker.Company.companySuffix(),
    email: function(cb) {
        cb('user' + emailCounter+++'@example.com');
    },
    domain: {},
    district: {},
    general_presentation: function(cb) {
        cb(Faker.Lorem.paragraphs(2))
    },
    training_presentation: function(cb) {
        cb(Faker.Lorem.paragraphs(2))
    },
    suitable_for_specialization: true,
    general_presentation_link: 'http://' + Faker.Internet.domainName() + '.com',
    advertisement_count: 1,
    latest_advertisement: new Date(),
    last_user_login: new Date(),
    last_office_update: new Date(),
    last_contact_update: new Date()
});

Factory.define('user', User, {
    provider: 'local',
    first_name: function(cb) {
        cb(Faker.Name.firstName())
    },
    last_name: function(cb) {
        cb(Faker.Name.lastName())
    },
    email: function(cb) {
        cb('user' + emailCounter+++'@example.com');
    },
    phone: Faker.PhoneNumber.phoneNumber(),
    last_login: new Date(),
    login_count: 0,
    is_admin: true,
    employers: [Factory.assoc('employer', 'id'), Factory.assoc('employer', 'id')]
});

Factory.define('contact', Contact, {
    name: [Faker.Name.firstName(), Faker.Name.lastName()].join(' '),
    title: 'Ylilääkäri',
    email: function(cb) {
        cb('user' + emailCounter+++'@example.com');
    },
    phone: Faker.PhoneNumber.phoneNumber(),
    employer: Factory.assoc('employer', 'id')
});

Factory.define('office', Office, {
    name: Faker.Company.companyName(),
    street: Faker.Address.streetAddress(),
    web_address: 'http://' + Faker.Internet.domainName() + '.com',
    postal_code: Faker.Helpers.replaceSymbolWithNumber('#####'),
    locality: Faker.Address.ukCounty(),
    geo: [Faker.Address.latitude(), Faker.Address.longitude()],
    employer: Factory.assoc('employer', 'id')
});

Factory.define('advertisement', Advertisement, {
    office: {},
    contacts: [{
        _id: '5389f53cc67dbf0254fc589c',
        name: [Faker.Name.firstName(), Faker.Name.lastName()].join(' '),
        title: 'Ylilääkäri',
        email: function(cb) {
            cb('user' + emailCounter+++'@example.com');
        },
        phone: Faker.PhoneNumber.phoneNumber()
    }],
    job_type: {
        "name": {
            "fi": "Lyhyt sijaisuus",
            "sv": "Kort vikariat"
        },
        "id": "lyhyt-sijaisuus"
    },
    job_profession_group: {
        "name": {
            "fi": "Lääkäri",
            "sv": "Läkare"
        },
        "id": "laakari"
    },
    job_duration: {
        "name": {
            "fi": "Toistaiseksi",
            "sv": "Hittills"
        },
        "id": "toistaiseksi"
    },
    title: Faker.Lorem.sentence(),
    employer: Factory.assoc('employer', 'id'),
    work_beings: Faker.Lorem.sentence(),
    application_placed_on: new Date(),
    working_hours: Faker.Lorem.sentence(),
    work_begins: Faker.Lorem.sentence(),
    duration: {},
    application_period_end: new Date(),
    application_email: Faker.Internet.email(),
    alternative_method: Faker.Lorem.sentence(),
    published: true,
    published_at: new Date(),
    description: Faker.Lorem.paragraphs(2)
});

module.exports = Factory;
