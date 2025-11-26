const {registerGym} = require('./gyms/createGym.service');
const {getGymProfile, getAllGyms, getClientsFromGym} = require('./gyms/readGym.service');
//const {updateGym} = require('./gyms/updateGym.service');

module.exports = {
    registerGym,
    getGymProfile,
    getAllGyms,
    getClientsFromGym
}