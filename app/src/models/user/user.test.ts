import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import Session, { ISession, sessionType } from '../session/index';
import User from './index';

jest.mock('../session/index', () => ({
  default: mock<ISession>(),
  __esModule: true,
}));

const sessionMock = Session as unknown as MockProxy<typeof Session>;
const sId = '1234567890';
const userState: sessionType = {
  item: 'item',
  firstname: 'test',
  image: 'image://..',
  location: [1, 1],
};

describe('User Model', () => {
  describe('Unit Tests', () => {
    beforeEach(() => {
      mockReset(sessionMock);
    });
    it('should have undefined for user properties when user session is not active', async () => {
      sessionMock.load.mockResolvedValue(null);
      const newUser = new User(sId);
      await newUser.loadSession();
      expect(newUser.sessionId).toEqual(sId);
      expect(newUser.firstname).toBeNull();
    });
    it('should have values for user properties when user session is active', async () => {
      const sessionId = '1234567890';
      sessionMock.load.mockResolvedValue(userState);
      const newUser = new User(sessionId);
      await newUser.loadSession();
      expect(newUser.sessionId).toEqual(sessionId);
      expect(newUser.firstname).toEqual(userState.firstname);
    });
    it('Should save user state in session', async () => {
      sessionMock.save.mockResolvedValue({ success: true, err_message: '' });
      const user = new User(sId);
      user.firstname = userState.firstname;
      user.item = userState.item;
      user.image = userState.image;
      user.location = userState.location;
      const res: { success: boolean; err_message: string } = await user.save();
      expect(res.success).toBe(true);
      expect(sessionMock.save).toHaveBeenCalledWith(sId, userState);
    });
    it('Should identify missing props from the User Object', () => {
      const user1 = new User('one:' + sId);
      const user2 = new User('two:' + sId);

      user1.firstname = 'user1';
      user1.item = 'item';

      user2.firstname = 'user2';
      user2.location = [2, 2];

      expect(user1.missing()).toEqual(
        expect.arrayContaining(['image', 'location'])
      );
      expect(user2.missing()).toEqual(
        expect.arrayContaining(['image', 'item'])
      );
    });
    it('should load user sesion', async () => {
      sessionMock.load.calledWith(sId).mockResolvedValue(userState);
      const user = new User(sId);
      await user.loadSession();
      const { sessionId, ...userAlias } = user;
      expect(userAlias).toEqual(userState);
    });
  });
});
