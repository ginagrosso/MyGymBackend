const gymsRepository = require('../../repositories/gyms.repository');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const getGymProfile = async (uid) => {
    console.log(`SERVICIO. Obteniendo perfil del gimnasio: ${uid}`);

    const perfilGym = await gymsRepository.getGymProfileFromDB(uid);

    if(!perfilGym){
        throw new ResourceNotFoundError('Gimnasio no encontrado');
    }

    return perfilGym;
};

const getAllGyms = async () => {
    console.log(`SERVICIO. Obteniendo todos los gimnasios`);
    return await gymsRepository.getAllGymsFromDB();
};
module.exports = {
    getGymProfile,
    getAllGyms
}