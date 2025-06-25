import Redis from 'ioredis';
import appConst from './app.const';

const redisConn = new Redis({
    host: appConst.redis.host,
    port: appConst.redis.port,
    password: appConst.redis.password,
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
});

export default redisConn;