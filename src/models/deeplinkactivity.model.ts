import {
    Model,
    DataTypes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/db.config';

interface DeeplinkActivityAttributes {
    id: number;
    campaign_id?: number;
    user_id?: number;
    generate_deep_link_id?: number;
    client_order_id?: number;
    deep_link_code?: string;
    action_type?: string;
    count?: number;
    value?: string;
    device_id?: string;
    ip?: string;
    platform?: string;
    is_expired?: number;
    created_at?: Date;
    updated_at?: Date;
    try_count: number;
}

type DeeplinkActivityCreationAttributes = Optional<
    DeeplinkActivityAttributes,
    'id' | 'try_count' | 'is_expired'
>;

class DeeplinkActivity
    extends Model<InferAttributes<DeeplinkActivity>, InferCreationAttributes<DeeplinkActivity>>
    implements DeeplinkActivityAttributes {
    declare id: CreationOptional<number>;
    declare campaign_id?: number;
    declare user_id?: number;
    declare generate_deep_link_id?: number;
    declare client_order_id?: number;
    declare deep_link_code?: string;
    declare action_type?: string;
    declare count?: number;
    declare value?: string;
    declare device_id?: string;
    declare ip?: string;
    declare platform?: string;
    declare is_expired: CreationOptional<number>;
    declare created_at?: Date;
    declare updated_at?: Date;
    declare try_count: CreationOptional<number>;
}

DeeplinkActivity.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        campaign_id: DataTypes.BIGINT.UNSIGNED,
        user_id: DataTypes.BIGINT.UNSIGNED,
        generate_deep_link_id: DataTypes.BIGINT.UNSIGNED,
        client_order_id: DataTypes.BIGINT.UNSIGNED,
        deep_link_code: DataTypes.STRING,
        action_type: DataTypes.STRING,
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        value: DataTypes.STRING,
        device_id: DataTypes.STRING,
        ip: DataTypes.STRING,
        platform: DataTypes.STRING,
        is_expired: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        try_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'deep_link_activities',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default DeeplinkActivity;
export type DeeplinkActivityType = InstanceType<typeof DeeplinkActivity>;