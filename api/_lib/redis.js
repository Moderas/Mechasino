import { Redis } from '@upstash/redis';

const STATE_KEY = 'mechasino-state';

let redis;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function getState() {
  const state = await getRedis().get(STATE_KEY);
  if (!state) {
    return { players: [], round: null };
  }
  return state;
}

export async function setState(state) {
  await getRedis().set(STATE_KEY, state);
}
