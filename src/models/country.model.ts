import {
    Model,
    DataTypes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../config/db.config';

export interface CountryAttributes {
    id: number;
    name?: string;
    arabic_name?: string;
    created_at?: Date;
    created_by?: string;
    updated_at?: Date;
    updated_by?: string;
    active?: number;
    capital?: string;
    continent_code?: string;
    continent_name?: string;
    country_code?: string;
    currency_code?: string;
    phone_code?: number;
    three_letter_country_code?: string;
    length_mobile_number?: number;
    lang_code?: string;
}

type CountryCreationAttributes = Optional<
    CountryAttributes,
    'id' | 'name' | 'arabic_name' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' |
    'active' | 'capital' | 'continent_code' | 'continent_name' | 'country_code' |
    'currency_code' | 'phone_code' | 'three_letter_country_code' | 'length_mobile_number' |
    'lang_code'
>;

class Country
    extends Model<InferAttributes<Country>, InferCreationAttributes<Country>>
    implements CountryAttributes {
    declare id: CreationOptional<number>;
    declare name?: string;
    declare arabic_name?: string;
    declare created_at?: Date;
    declare created_by?: string;
    declare updated_at?: Date;
    declare updated_by?: string;
    declare active?: number;
    declare capital?: string;
    declare continent_code?: string;
    declare continent_name?: string;
    declare country_code?: string;
    declare currency_code?: string;
    declare phone_code?: number;
    declare three_letter_country_code?: string;
    declare length_mobile_number?: number;
    declare lang_code?: string;
}

Country.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        arabic_name: DataTypes.STRING,
        created_at: DataTypes.DATE,
        created_by: DataTypes.STRING,
        updated_at: DataTypes.DATE,
        updated_by: DataTypes.STRING,
        active: DataTypes.TINYINT,
        capital: DataTypes.STRING,
        continent_code: DataTypes.STRING,
        continent_name: DataTypes.STRING,
        country_code: DataTypes.STRING,
        currency_code: DataTypes.STRING,
        phone_code: DataTypes.INTEGER,
        three_letter_country_code: DataTypes.STRING,
        length_mobile_number: DataTypes.INTEGER,
        lang_code: DataTypes.STRING,
    },
    {
        sequelize,
        tableName: 'countries',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Country;
export type CountryType = InstanceType<typeof Country>;