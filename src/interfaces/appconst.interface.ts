export interface AppConstType {
    app: { app_url: string };
    mysql: { db_name: string; db_user: string; db_pass: string; db_host: string };
    redis: { host: string; port: number; password?: string };
    table: Record<string, string>;
    jwt: {
        jwt_secret: string;
        app_secret_key: string;
        super_user_phone?: string;
    };
    current_base_url_of_file: string;
    super_user: { super_user_phone: string; super_user_otp: string };
    sms: { max_sms_limit: number; sms_hour_window: number };
    whatsApp: { whatsapp_template_url: string; whatsapp_token: string };
    template: { template_name: string; template_language: string };
}