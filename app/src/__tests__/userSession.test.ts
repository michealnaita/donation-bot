import { sessionType } from './../models/session/index';
import User from '../models/user';
import redis from '../models/session/client';

const sId = '1234567890';
const sId2 = '0987654321';
describe('User Session', () => {
  afterAll(async () => {
    await redis.flushall();
  });
  it('Should successfully store user session in databse', async () => {
    const user = new User(sId);
    user.firstname = 'test 1';
    user.location = [1, 2];
    await user.save();
    const res = await redis.get(sId);
    const { sessionId, ...userAlias } = user;
    expect(res).toEqual(JSON.stringify(userAlias));
  });
  it('should successfully load user session from database', async () => {
    const userState: sessionType = {
      firstname: 'user 1',
      image: null,
      item: 'item',
      location: [1, 2],
    };
    await redis.set(sId2, JSON.stringify(userState));
    const user = new User(sId2);
    await user.loadSession();
    const { sessionId, ...userAlias } = user;
    expect(userAlias).toEqual(userState);
  });
});
