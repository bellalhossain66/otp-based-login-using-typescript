
export function Normalizephone(phone: string): string {
    if (phone.startsWith('++')) {
        return phone.slice(2);
    }
    if (phone.startsWith('00')) {
        return phone.slice(2);
    }
    return phone;
}

export function GetExpectedphoneNumberFormat(phone: string): string {
    if (!phone) return '';

    phone = phone.replace(/[^\d+]/g, '');

    if (phone.startsWith('00')) {
        phone = phone.slice(2);
    } else if (phone.startsWith('0')) {
        phone = phone.slice(1);
    }

    if (phone.startsWith('+')) {
        phone = phone.slice(1);
    }

    return phone;

}