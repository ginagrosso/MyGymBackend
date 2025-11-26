const gymsRepository = require('../../repositories/gyms.repository');
const { updateGymSchema } = require('../../schemas/user.schema');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

// Actualizar perfil del gym
const updateGymProfile = async (uid, data) => {
    console.log(`SERVICIO. Actualizando perfil del gimnasio: ${uid}`);
    
    // Validar datos
    const { error, value } = updateGymSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // Verificar que el gym existe
    const existingGym = await gymsRepository.getGymProfileFromDB(uid);
    if (!existingGym) {
        throw new ResourceNotFoundError('Gimnasio no encontrado');
    }

    const updatedProfile = await gymsRepository.updateGymProfileInDB(uid, value);
    
    return updatedProfile;
};

module.exports = {
    updateGymProfile
};