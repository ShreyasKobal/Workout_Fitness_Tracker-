import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'workout-tracker:workouts';

export async function GET() {
  try {
    const data = await redis.get(KEY);
    return Response.json({ workouts: data || null });
  } catch (e) {
    return Response.json({ error: 'Could not reach the database. Check your Upstash environment variables.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.workouts)) {
      return Response.json({ error: 'Invalid payload: "workouts" must be an array.' }, { status: 400 });
    }
    await redis.set(KEY, body.workouts);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'Could not save to the database. Check your Upstash environment variables.' }, { status: 500 });
  }
}
