export default interface User {
    id: number;
    name: string;
    username: string;
    normalized_username: string;
    phone_number?: string;
    email_verified_at?: string | null;
    phone_number_confirmed?: number;
    first_login?: number;
    otp_code?: number | null;
    created_at?: Date;
    updated_at?: Date;
    secondary_otp_receiver_number?: string | null;
    device_id?: number;
    ip_address?: string;
    popup_showing_date?: Date | null;
    can_podcast?: number;
    security_stamp: string;
    con_currency_stamp: string;
    two_factor_enabled: number;
    look_out_enabled: number;
    access_failed_count: number;
}