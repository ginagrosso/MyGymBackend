const { registerClient, registerClientManually } = require('./users/createUser.service');
const { getUserProfile } = require('./users/readUser.service');
const { updateUserProfile, changePassword, deactivateClient, activateClient } = require('./users/updateUser.service');

module.exports = {
    registerClient,
    registerClientManually,
    getUserProfile,
    updateUserProfile,
    changePassword,
    deactivateClient,
    activateClient
};  
