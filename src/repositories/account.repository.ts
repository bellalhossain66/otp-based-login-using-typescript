import { Op, QueryTypes, Transaction } from 'sequelize';
import appConst from '../config/app.const';
import sequelizeDB from '../config/db.config';
import User from '../interfaces/user.interface';
import Role from '../interfaces/role.interface';
import ClientOrder, { ClientOrderType } from "../models/clientorder.model";
import DeeplinkActivity, { DeeplinkActivityType } from '../models/deeplinkactivity.model';

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
}

export default new AccountRepository();