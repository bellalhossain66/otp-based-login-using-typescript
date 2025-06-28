import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db.config';

interface UserDeviceTokenAttributes {
    id?: number;
    user_id?: number | null;
    device_id?: string | null;
    device_type?: number | null;
    registration_token?: string | null;
    created_at?: Date | null;
    created_by?: string | null;
    updated_at?: Date | null;
    updated_by?: string | null;
    active?: number;
    user_type?: number;
}


type CreationAttributes = Optional<UserDeviceTokenAttributes, 'id'>;

class UserDeviceTokenModel extends Model<UserDeviceTokenAttributes, CreationAttributes>
    implements UserDeviceTokenAttributes {
    public id!: number;
    public user_id!: number | null;
    public device_id!: string | null;
    public device_type!: number | null;
    public registration_token!: string | null;
    public created_at!: Date | null;
    public created_by!: string | null;
    public updated_at!: Date | null;
    public updated_by!: string | null;
    public active!: number;
    public user_type!: number;
}

UserDeviceTokenModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },
        device_id: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        device_type: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        registration_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        active: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
        },
        user_type: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: 'user_device_tokens',
        tableName: 'user_device_tokens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default UserDeviceTokenModel;
export type UserDeviceTokenModelType = InstanceType<typeof UserDeviceTokenModel>;