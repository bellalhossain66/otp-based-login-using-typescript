import { QueryTypes } from 'sequelize';
import sequelizeDB from '../config/db.config';
import appConst from '../config/app.const';
import User from '../interfaces/user.interface';


class JWTService {
    public async GetUserFindById(user_id: number): Promise<User | null> {
        try {
            const [user] = await sequelizeDB.query<User>(
                `SELECT u.id, u.phone, u.name FROM ${appConst.table.users} AS u WHERE u.id = :user_id LIMIT 1`,
                {
                    replacements: { user_id },
                    type: QueryTypes.SELECT
                }
            );
            return user || null;
        } catch (err) {
            console.error('GetUserFindById error:', err);
            return null;
        }
    }
}

export default new JWTService();
