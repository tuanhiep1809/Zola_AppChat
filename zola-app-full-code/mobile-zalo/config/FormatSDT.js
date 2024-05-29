function formatPhoneNumber(phoneNumber) {
    const countryCode = phoneNumber.split(' ')[0];
    const phoneNumberWithoutCountryCode = phoneNumber.split(' ').slice(1).join('');
    console.log(phoneNumberWithoutCountryCode);
    const phoneNumberWithoutZero = phoneNumberWithoutCountryCode.replace(/^0+/, '');
    console.log(phoneNumberWithoutZero)
    const result = (`${countryCode} ${phoneNumberWithoutZero}`).replace(/\s/g, '');
    console.log("result: ",result);
    return result;

}

export default formatPhoneNumber;