import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';

// create Redis instance
export const redis = new Redis(process.env.REDIS_URL);

// configure Redis connection options
const options: Redis.RedisOptions = {
  path: process.env.REDIS_URL,
  keepAlive: 1000,
  retryStrategy: times => Math.max(times * 100, 3000)
};

// create Redis-based pub-sub
export const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});
