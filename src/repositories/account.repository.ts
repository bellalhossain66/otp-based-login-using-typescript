import { Op, QueryTypes, Transaction } from 'sequelize';
import appConst from '../config/app.const';
import sequelizeDB from '../config/db.config';
import User from '../interfaces/user.interface';
import Role from '../interfaces/role.interface';
import ClientOrder, { ClientOrderType } from "../models/clientorder.model";
import DeeplinkActivity, { DeeplinkActivityType } from '../models/deeplinkactivity.model';
import Country, { CountryType } from '../models/country.model';
import GuestUserInput from '../interfaces/guestuser.interface';
import DeviceTokenData from '../interfaces/devicetokendata.interface';

class AccountRepository {
    public FindUserByPhone = async (phoneNumber: string, transaction?: Transaction): Promise<User | null> => {
        const [user] = await sequelizeDB.query<User>(
            `SELECT * FROM ${appConst.table.users} WHERE phone_number = ? LIMIT 1`,
            {
                replacements: [phoneNumber],
                type: QueryTypes.SELECT,
                transaction,
            }
        );
        return user || null;
    };

    public UpdateUser = async (phoneNumber: string, transaction?: Transaction): Promise<void> => {
        await sequelizeDB.query(
            `UPDATE ${appConst.table.users}
     SET phone_number = :phone_number,
         email_verified_at = NULL,
         phone_number_confirmed = 0,
         first_login = 0,
         updated_at = NOW()
     WHERE phone_number = :phone_number`,
            {
                replacements: { phone_number: phoneNumber },
                transaction,
            }
        );
    };

    public CreateUser = async (phoneNumber: string, transaction?: Transaction): Promise<User> => {
        await sequelizeDB.query(
            `INSERT INTO ${appConst.table.users}
     (phone_number, email_verified_at, phone_number_confirmed, first_login, created_at, updated_at)
     VALUES (:phone_number, NULL, 0, 0, NOW(), NOW())`,
            {
                replacements: { phone_number: phoneNumber },
                transaction,
            }
        );

        const newUser = await this.FindUserByPhone(phoneNumber, transaction);
        return newUser!;
    };

    public UpdateOtp = async (userId: number, otp: number, transaction?: Transaction): Promise<void> => {
        await sequelizeDB.query(
            `UPDATE ${appConst.table.users} SET otp_code = :otp WHERE id = :user_id`,
            {
                replacements: { otp, user_id: userId },
                transaction,
            }
        );
    };

    public UpdateUserAfterVerification = async (user: User, now: string, transaction?: Transaction): Promise<void> => {
        try {
            await sequelizeDB.query(
                `UPDATE ` + appConst.table.users + ` SET otp_code = NULL, email_verified_at = ?, phone_number_confirmed = 1,
              username = ?, normalized_username = ?, device_id = ?, ip_address = ? WHERE id = ?`,
                {
                    replacements: [
                        now,
                        user.username,
                        user.normalized_username,
                        user.device_id || null,
                        user.ip_address || null,
                        user.id,
                    ],
                    type: QueryTypes.UPDATE,
                    transaction,
                }
            );
        } catch (error) {
            console.log(error);
        }
    };

