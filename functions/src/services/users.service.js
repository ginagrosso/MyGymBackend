const {registerClient} = require('./users/createUser.service');
const {getUserByUid, getUserByEmail} = require('./users/readUser.service');
const {updateUser} = require('./users/updateUser.service');

module.exports = {
    registerClient,
    getUserByUid,
    getUserByEmail,
    updateUser
}
