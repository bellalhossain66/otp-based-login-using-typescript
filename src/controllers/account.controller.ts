import { Request, Response } from 'express';
import appConst from '../config/app.const';
import AccountRepo from '../repositories/account.repository';
import { SendOtpUsingWhatsappTemplate } from './sendotp.controller';
import { Normalizephone } from '../utils/common';
import sequelizeDB from '../config/db.config';
import { SendPaymentCompleteNotify } from './paymentnotify.controller';
import { GenerateAccessToken, GenerateRefreshToken } from '../middleware/jwt.auth';
import CacheForever from '../utils/cacheforever';
import MobileCountiresResource from '../resources/clientmobilecountries.resource';
import { GetPlatformFromUserAgent } from '../utils/device';
import { v4 as uuidv4 } from 'uuid';
import { createQataratQueue } from '../queue/queue';



export const SendWhatsAppOtp = async (req: Request, res: Response): Promise<void> => {
    const phoneNumber = req.body.phoneNumber;
    if (!phoneNumber) {
        res.status(422).json({ message: 'phoneNumber is required' });
        return;
    }

    let t: any;
    try {
        t = await sequelizeDB.transaction();
        let user = await AccountRepo.FindUserByPhone(phoneNumber, t);

        if (user) {
            await AccountRepo.UpdateUser(phoneNumber, t);
        } else {
            user = await AccountRepo.CreateUser(phoneNumber, t);
        }

        let result: { success?: boolean; otp?: number | null } = {};

        if (user.phone_number === appConst.super_user.super_user_phone) {
            result = {
                success: true,
                otp: Number(appConst.super_user.super_user_otp),
            };
        } else {
            const targetPhone = user.secondary_otp_receiver_number
                ? Normalizephone(user.secondary_otp_receiver_number)
                : Normalizephone(phoneNumber);
            result = await SendOtpUsingWhatsappTemplate(targetPhone);
        }

        const otp =
            result.success && result.otp
                ? result.otp
                : Math.floor(1000 + Math.random() * 9000);
        await AccountRepo.UpdateOtp(user.id, otp, t);

        await t.commit();
        res.status(204).send();
    } catch (error) {
        if (t) await t.rollback();
        console.error(error);
        res.status(500).json({
            message: 'something went wrong from our site',
            error: 'something went wrong from our site',
        });
        return;
    }
};

export const LogInUser = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, token, deviceId, ip } = req.body;

    if (!phoneNumber) {
        res.status(400).json({ phoneNumber: 'phoneNumber required' });
        return;
    }
    if (!token) {
        res.status(400).json({ token: 'token required' });
        return;
    }

    let t: any;
    try {
        t = await sequelizeDB.transaction();

        const user = await AccountRepo.FindUserByPhone(phoneNumber, t);
        if (!user) {
            await t.rollback();
            res.status(404).json({ message: res.__('Auth.user_not_found') });
            return;
        }

        if (user.otp_code !== token) {
            await t.rollback();
            res.status(404).json({ message: res.__('Auth.invalid_verification_code') });
            return;
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        user.otp_code = null;
        user.email_verified_at = now;
        user.phone_number_confirmed = 1;
        user.username = user.username || phoneNumber;
        user.normalized_username = user.normalized_username || phoneNumber;
        user.device_id = user.device_id || deviceId;
        user.ip_address = user.ip_address || ip;

        await AccountRepo.UpdateUserAfterVerification(user, now, t);
        await t.commit();

        const guestUser = await AccountRepo.GetUserRole(user.id);
        if (!guestUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        let role = guestUser?.name ?? 'guest';
        if (role === 'guest') {
            const guestOrders = await AccountRepo.FindGuestClientOrder(guestUser.id);

            if (guestOrders.length > 0) {
                const orderIds = guestOrders.map(o => o.id);
                await AccountRepo.UpdateGuestClientOrder(guestUser.id, orderIds);

                const newOrders = await AccountRepo.FindGuestNewOrders(guestUser.id, orderIds);

                for (const order of newOrders) {
                    await SendPaymentCompleteNotify(order);
                }
            }

            const guestActivities = await AccountRepo.FindGuestDeeplinkActivity(guestUser.id);
            for (const activity of guestActivities) {
                activity.user_id = guestUser.id;
                await activity.save();
            }

            const queue = createQataratQueue();
            queue.GuestUserDeviceTokenConvertToRealUser(guestUser.id, user.id);
            queue.ChangeActivityToGuestToLoggedUser(guestUser.id, user.id);
        }
        await AccountRepo.SetUserRoleToUser(user.id);
        role = 'user';

        const accessToken = GenerateAccessToken(user.id, user.name, phoneNumber, role);
        const refreshToken = GenerateRefreshToken(user.id, user.name, phoneNumber, role);

        res.status(200).json({
            id: user.id,
            userName: user.username,
            role,
            accessToken,
            refreshToken,
            popupShowingDate: user.popup_showing_date,
            can_podcast: user.can_podcast,
            clientOrders: [],
        });
        return;
    } catch (err: any) {
        if (t) await t.rollback();
        console.error(err);
        res.status(500).json({
            message: 'Something went wrong',
            error: err.message,
        });
        return;
    }
}

export const Access = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        res.status(400).json({ phoneNumber: 'phoneNumber required' });
        return;
    }

    let t: any;
    try {
        t = await sequelizeDB.transaction();

        let user = await AccountRepo.FindUserByPhone(phoneNumber, t);

        if (user) {
            await AccountRepo.UpdateExistingUser(user.id, t);
        } else {
            user = await AccountRepo.CreateNewUser(phoneNumber, t);
            await AccountRepo.SyncUserRoleTransaction(user.id, 'user', t);
        }

        const maxSmsLimit = appConst.sms.max_sms_limit;
        const timeWindow = appConst.sms.sms_hour_window;

        const recentSmsCount = await AccountRepo.CountRecentSmsRequests(user.id, timeWindow);
        if (recentSmsCount >= maxSmsLimit) {
            res.status(429).json({ message: res.__('Auth.sms_limit_reached', { time: `${timeWindow}` }) });
            return;
        }

        let result: { success: boolean; otp?: number };
        if (user.phone_number === appConst.super_user.super_user_phone) {
            result = {
                success: true,
                otp: Number(appConst.super_user.super_user_otp),
            };
        } else {
            const normalizedPhone = Normalizephone(user.secondary_otp_receiver_number || phoneNumber);
            const otp = Math.floor(1000 + Math.random() * 9000);
            result = { success: true, otp };
            await SendOtpUsingWhatsappTemplate(normalizedPhone, otp);
        }

        if (result.success && result.otp) {
            await AccountRepo.StoreOtpForUser(user.id, result.otp, phoneNumber, t);
            await t.commit();
            res.status(200).json({ message: res.__('Auth.verification_code_sent') });
            return;
        } else {
            await t.rollback();
            res.status(400).json({ message: res.__('Auth.something_went_wrong') });
            return;
        }
    } catch (error: any) {
        if (t) await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
        return;
    }
}

