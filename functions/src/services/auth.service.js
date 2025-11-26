const { login } = require('./auth/login.service');
const { forgotPassword, resetPassword } = require('./auth/passwordRecovery.service');

module.exports = {
    login,
    forgotPassword,
    resetPassword
};