//source/services/users.service.js
//Importar registerUser desde ./users/register.service.js.
//Importar getUserProfile desde ./users/getUserProfile.service.js.
//Importar updateUserProfile desde ./users/updateUserProfile.service.js.
//Importar setUserType desde ./users/setUserType.service.js.
//Exportar { ...registerService, ...getProfileService, ...updateProfileService, ...setUserTypeService }.

const {createUser} = require('./users/createUser.service');
const {getUserByUid, getUserByEmail} = require('./users/readUser.service');
const {updateUser} = require('./users/updateUser.service');

module.exports = {
    createUser,
    getUserByUid,
    getUserByEmail,
    updateUser
}
