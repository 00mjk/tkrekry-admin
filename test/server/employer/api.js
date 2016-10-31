'use strict';

const helper = require('../spec_helper');
const should = helper.should;
const factory = helper.factory;
const Advertisement = helper.Advertisement;
const Employer = helper.Employer;
const User = helper.User;
const _ = helper._;
const session = helper.session;
const createFactory = helper.createFactory;
const buildFactory = helper.buildFactory;
const Promise = require('bluebird');

const userDefaults = {
  provider: 'local',
  first_name: 'First name',
  last_name: 'Last name',
  email: 'test@test.com',
  password: 'password',
  role: 'user'
};

const setupDB = () =>
  helper.resetDB().then(helper.createEmployers)
    .then((employers) =>
      Promise.join(
        helper.createUsers(userDefaults, employers),
        helper.advertisementForEmployers(employers),
        (users, advertisements) => [employers, users, advertisements]
      ));

describe('/api/employers', function () {
  describe('not autheticated user', function () {
    beforeEach(() =>
      Promise.join(
        setupDB(),
        session(helper.app),
        (vars, session) => vars.concat(session)
      ).then((vars) => [this.employers, this.users, this.advertisements, this.userSession] = vars));

    afterEach(() => {
      this.userSession = null, this.employers = null, this.users = null, this.advertisements = null;
    });

    it('GET /api/employers should respond with JSON array containing elements in correct order', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .get('/api/employers')
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, { body: employerList }) => {
            const assertEmployers = _.sortBy(this.employers, ['name']).map((emp) => emp.name).join('-');
            employerList.should.be.instanceof(Array).and.have.lengthOf(3);
            _.map(employerList, (emp) => emp.name).join('-').should.equal(assertEmployers);
            err ? reject(err) : resolve();
          })));

    it('POST /api/employers is not allowed', () =>
      buildFactory('employer', {})
        .call('toJSON')
        .then(_)
        .call('omit', '_id')
        .call('value')
        .then((employerParams) =>
          new Promise((resolve, reject) =>
            this.userSession
              .post('/api/employers')
              .send(employerParams)
              .expect(401)
              .expect('Content-Type', /json/)
              .end((err) => err ? reject(err) : resolve()))));

    it('PUT /api/employers/:id is not allowed', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .put('/api/employers/' + this.employers[0]._id)
          .send(this.employers[0].toJSON())
          .expect(401)
          .expect('Content-Type', /json/)
          .end((err) => err ? reject(err) : resolve())));

    it('DELETE /api/employers/:id is not allowed', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .delete('/api/employers/' + this.employers[2]._id)
          .expect(401)
          .expect('Content-Type', /json/)
          .end((err) => err ? reject(err) : resolve())));
  });

  describe('authenticated user', function () {
    beforeEach(() =>
      setupDB()
        .then(([employers, users, advertisements]) =>
          helper.loginUser(users[0], session(helper.app), employers, users, advertisements))
        .then((vars) => [this.userSession, [this.employers, this.users, this.advertisements]] = vars));

    afterEach(() => {
      this.userSession = null, this.employers = null, this.users = null, this.advertisements = null;
    });

    it('GET /api/employer should respond with JSON array containing employers which are editable', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .get('/api/employers')
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, {body}) => {
            body.should.be.instanceof(Array).and.have.lengthOf(1);
            body[0]._id.should.equal(this.employers[0].id);
            err ? reject(err) : resolve();
          })));

      it('POST /api/employers not in users employer is not allowed ', () =>
          buildFactory('employer', {})
            .call('toJSON')
            .then(_)
            .call('omit', '_id')
            .call('value')
            .then((employerParams) =>
              new Promise((resolve, reject) =>
                this.userSession
                  .post('/api/employers')
                  .send(employerParams)
                  .expect(403)
                  .expect('Content-Type', /json/)
                  .end((err) => err ? reject(err) : resolve()))));

      it('PUT /api/employers/:id not in users employer is not allowed', () =>
        new Promise((resolve, reject) =>
          this.userSession
            .put(`/api/employers/${this.employers[1]._id}`)
            .send(this.employers[1].toJSON())
            .expect(403)
            .expect('Content-Type', /json/)
            .end((err) => err ? reject(err) : resolve())));

      it('PUT /api/employers/1234 not in users employer is not found', () =>
        new Promise((resolve, reject) =>
          this.userSession
            .put(`/api/employers/${this.advertisements[0]._id}`)
            .send(this.employers[1].toJSON())
            .expect(404)
            .expect('Content-Type', /json/)
            .end((err) => err ? reject(err) : resolve())));

      it('DELETE /api/employers/:id not in users employer is not allowed', () =>
        new Promise((resolve, reject) =>
          this.userSession
            .delete(`/api/employers/${this.employers[1]._id}`)
            .expect(403)
            .expect('Content-Type', /json/)
            .end((err) => err ? reject(err) : resolve())));


        it('PUT /api/employers/:id in users employer is allowed', () =>
          new Promise((resolve, reject) =>
            this.userSession
              .put(`/api/employers/${this.employers[0]._id}`)
              .send(this.employers[0].toJSON())
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err) => err ? reject(err) : resolve())));

        it('PUT /api/employers/1234 in users employer is not found', () =>
          new Promise((resolve, reject) =>
            this.userSession
              .put(`/api/employers/${this.employers[1]._id}`)
              .send(this.employers[1].toJSON())
              .expect(403)
              .end((err) => err ? reject(err) : resolve())));

        it('DELETE /api/employers/:id in users employer is allowed', () =>
          new Promise((resolve, reject) =>
            this.userSession
              .delete(`/api/employers/${this.employers[0]._id}`)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err) => err ? reject(err) : resolve())));
  });

  describe('admin user', function () {
    beforeEach(() =>
      setupDB()
        .then(([employers, users, advertisements]) =>
          helper.loginUser(users[3], session(helper.app), employers, users, advertisements))
        .then((vars) => [this.userSession, [this.employers, this.users, this.advertisements]] = vars));

    afterEach(() => {
      this.userSession = null, this.employers = null, this.users = null, this.advertisements = null;
    });

    it('GET /api/employer should respond with JSON array containing employers which are editable', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .get('/api/employers')
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, {body}) => {
            const ids = _.sortBy(this.employers, ['name']).map((emp) => emp.name).join('-');
            body.should.be.instanceof(Array).and.have.lengthOf(3);
            _.map(body, (d) => d.name).join('-').should.equal(ids);
            err ? reject(err) : resolve();
          })));

    it('POST /api/employers is allowed to create', () =>
      buildFactory('employer', {})
        .call('toJSON')
        .then(_)
        .call('omit', '_id')
        .call('value')
        .then((employerParams) =>
          new Promise((resolve, reject) => {
            this.userSession
              .post('/api/employers')
              .send(employerParams)
              .expect(201)
              .expect('Content-Type', /json/)
              .end((err) => err ? reject(err) : resolve())})));

    it('PUT /api/employers/:id is allowed', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .put(`/api/employers/${this.employers[1]._id}`)
          .send(this.employers[1].toJSON())
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err) => err ? reject(err) : resolve())));

    it('PUT /api/employers/1234 is not found', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .put(`/api/employers/${this.advertisements[1]._id}`)
          .send(this.employers[1].toJSON())
          .expect(404)
          .expect('Content-Type', /json/)
          .end((err) => err ? reject(err) : resolve())));

    it('DELETE /api/employers/:id is allowed', () =>
      new Promise((resolve, reject) =>
        this.userSession
          .delete(`/api/employers/${this.employers[2]._id}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err) => err ? reject(err) : resolve())));
  });
});
