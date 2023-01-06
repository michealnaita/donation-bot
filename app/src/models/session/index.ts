import redis from './client';
export type sessionType = {
  item: string;
  firstname: string;
  image: string;
  location: [number, number];
};
export interface ISession {
  load: (sessionId: string) => Promise<null | sessionType>;
  save: (
    sessionId: string,
    state: sessionType
  ) => Promise<{ success: boolean; err_message: string }>;
}

const Session: ISession = {
  async load(sessionId: string) {
    try {
      const exists: number = await redis.exists(sessionId);
      if (exists === 1) {
        const jsonState = await redis.get(sessionId);
        const state: sessionType = JSON.parse(jsonState);
        return state;
      }
      await redis.quit();
      return null;
    } catch (error) {
      await redis.quit();
      console.log('error in session Model', error);
      return null;
    }
  },
  async save(sessionId: string, state: sessionType) {
    try {
      const stateString = JSON.stringify(state);
      const res = await redis.set(sessionId, stateString);
      if (res === 'OK') {
        return { success: true, err_message: '' };
      }
      await redis.quit();
      return { success: false, err_message: 'Could not save user session' };
    } catch (e) {
      await redis.quit();
      return { success: false, err_message: e.message };
    }
  },
};
export default Session;
