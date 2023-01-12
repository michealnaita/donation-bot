import { sessionType } from './../models/session/index';
import User from '../models/user';
import redis from '../models/session/client';

const sId = '1234567890';
const sId2 = '0987654321';
xdescribe('User Session', () => {
  afterAll(async () => {
    await redis.flushall();
  });

  it('Should successfully store user session in databse', async () => {
    const user1 = new User(sId);
    await user1.loadSession();
    user1.firstname = 'test 1';
    user1.location = [1, 2];
    await user1.save();

    const user2 = new User(sId);
    await user2.loadSession();
    const res = await redis.get(sId);
    const { sessionId, ...userDetails } = user2;
    console.log(userDetails);
    expect(userDetails).toEqual(JSON.parse(res));
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
    const { sessionId, ...userDetails } = user;
    expect(userDetails).toEqual(userState);
  });
});
