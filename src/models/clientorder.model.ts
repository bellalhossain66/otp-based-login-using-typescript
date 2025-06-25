import {
    Model,
    DataTypes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/db.config';

interface ClientOrderAttributes {
    id: number;
    number?: string;
    client_order_status?: number;
    driver_id?: number;
    sale_item_id?: number;
    created_at?: Date;
    created_by?: string;
    updated_at?: Date;
    updated_by?: string;
    active?: number;
    client_id?: number;
    feed_back?: string;
    rate?: number;
    promo_code_id?: number;
    location_id?: number;
    hide_feedback?: string;
    driver_fee_id?: number;
    driver_claim_id?: number;
    delivery_time?: string;
    device_id?: string;
    delivery_fee?: number;
    tax?: number;
    cost?: number;
    service_type?: number;
    promotional_link_id?: number;
    device_source?: string;
    payment_date?: string;
    device_token?: string;
    promo_code_applied_source?: string;
    charged_currency_id?: number;
    charged_price?: number;
    discount_amount?: number;
    sub_total?: number;
    exchange_rate?: number;
    checkout_currency?: string;
    system_default_currency?: string;
    driver_assign_on?: string;
    flg_selected?: number;
    gift_image_id?: number;
    order_type?: number;
    payment_gateway?: string;
    singular_id_url?: string;
    tracking_client_type?: string;
    is_sent_payment_done_template: number;
    temp_created_at?: Date;
    subscription_id?: number;
    parent_client_order_id?: number;
    is_converted_to_new_cart?: number;
    country_id?: number;
}

type ClientOrderCreationAttributes = Optional<
    ClientOrderAttributes,
    'id' | 'is_sent_payment_done_template'
>;

class ClientOrder
    extends Model<InferAttributes<ClientOrder>, InferCreationAttributes<ClientOrder>>
    implements ClientOrderAttributes {
    declare id: CreationOptional<number>;
    declare number?: string;
    declare client_order_status?: number;
    declare driver_id?: number;
    declare sale_item_id?: number;
    declare created_at?: Date;
    declare created_by?: string;
    declare updated_at?: Date;
    declare updated_by?: string;
    declare active?: number;
    declare client_id?: number;
    declare feed_back?: string;
    declare rate?: number;
    declare promo_code_id?: number;
    declare location_id?: number;
    declare hide_feedback?: string;
    declare driver_fee_id?: number;
    declare driver_claim_id?: number;
    declare delivery_time?: string;
    declare device_id?: string;
    declare delivery_fee?: number;
    declare tax?: number;
    declare cost?: number;
    declare service_type?: number;
    declare promotional_link_id?: number;
    declare device_source?: string;
    declare payment_date?: string;
    declare device_token?: string;
    declare promo_code_applied_source?: string;
    declare charged_currency_id?: number;
    declare charged_price?: number;
    declare discount_amount?: number;
    declare sub_total?: number;
    declare exchange_rate?: number;
    declare checkout_currency?: string;
    declare system_default_currency?: string;
    declare driver_assign_on?: string;
    declare flg_selected?: number;
    declare gift_image_id?: number;
    declare order_type?: number;
    declare payment_gateway?: string;
    declare singular_id_url?: string;
    declare tracking_client_type?: string;
    declare is_sent_payment_done_template: number;
    declare temp_created_at?: Date;
    declare subscription_id?: number;
    declare parent_client_order_id?: number;
    declare is_converted_to_new_cart?: number;
    declare country_id?: number;
}

ClientOrder.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        number: DataTypes.STRING,
        client_order_status: DataTypes.INTEGER,
        driver_id: DataTypes.BIGINT.UNSIGNED,
        sale_item_id: DataTypes.BIGINT.UNSIGNED,
        created_at: DataTypes.DATE,
        created_by: DataTypes.STRING,
        updated_at: DataTypes.DATE,
        updated_by: DataTypes.STRING,
        active: DataTypes.TINYINT,
        client_id: DataTypes.BIGINT.UNSIGNED,
        feed_back: DataTypes.TEXT,
        rate: DataTypes.INTEGER,
        promo_code_id: DataTypes.BIGINT.UNSIGNED,
        location_id: DataTypes.BIGINT.UNSIGNED,
        hide_feedback: DataTypes.STRING,
        driver_fee_id: DataTypes.BIGINT.UNSIGNED,
        driver_claim_id: DataTypes.BIGINT.UNSIGNED,
        delivery_time: DataTypes.STRING,
        device_id: DataTypes.STRING(500),
        delivery_fee: DataTypes.DOUBLE,
        tax: DataTypes.DOUBLE,
        cost: DataTypes.DOUBLE,
        service_type: DataTypes.INTEGER,
        promotional_link_id: DataTypes.BIGINT.UNSIGNED,
        device_source: DataTypes.STRING,
        payment_date: DataTypes.STRING,
        device_token: DataTypes.STRING,
        promo_code_applied_source: DataTypes.STRING,
        charged_currency_id: DataTypes.INTEGER,
        charged_price: DataTypes.DOUBLE,
        discount_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
        },
        sub_total: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
        },
        exchange_rate: DataTypes.DOUBLE,
        checkout_currency: {
            type: DataTypes.STRING,
            defaultValue: 'SAR',
        },
        system_default_currency: {
            type: DataTypes.STRING,
            defaultValue: 'SAR',
        },
        driver_assign_on: DataTypes.STRING,
        flg_selected: DataTypes.INTEGER,
        gift_image_id: DataTypes.BIGINT.UNSIGNED,
        order_type: DataTypes.INTEGER,
        payment_gateway: DataTypes.STRING,
        singular_id_url: DataTypes.STRING,
        tracking_client_type: DataTypes.STRING,
        is_sent_payment_done_template: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: false,
        },
        temp_created_at: DataTypes.DATE,
        subscription_id: DataTypes.BIGINT.UNSIGNED,
        parent_client_order_id: DataTypes.BIGINT.UNSIGNED,
        is_converted_to_new_cart: DataTypes.TINYINT,
        country_id: DataTypes.BIGINT.UNSIGNED,
    },
    {
        sequelize,
        tableName: 'client_orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default ClientOrder;
export type ClientOrderType = InstanceType<typeof ClientOrder>;