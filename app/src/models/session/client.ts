import { default as Redis } from 'ioredis';
const redis: Redis = new Redis({
  host: process.env.DATABASE_HOST,
  port: 6379,
});

export default redis;
