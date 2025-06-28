import moment from 'moment';
import { Job } from 'bullmq';
import sequelizeDB from '../config/db.config';
import DeepLinkRepo from '../repositories/depplink.repository';
import DeviceTokenRepo from '../repositories/userdevicetoken.repository';
import SubscriptionRepo from '../repositories/subscription.repository';

interface TrackActivityJob {
    requested_data: {
        action_type?: string;
        user_id?: number;
        referral_id?: string;
        device_id?: string;
        ip?: string;
        platform?: string;
    };
    check_download?: boolean;
}

interface TrackNewUserJob {
    user_id: number;
    ip: string;
    device_id?: string;
    platform: string;
}

interface GuestToRealUserJob {
    guestUserId: number;
    loggedUserId: number;
}

export const TrackDeeplinkActivity = async (job: Job<TrackActivityJob>): Promise<void> => {
    const { requested_data: data, check_download } = job.data;

    const action_type = (data.action_type || 'click').toUpperCase();
    const user_id = data.user_id ?? null;
    const referral_id = data.referral_id ?? null;
    const device_id = data.device_id ?? null;
    const ip = data.ip ?? null;
    const platform = data.platform || 'web';

    const deepLink = await DeepLinkRepo.GetGenerateDeepLink(referral_id ?? '');
    if (!deepLink) return;

    const campaign = await DeepLinkRepo.GetGenerateCampaign(deepLink);
    if (!campaign) return;

    const endDate = moment(campaign.end_date_time);
    const isExpired = endDate.isBefore(moment());

    await DeepLinkRepo.CreateDeepLinkActivity(user_id, campaign, deepLink, referral_id ?? '', action_type, device_id, ip, platform, isExpired);

    if (
        check_download &&
        platform !== 'web' &&
        action_type === 'NEW_USER'
    ) {
        const exists = await DeepLinkRepo.ExistDeepLinkActivity(device_id);
        if (!exists) {
            const actions = ['DOWNLOAD', 'OPEN'];
            for (const action of actions) {
                await DeepLinkRepo.CreateDeepLinkActivityForActions(
                    user_id,
                    campaign,
                    deepLink,
                    referral_id ?? '',
                    action,
                    device_id,
                    ip,
                    platform,
                    isExpired
                );
            }
        }
    }
};

export const TrackDeeplinkActivityForNewUser = async (job: Job<TrackNewUserJob>): Promise<void> => {
    const { user_id, ip, device_id, platform } = job.data;

    const recentClickActivity = await DeepLinkRepo.FindRecentClickByIP(ip);
    if (!recentClickActivity) return;

    const existingDownload = await DeepLinkRepo.FindDownloadByIP(ip);
    const clickTime = new Date(recentClickActivity.created_at);
    const diffMinutes = (Date.now() - clickTime.getTime()) / 60000;

    let shouldCreate = false;

    if (!existingDownload) {
        shouldCreate = diffMinutes <= 60;
    } else if (device_id && existingDownload.device_id !== device_id) {
        shouldCreate = diffMinutes <= 60;
    }

    if (shouldCreate) {
        await DeepLinkRepo.WithTransaction(async (t) => {
            await DeepLinkRepo.InsertActivities(['DOWNLOAD', 'OPEN', 'CLICK'], user_id, recentClickActivity, device_id ?? '', ip, platform, t);
            await DeepLinkRepo.DeleteAnonymousClicks(ip, t);
        });
    }
};

export const GuestUserDeviceTokenConvertToRealUser = async (job: Job<GuestToRealUserJob>): Promise<void> => {
    const { guestUserId, loggedUserId } = job.data;

    try {
        const guestUser = await DeviceTokenRepo.FindUserByguestUserId(guestUserId);
        const realUser = await DeviceTokenRepo.FindUserByloggedUserId(loggedUserId);
        if (!guestUser || !realUser) return;

        const t = await sequelizeDB.transaction();
        try {
            const guestDeviceToken = await DeviceTokenRepo.FindUserDeviceTokenByGuestId(guestUser, t);
            if (guestDeviceToken) {
                await DeviceTokenRepo.DestroyUserDeviceToken(realUser, t);
                await DeviceTokenRepo.CreateUserDeviceToken(realUser, guestDeviceToken, t);
                await DeviceTokenRepo.DestroyUserDeviceToken(guestUser, t);
            }

            await t.commit();
        } catch (err) {
            await t.rollback();
            console.error('Transaction failed:', err);
        }
    } catch (err: any) {
        console.error('GuestUserDeviceTokenConvertToRealUser Error', {
            guestUserId,
            loggedUserId,
            error: err.message,
        });
    }
};

export const ChangeActivityToGuestToLoggedUser = async (job: Job<GuestToRealUserJob>): Promise<void> => {
    const { guestUserId, loggedUserId } = job.data;

    try {
        const loggedUserSubscription = await SubscriptionRepo.FindSubscription(loggedUserId);
        const guestUserSubscription = await SubscriptionRepo.FindSubscription(guestUserId);

        if (guestUserSubscription) {
            if (!loggedUserSubscription) {
                await guestUserSubscription.update({ client_id: loggedUserId });
            } else {
                await guestUserSubscription.destroy();
            }
        }
    } catch (error: any) {
        console.error('Failed to transfer subscription from guest to logged user', {
            guestUserId,
            loggedUserId,
            error: error.message,
        });
    }
};