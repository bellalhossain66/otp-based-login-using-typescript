import { Worker, Queue, Job } from 'bullmq';
import queueConst from '../config/queue.const';
import { ChangeActivityToGuestToLoggedUser, GuestUserDeviceTokenConvertToRealUser, TrackDeeplinkActivity, TrackDeeplinkActivityForNewUser } from '../controllers/worker.controller';
import redisConn from '../config/redis.config';
import sequelizeDB from '../config/db.config';

const jobQueue = new Queue(queueConst.queue_name.deeplink, { connection: redisConn } as any);

const connectDB = async () => {
    try {
        await sequelizeDB.authenticate();
        console.log('DB connected.');
    } catch (err) {
        console.error('❌ DB not connected:', err);
    }
};

const connectRedis = () => {
    redisConn.on('connect', () => console.log('Redis connected.'));
    redisConn.on('error', (err) => console.error('❌ Redis error:', err));
};

export const processJob = async (job: Job): Promise<void> => {
    try {
        switch (job.name) {
            case 'track-deeplink-activity':
                await TrackDeeplinkActivity(job);
                break;

            case 'TrackDeeplinkActivityForNewUser':
                await TrackDeeplinkActivityForNewUser(job);
                break;

            case 'GuestUserDeviceTokenConvertToRealUser':
                await GuestUserDeviceTokenConvertToRealUser(job);
                break;

            case 'ChangeActivityToGuestToLoggedUser':
                await ChangeActivityToGuestToLoggedUser(job);
                break;

            default:
                console.log('Unknown Job:', job.name);
        }
        console.log('Job completed:', job.id);
    } catch (error) {
        console.error('Job error:', error);
    }
};

export const startWorker = (): Worker => {
    connectDB();
    connectRedis();

    const worker = new Worker(
        queueConst.queue_name.deeplink,
        async (job) => await processJob(job),
        {
            connection: redisConn,
            concurrency: queueConst.worker.max_concurrency,
        }
    );

    worker.on('failed', async (job: any, err: Error):Promise<void> => {
        console.error(`Job failed: ${job.id}`, err);
        await jobQueue.clean(0, 100, 'failed');

    });

    worker.on('completed', async (job) => {
        await jobQueue.clean(0, 100, 'completed');
    });

    return worker;
};