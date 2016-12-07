var Factory = require('factory-lady'),
    Faker = require('faker'),
    mongoose = require('mongoose'),
    Employer = mongoose.model('Employer'),
    Advertisement = mongoose.model('Advertisement'),
    Office = mongoose.model('Office'),
    Contact = mongoose.model('Contact'),
    User = mongoose.model('User');

var emailCounter = 1;

Factory.define('employer', Employer, {
    name: Faker.company.companyName(),
    short_name: Faker.company.companySuffix(),
    email: function(cb) {
        cb('user' + emailCounter+++'@example.com');
    },
    domain: { id: 'domain-id' },
    district: { id: 'district-id' },
    general_presentation: function(cb) {
        cb(Faker.lorem.paragraphs(2))
    },
    training_presentation: function(cb) {
        cb(Faker.lorem.paragraphs(2))
    },
    suitable_for_specialization: true,
    general_presentation_link: 'http://' + Faker.internet.domainName() + '.com',
    advertisement_count: 1,
    latest_advertisement: new Date(),
    last_user_login: new Date(),
    last_office_update: new Date(),
    last_contact_update: new Date()
});

Factory.define('user', User, {
    provider: 'local',
    first_name: function(cb) {
        cb(Faker.name.firstName())
    },
    last_name: function(cb) {
        cb(Faker.name.lastName())
    },
    email: function(cb) {
        cb('user' + emailCounter+++'@example.com');
    },
    phone: Faker.phone.phoneNumber(),
    last_login: new Date(),
    login_count: 0,
    is_admin: true,
    employers: [Factory.assoc('employer', 'id'), Factory.assoc('employer', 'id')]
});

Factory.define('contact', Contact, {
    name: [Faker.name.firstName(), Faker.name.lastName()].join(' '),
    title: 'Ylilääkäri',
    email: function(cb) {
        cb('user' + emailCounter+++'@example.com');
    },
    phone: Faker.phone.phoneNumber(),
    employer: Factory.assoc('employer', 'id')
});

Factory.define('office', Office, {
    name: Faker.company.companyName(),
    street: Faker.address.streetAddress(),
    web_address: 'http://' + Faker.internet.domainName() + '.com',
    postal_code: Faker.helpers.replaceSymbolWithNumber('#####'),
    locality: Faker.address.county(),
    geo: [Faker.address.latitude(), Faker.address.longitude()],
    employer: Factory.assoc('employer', 'id')
});

Factory.define('advertisement', Advertisement, {
    office: {},
    contacts: [{
        _id: '5389f53cc67dbf0254fc589c',
        name: [Faker.name.firstName(), Faker.name.lastName()].join(' '),
        title: 'Ylilääkäri',
        email: function(cb) {
            cb('user' + emailCounter+++'@example.com');
        },
        phone: Faker.phone.phoneNumber()
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
    title: Faker.lorem.sentence(),
    employer: Factory.assoc('employer', 'id'),
    work_beings: Faker.lorem.sentence(),
    application_placed_on: new Date(),
    working_hours: Faker.lorem.sentence(),
    work_begins: Faker.lorem.sentence(),
    duration: {},
    application_period_end: new Date(),
    application_email: Faker.internet.email(),
    alternative_method: Faker.lorem.sentence(),
    published: true,
    published_at: new Date(),
    description: Faker.lorem.paragraphs(2)
});

module.exports = Factory;
