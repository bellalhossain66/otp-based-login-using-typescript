import redis from '../config/redis.config';

const CacheForever = async <T>(key: string, fetchFunc: () => Promise<T>) => {
    const cached = await redis.get(key);

    if (cached) {
        try {
            // return typeof cached === 'string' ? JSON.parse(cached) : cached;
            return JSON.parse(cached) as T;
        } catch (err: any) {
            console.error(`Failed to parse Redis cache for key "${key}":`, err.message);
            await redis.del(key);
        }
    }

    const data = await fetchFunc();
    await redis.set(key, JSON.stringify(data));

    return data;
};

export default CacheForever;