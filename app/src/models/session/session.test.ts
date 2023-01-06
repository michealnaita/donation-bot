import { redisMock } from './singleton';
import Session, { sessionType } from './index';

const state: sessionType = {
  item: 'books',
  firstname: 'test',
  image: 'image://..',
  location: [1, 1],
};
const sessionId: string = '1234567890';
describe('Session Model', () => {
  it('should return null if user session is not active', async () => {
    redisMock.exists.mockResolvedValue(0);
    const loadedState = await Session.load(sessionId);
    expect(loadedState).toBeNull();
    expect(redisMock.exists).toHaveBeenCalled();
  });
  it('should return user session if active', async () => {
    redisMock.exists.mockResolvedValue(1);
    redisMock.get.mockResolvedValue(JSON.stringify(state));
    const loadedState = await Session.load(sessionId);
    expect(loadedState).toStrictEqual(state);
  });

  it('Should save user session', async () => {
    redisMock.set.mockResolvedValue('OK');
    const res: { success: boolean; err_message: string } = await Session.save(
      sessionId,
      state
    );
    expect(res.success).toBe(true);
    expect(redisMock.set).toHaveBeenCalledWith(
      sessionId,
      JSON.stringify(state)
    );
  });
});
