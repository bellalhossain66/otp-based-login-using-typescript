import { Queue } from 'bullmq';
import redisConn from '../config/redis.config';
import queueConst from '../config/queue.const';

export class QataratQueue {
    private jobQueue: Queue;

    constructor() {
        this.jobQueue = new Queue(queueConst.queue_name.deeplink, {
            connection: redisConn,
        });
    }

    public async TrackDeeplinkActivityForNewUser(user_id: number, ip: string, device_id: string, platform: string): Promise<void> {
        await this.jobQueue.add('TrackDeeplinkActivityForNewUser', {
            user_id,
            ip,
            device_id,
            platform
        });
    }

    public async TrackDeeplinkActivity(payload: {
        user_id: number;
        action_type: string;
        referral_id: string;
        ip: string;
        platform: string;
        device_id: string;
    }, checkDownload = true): Promise<void> {
        await this.jobQueue.add("track-deeplink-activity", {
            requested_data: payload,
            check_download: checkDownload,
        });
    };

    public async GuestUserDeviceTokenConvertToRealUser(guestUserId: number, loggedUserId: number): Promise<void> {
        await this.jobQueue.add("GuestUserDeviceTokenConvertToRealUser", {
            guestUserId,
            loggedUserId
        });
    };

    public async ChangeActivityToGuestToLoggedUser(guestUserId: number, loggedUserId: number): Promise<void> {
        await this.jobQueue.add("ChangeActivityToGuestToLoggedUser", {
            guestUserId,
            loggedUserId
        });
    };
}

export const createQataratQueue = (): QataratQueue => {
    return new QataratQueue();
}