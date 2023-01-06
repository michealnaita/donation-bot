import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { default as Redis } from 'ioredis';
import redis from './client';

jest.mock('./client', () => ({
  default: mockDeep<Redis>(),
  __esModule: true,
}));
beforeEach(() => {
  mockReset(redisMock);
});

export const redisMock = redis as unknown as DeepMockProxy<Redis>;
