export default interface GuestUserInput {
    username: string;
    normalized_username: string;
    phone_number?: string;
    phone_number_confirmed?: number;
    security_stamp: string;
    con_currency_stamp: string;
    two_factor_enabled: number;
    look_out_enabled: number;
    access_failed_count: number;
    popup_showing_date?: Date | null;
}