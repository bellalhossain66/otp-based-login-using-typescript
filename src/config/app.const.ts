import dotenv from 'dotenv';
import { AppConstType } from '../interfaces/appconst.interface';

dotenv.config();

const dbName = process.env.DB_DATABASE ?? '';
const dbPrefix = `\`${dbName}\``;

const appConst: AppConstType = {
    app: {
        app_url: process.env.APP_URL ?? '',
    },
    mysql: {
        db_name: dbName,
        db_user: process.env.DB_USERNAME ?? '',
        db_pass: process.env.DB_PASSWORD ?? '',
        db_host: process.env.DB_HOST ?? 'localhost',
    },
    redis: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASS || undefined,
    },
    table: {
        users: `${dbPrefix}.users`,
        client_orders: `${dbPrefix}.client_orders`,
        client_groups: `${dbPrefix}.client_groups`,
        user_pop_up_activities: `${dbPrefix}.user_pop_up_activities`,
        pop_up_groups: `${dbPrefix}.pop_up_groups`,
        pop_ups: `${dbPrefix}.pop_ups`,
        roles: `${dbPrefix}.roles`,
        model_has_roles: `${dbPrefix}.model_has_roles`,
        sms_otp_requests: `${dbPrefix}.sms_otp_requests`,
        generate_deep_links: `${dbPrefix}.generate_deep_links`,
        generate_campaigns: `${dbPrefix}.generate_campaigns`,
        deep_link_activities: `${dbPrefix}.deep_link_activities`,
        user_device_tokens: `${dbPrefix}.user_device_tokens`,
        language_translations: `${dbPrefix}.language_translations`,
        languages: `${dbPrefix}.languages`,
        countries: `${dbPrefix}.countries`,
        user_default_settings: `${dbPrefix}.user_default_settings`,
        admin_preferences: `${dbPrefix}.admin_preferences`,
        currencies: `${dbPrefix}.currencies`,
    },
    jwt: {
        jwt_secret: process.env.JWT_SECRET || 'XQEKh9c7PqpkXsMaOLdvspZgyexJHjmdE5k4NW5fSZ519C7UUzdwefug8waCCvKo',
        app_secret_key: process.env.APP_SECRET_KEY || '8D324A77-FD7D-4C8E-B238-2CEAAAB98169',
        super_user_phone: process.env.SUPER_USER_PHONE ?? '',
    },
    current_base_url_of_file: process.env.CURRENT_BASE_URL_OF_FILE ?? '',
    super_user: {
        super_user_phone: process.env.SUPER_USER_PHONE || '00966700000000',
        super_user_otp: process.env.SUPER_USER_OTP || '1234',
    },
    sms: {
        max_sms_limit: Number(process.env.MAX_SMS_LIMIT) || 3,
        sms_hour_window: Number(process.env.SMS_HOUR_WINDOW) || 48,
    },
    whatsApp: {
        whatsapp_template_url: process.env.WHATSAPP_TEMPLATE_URL || 'https://app.prowhats.com/api/wpbox/sendtemplatemessage',
        whatsapp_token: process.env.WHATSAPP_TOKEN || '8Pv0sYhabhUYcSH0Q4T3MZOQcRTOmfYTeOvqxsS0905881a8',
    },
    template: {
        template_name: process.env.TEMPLATE_NAME || 'otp_message',
        template_language: process.env.TEMPLATE_LANGUAGE || 'en',
    },
};

export default appConst;