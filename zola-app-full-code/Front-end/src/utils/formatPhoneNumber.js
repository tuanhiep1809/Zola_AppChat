function formatPhoneNumber(phoneNumber) {
    const countryCode = phoneNumber.split(' ')[0];
    const phoneNumberWithoutCountryCode = phoneNumber.split(' ').slice(1).join('');
    const phoneNumberWithoutZero = phoneNumberWithoutCountryCode.replace(/^0+/, '');
    const result = (`${countryCode} ${phoneNumberWithoutZero}`).replace(/\s/g, '');
    return result;
}

export default formatPhoneNumber;
