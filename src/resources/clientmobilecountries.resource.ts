import { CountryType } from "../models/country.model";

class MobileCountriesResource {
    static toArray(country: CountryType): {
        name: string;
        arabicName: string;
        phoneCode: string;
        lenghtMobileNumber: number;
    } {
        return {
            name: country.name || '',
            arabicName: country.arabic_name || '',
            phoneCode: country.phone_code ? String(country.phone_code) : '',
            lenghtMobileNumber: country.length_mobile_number ? parseInt(String(country.length_mobile_number)) : 0
        };
    }

    static collection(countries: CountryType[]): ReturnType<typeof this.toArray>[] {
        return countries.map(country => this.toArray(country));
    }
}

export default MobileCountriesResource;