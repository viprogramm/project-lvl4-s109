import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '../src';

describe('requests', () => {
  const server = app().listen();

  beforeAll(() => {
    jasmine.addMatchers(matchers);
  });

  it('GET /', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /users', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  const user = {
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: faker.internet.password(),
  };

  it('should create user and redirect to /', async () => {
    const res = await request.agent(server)
      .post('/users')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
    expect(res.header.location).toBe('/');
  });

  it('user page should contain created user', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res.text).toMatch(user.email);
    expect(res.text).toMatch(user.firstName);
    expect(res.text).toMatch(user.lastName);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