    public GetUserRole = async (userId: number): Promise<Role | null> => {
        try {
            const roles = await sequelizeDB.query<Role>(
                `SELECT r.name, r.id
                FROM ${appConst.table.roles} r
                JOIN ${appConst.table.model_has_roles} mhr ON r.id = mhr.role_id
                WHERE mhr.model_id = ?`,
                {
                    replacements: [userId],
                    type: QueryTypes.SELECT,
                }
            );
            return roles.length > 0 ? roles[0] : null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public FindGuestClientOrder = async (userId: number): Promise<ClientOrderType[]> => {
        return await ClientOrder.findAll({
            where: {
                client_id: userId,
                client_order_status: { [Op.ne]: 'new' }
            }
        });
    }

    public UpdateGuestClientOrder = async (userId: number, orderIds: number[] | number): Promise<void> => {
        await ClientOrder.update({ client_id: userId }, { where: { id: orderIds } });
    }

    public FindGuestNewOrders = async (userId: number, orderIds: number[] | number): Promise<ClientOrderType[]> => {
        return await ClientOrder.findAll({
            where: {
                id: orderIds,
                client_id: userId,
                client_order_status: { [Op.in]: ['payment_received', 'completed'] }
            }
        });
    }

    public FindGuestDeeplinkActivity = async (userId: number): Promise<DeeplinkActivityType[]> => {
        return await DeeplinkActivity.findAll({ where: { user_id: userId } });
    }

    public SetUserRoleToUser = async (userId: number): Promise<void> => {
        try {
            await sequelizeDB.query('DELETE FROM ' + appConst.table.model_has_roles + ' WHERE model_id = ?', {
                replacements: [userId],
                type: QueryTypes.DELETE,
            });

            await sequelizeDB.query(
                'INSERT INTO ' + appConst.table.model_has_roles + ' (role_id, model_id, model_type) VALUES (?, ?, ?)',
                {
                    replacements: [2, userId, 'App\\Models\\User'],
                    type: QueryTypes.INSERT,
                }
            );
        } catch (err) {
            console.log(err);
        }
    }

    public UpdateExistingUser = async (userId: number, t: Transaction): Promise<void> => {
        await sequelizeDB.query(
            `UPDATE ${appConst.table.users} SET email_verified_at = NULL, phone_number_confirmed = 0, first_login = 0 WHERE id = ?`,
            { replacements: [userId], transaction: t }
        );
    };

    public CreateNewUser = async (phoneNumber: string, t: Transaction): Promise<User> => {
        const [results]: any = await sequelizeDB.query(
            `INSERT INTO ${appConst.table.users} (phone_number, email_verified_at, phone_number_confirmed, first_login)
         VALUES (?, NULL, 0, 0)`,
            { replacements: [phoneNumber], type: QueryTypes.INSERT, transaction: t }
        );

        return results?.[0];
    };

    public SyncUserRoleTransaction = async (userId: number, roleName: string, t: Transaction): Promise<void> => {
        await sequelizeDB.query(
            `INSERT INTO ${appConst.table.model_has_roles} (role_id, model_type, model_id)
         SELECT id, 'App\\\\Models\\\\User', ? FROM ${appConst.table.roles} WHERE name = ?`,
            { replacements: [userId, roleName], transaction: t }
        );
    };

    public CountRecentSmsRequests = async (userId: number, hourWindow: number): Promise<number> => {
        const [result]: any = await sequelizeDB.query(
            `SELECT COUNT(*) as count FROM ${appConst.table.sms_otp_requests}
         WHERE user_id = ? AND created_at >= NOW() - INTERVAL ? HOUR`,
            { replacements: [userId, hourWindow], type: QueryTypes.SELECT }
        );
        return result.count;
    };

    public StoreOtpForUser = async (userId: number, otp: number, phoneNumber: string, t: Transaction): Promise<void> => {
        await sequelizeDB.query(
            `UPDATE ${appConst.table.users} SET otp_code = ?, updated_at = NOW() WHERE id = ?`,
            { replacements: [otp, userId], transaction: t }
        );

        await sequelizeDB.query(
            `INSERT INTO ${appConst.table.sms_otp_requests} (user_id, phone_number, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
            { replacements: [userId, phoneNumber], transaction: t }
        );
    };

    public GetMobileCountriesInfo = async (): Promise<CountryType[]> => {
        return await Country.findAll();
    }

    public SyncUserRole = async (userId: number, roleName: string) => {
        await sequelizeDB.query(
            `INSERT INTO ` + appConst.table.model_has_roles + ` (role_id, model_type, model_id)
            SELECT id, 'App\\\\Models\\\\User', ? FROM ` + appConst.table.roles + ` WHERE name = ?`,
            {
                replacements: [userId, roleName],
            }
        );
    }

    public CreateGuestUser = async (userData: GuestUserInput): Promise<number> => {
        const [result] = await sequelizeDB.query(
            `INSERT INTO ` + appConst.table.users + ` 
        (username, normalized_username, phone_number_confirmed, security_stamp, con_currency_stamp, phone_number, two_factor_enabled, look_out_enabled, access_failed_count, popup_showing_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    userData.username,
                    userData.normalized_username,
                    userData.phone_number_confirmed,
                    userData.security_stamp,
                    userData.con_currency_stamp,
                    userData.phone_number,
                    userData.two_factor_enabled,
                    userData.look_out_enabled,
                    userData.access_failed_count,
                    userData.popup_showing_date,
                ],
                type: QueryTypes.INSERT,
            }
        );
        return result;
    }

    public GetLatestUserDeviceToken = async (userId: number): Promise<any | null> => {
        const result = await sequelizeDB.query(`
            SELECT * FROM ` + appConst.table.user_device_tokens + `
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
            `, {
            replacements: [userId],
            type: QueryTypes.SELECT,
        });
        return result[0] || null;
    };

    public UpdateUserDeviceToken = async (data: Omit<DeviceTokenData, 'user_type'>, id: number, transaction: Transaction) => {
        return await sequelizeDB.query(`
            UPDATE ` + appConst.table.user_device_tokens + `
            SET user_id = ?, device_type = ?, registration_token = ?, device_id = ?, active = 1
            WHERE id = ?
            `, {
            replacements: [
                data.user_id,
                data.device_type,
                data.registration_token,
                data.device_id,
                id,
            ],
            type: QueryTypes.UPDATE,
            transaction,
        });
    };

    public CreateUserDeviceToken = async (data: DeviceTokenData, transaction: Transaction) => {
        return await sequelizeDB.query(`
            INSERT INTO ` + appConst.table.user_device_tokens + `
            (user_id, device_type, registration_token, active, user_type, device_id)
            VALUES (?, ?, ?, 1, ?, ?)
            `, {
            replacements: [
                data.user_id,
                data.device_type,
                data.registration_token,
                data.user_type,
                data.device_id,
            ],
            type: QueryTypes.INSERT,
            transaction,
        });
    }
}

export default new AccountRepository();