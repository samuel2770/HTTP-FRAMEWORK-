const request = require('supertest');
const app = require('../app');
const { initSocket } = require('../config/socket');
const http = require('http');

let server;

beforeAll((done) => {
  server = http.createServer(app);
  initSocket(server);
  server.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('FlashCollab API', () => {
  it('should return health check message from root', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('FlashCollab Backend is running!');
  });

  it('should return 401 if unauthorized for requests', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.statusCode).toEqual(401);
  });

  it('should return profile for authorized user', async () => {
    // Our middleware has a fallback for dev
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer dummy-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.displayName).toBeDefined();
  });

  it('should return leaderboard', async () => {
    const res = await request(app)
      .get('/api/users/leaderboard')
      .set('Authorization', 'Bearer dummy-token');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
