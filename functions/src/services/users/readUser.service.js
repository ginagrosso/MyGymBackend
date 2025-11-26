const userRepository = require('../../repositories/users.repository');
const { calculateIMC, calculateIdealWeightDevine, getIMCCategory } = require('../../utils/math.calculator');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const getUserProfile = async (uid) => {
    console.log(`SERVICIO. Obteniendo perfil del usuario: ${uid}`);
    
    const userProfile = await userRepository.getUserProfileFromDB(uid);
    
    if (!userProfile) {
        throw new ResourceNotFoundError('Usuario no encontrado');
    }
    
    let healthData = {};
    
    if (userProfile.weight && userProfile.height) {
        const imc = calculateIMC(userProfile.weight, userProfile.height);
        const imcCategory = getIMCCategory(imc);
        
        const pesoIdeal = userProfile.gender 
            ? calculateIdealWeightDevine(userProfile.height, userProfile.gender)
            : null;
        
        healthData = {
            imc,
            pesoIdeal,
            imcCategory
        };
    }
    
    return {
        ...userProfile,
        ...healthData
    };
};

module.exports = {
    getUserProfile
};