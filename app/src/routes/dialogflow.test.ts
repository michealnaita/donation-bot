// TODO: test that session.save is called with new user state
import request from 'supertest';
import { redisMock } from '../models/session/singleton';
import dialogflowRouter, { reqBodyType } from './dialogflow';
import express, { Express } from 'express';
import { sessionType } from '../models/session';

const app: Express = express();
app.use('/dialogflow', dialogflowRouter);

describe.only('/api/dialogflow', () => {
  const userState: sessionType = {
    firstname: 'user 1',
    image: 'image://',
    location: [2, 1],
    item: 'item',
  };
  const sessionId = '1234567890';
  beforeEach(() => {
    redisMock.exists.mockResolvedValue(1);
    redisMock.set.mockResolvedValue('OK');
    redisMock.get.mockResolvedValue(JSON.stringify(userState));
  });

  it('should load user session', async () => {
    const reqBody: reqBodyType = {
      queryResult: {
        parameters: {
          item: 'my item',
        },
      },
      session: `/session/path/${sessionId}`,
    };
    const res = await request(app)
      .post('/dialogflow')
      .send(reqBody)
      .expect(400);
    expect(res.text).toMatch(/use default response/);
    expect(redisMock.get).toBeCalledWith(sessionId);
  });
  it('should update user session', async () => {
    const reqBody: reqBodyType = {
      queryResult: {
        parameters: {
          person: 'user 2',
        },
      },
      session: `/session/path/${sessionId}`,
    };
    const res = await request(app)
      .post('/dialogflow')
      .send(reqBody)
      .expect(400);
    // TODO: test that session.save is called with new user state
    expect(res.text).toMatch(/use default response/);
    expect(redisMock.set).toHaveBeenCalled();
  });
});
