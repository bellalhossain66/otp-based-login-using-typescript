import { Transaction, QueryTypes } from 'sequelize';
import sequelizeDB from '../config/db.config';
import AppConst from '../config/app.const';
import UserDeviceTokenModel from '../models/userdevicetoken.model';

class UserDeviceToken {
    public async FindUserByguestUserId(guestUserId: number): Promise<any | null> {
        const [user] = await sequelizeDB.query(
            `SELECT * FROM ${AppConst.table.users} WHERE id = ? LIMIT 1`,
            {
                replacements: [guestUserId],
                type: QueryTypes.SELECT,
            }
        );
        return user || null;
    }

    public async FindUserByloggedUserId(loggedUserId: number): Promise<any | null> {
        const [user] = await sequelizeDB.query(
            `SELECT * FROM ${AppConst.table.users} WHERE id = ? LIMIT 1`,
            {
                replacements: [loggedUserId],
                type: QueryTypes.SELECT,
            }
        );
        return user || null;
    }

    public async FindUserDeviceTokenByGuestId(guestUser: any, t: Transaction): Promise<any> {
        return await UserDeviceTokenModel.findOne({
            where: { user_id: guestUser.id },
            order: [['created_at', 'DESC']],
            transaction: t,
        });
    }

    public async DestroyUserDeviceToken(realUser: any, t: Transaction): Promise<void> {
        await UserDeviceTokenModel.destroy({
            where: { user_id: realUser.id },
            transaction: t,
        });
    }

    public async CreateUserDeviceToken(realUser: any, guestDeviceToken: any, t: Transaction): Promise<void> {
        await UserDeviceTokenModel.create(
            {
                user_id: realUser.id,
                device_type: 1,
                registration_token: guestDeviceToken.registration_token,
                active: 1,
                user_type: 1,
                device_id: realUser.device_id || null,
            },
            { transaction: t }
        );
    }
}

export default new UserDeviceToken();