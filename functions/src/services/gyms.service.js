const {registerGym} = require('./gyms/createGym.service');
const {getGymProfile, getAllGyms, getClientsFromGym, getGymStats} = require('./gyms/readGym.service');
const {updateGymProfile} = require('./gyms/updateGym.service');

module.exports = {
    registerGym,
    getGymProfile,
    getAllGyms,
    getClientsFromGym,
    updateGymProfile,
    getGymStats
}