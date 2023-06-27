const validatePassword = (password) => {
    return password.length >= 8 && password.length <= 255;
}

module.exports = { validatePassword: validatePassword };