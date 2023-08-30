const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const specialChars = '!@#$%^&*()_-+=[]{}|;:,.<>?';
    const digitChars = '0123456789';

    const getRandomChar = (charSet) => {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        return charSet.charAt(randomIndex);
    };

    const randomUppercase = getRandomChar(uppercaseChars);
    const randomLowercase = getRandomChar(lowercaseChars);
    const randomSpecialChar = getRandomChar(specialChars);
    const randomDigit = getRandomChar(digitChars);

    const randomPassword = randomUppercase + randomLowercase + randomSpecialChar + randomDigit;

    return randomPassword;
};

module.exports = generatePassword;