export const GetMobileCountriesInfo = async (req: Request, res: Response): Promise<void> => {
    const countries = await CacheForever(`Country`, async () => {
        return await AccountRepo.GetMobileCountriesInfo();
    });

    res.json({
        countries: MobileCountiresResource.collection(countries),
    });
    return;
}

export const AccessGuestUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const uniqueName = uuidv4();

        const user = await AccountRepo.CreateGuestUser({
            username: uniqueName,
            normalized_username: uniqueName,
            phone_number_confirmed: 0,
            security_stamp: uuidv4(),
            con_currency_stamp: uuidv4(),
            phone_number: uuidv4(),
            two_factor_enabled: 1,
            look_out_enabled: 1,
            access_failed_count: 0,
            popup_showing_date: new Date(),
        });

        await AccountRepo.SyncUserRole(user, 'guest');

        const access_token = GenerateAccessToken(user, '', uniqueName, 'guest');
        const refresh_token = GenerateRefreshToken(user, '', uniqueName, 'guest');

        const platform = req.body.platform || GetPlatformFromUserAgent(req.headers['user-agent']);
        const ip = req.body.ip || req.ip;
        const device_id = req.body.device_id;

        // console.log('guest-access: ',user, ip, device_id, platform);

        const queue = createQataratQueue();
        if (!req.body.referral_id) {
            queue.TrackDeeplinkActivityForNewUser(user, ip, device_id, platform);
        } else {
            queue.TrackDeeplinkActivity({
                user_id: user,
                action_type: 'new_user',
                referral_id: req.body.referral_id,
                ip,
                platform,
                device_id,
            });
        }

        res.json({
            id: user,
            userName: uniqueName,
            role: 'Guest',
            accessToken: access_token,
            refreshToken: refresh_token,
            popupShowingDate: new Date(),
            clientOrders: null
        });
        return;
    } catch (error: any) {
        console.error("storeGuestUser error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
        return;
    }
}

export const AddUserDeviceToken = async (req: Request, res: Response): Promise<void> => {
    const userId: any = req.loggedUserId;

    const { deviceType, registrationToken, device_id } = req.body;

    if (!deviceType) {
        res.status(400).json({ deviceType: 'Invalid device type' });
        return;
    }

    if (!registrationToken) {
        res.status(400).json({ registrationToken: 'Invalid registration token' });
        return;
    }

    let t: any;
    try {
        t = await sequelizeDB.transaction();

        const latestDeviceToken = await AccountRepo.GetLatestUserDeviceToken(userId);

        if (latestDeviceToken) {
            await AccountRepo.UpdateUserDeviceToken({
                user_id: userId,
                device_type: deviceType,
                registration_token: registrationToken,
                device_id: device_id || '',
            }, latestDeviceToken.id, t);
        } else {
            await AccountRepo.CreateUserDeviceToken({
                user_id: userId,
                device_type: deviceType,
                registration_token: registrationToken,
                device_id: device_id || '',
                user_type: 1,
            }, t);
        }

        await t.commit();
        res.status(200).json({ message: 'Updated successfully' });
        return;
    } catch (error: any) {
        if (t) await t.rollback();
        console.error('AddUserDeviceToken error:', error);
        res.status(400).json({
            message: 'Something went wrong',
            error: error.message,
        });
        return;
    }
}