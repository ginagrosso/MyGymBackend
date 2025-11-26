const { registerClient } = require('./users/createUser.service');
const { getUserProfile } = require('./users/readUser.service');
const { updateUserProfile, changePassword } = require('./users/updateUser.service');

module.exports = {
    registerClient,
    getUserProfile,
    updateUserProfile,
    changePassword
};
