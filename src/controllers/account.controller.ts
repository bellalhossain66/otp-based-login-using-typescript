import { Request, Response } from 'express';
import appConst from '../config/app.const';
import AccountRepo from '../repositories/account.repository';
import { SendOtpUsingWhatsappTemplate } from './sendotp.controller';
import { Normalizephone } from '../utils/common';
import sequelizeDB from '../config/db.config';
import { SendPaymentCompleteNotify } from './paymentnotify.controller';
import { GenerateAccessToken, GenerateRefreshToken } from '../middleware/jwt.auth';

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

            // GuestUserDeviceTokenConvertToRealUser(guestUser.id, user.id);
            // ChangeActivityToGuestToLoggedUser(guestUser.id, user.id);
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
