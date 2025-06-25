import { Sequelize } from 'sequelize';
import appConst from './app.const';

const sequelizeDB: Sequelize = new Sequelize(
    appConst.mysql.db_name,
    appConst.mysql.db_user,
    appConst.mysql.db_pass,
    {
        host: appConst.mysql.db_host,
        dialect: 'mysql',
        logging: false,
    }
);

export default sequelizeDB;