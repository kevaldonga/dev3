const validatePassword = (password, res) => {
    if (password.length >= 8 && password.length <= 255) {
        return true;
    }
    return false;
}

module.exports = { validatePassword: validatePassword };