import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db.config';

interface SubscriptionAttributes {
    id?: number;
    subscription_type: string;
    client_id: number;
    client_order_id?: number | null;
    start_date: Date;
    previous_generated_date?: Date | null;
    next_generate_date?: Date | null;
    canceled_date?: Date | null;
    active: number;
    created_at?: Date | null;
    updated_at?: Date | null;
    deleted_at?: Date | null;
}


type SubscriptionCreationAttributes = Optional<SubscriptionAttributes, 'id'>;

class SubscriptionModel extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
    implements SubscriptionAttributes {
    public id!: number;
    public subscription_type!: string;
    public client_id!: number;
    public client_order_id!: number | null;
    public start_date!: Date;
    public previous_generated_date!: Date | null;
    public next_generate_date!: Date | null;
    public canceled_date!: Date | null;
    public active!: number;
    public created_at!: Date | null;
    public updated_at!: Date | null;
    public deleted_at!: Date | null;
}

SubscriptionModel.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        subscription_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        client_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        client_order_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        previous_generated_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        next_generate_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        canceled_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        active: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'subscriptions',
        tableName: 'subscriptions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default SubscriptionModel;
export type SubscriptionModelType = InstanceType<typeof SubscriptionModel>;