const gymsRepository = require('../../repositories/gyms.repository');
const { ResourceNotFoundError, AuthorizationError } = require('../../utils/httpStatusCodes');

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

const getClientsFromGym = async (gymId, requestingUserId, filters = {}) => {
    console.log(`SERVICIO. Obteniendo clientes del gimnasio ${gymId}`);
    
    // Verificar que el usuario que hace la request es el gym dueño
    if (requestingUserId !== gymId) {
        throw new AuthorizationError('No tenés permiso para ver los clientes de este gimnasio');
    }
    
    // Verificar que el gymId corresponde a un gym (opcional pero recomendado)
    const gymProfile = await gymsRepository.getGymProfileFromDB(gymId);
    
    if (!gymProfile) {
        throw new ResourceNotFoundError('Gimnasio no encontrado');
    }
    
    if (gymProfile.userType !== 'gym') {
        throw new AuthorizationError('El usuario no es un gimnasio');
    }
    
    // Obtener todos los clientes del gimnasio
    let clients = await gymsRepository.getClientsFromGym(gymId);
    
    // Aplicar filtros según los parámetros
    if (filters.status === 'active') {
        clients = clients.filter(client => client.isActive === true);
    } else if (filters.status === 'inactive') {
        clients = clients.filter(client => client.isActive === false);
    }
    
    return clients;
};

// Obtener estadísticas del gym
const getGymStats = async (gymId, requestingUserId) => {
    console.log(`SERVICIO. Obteniendo estadísticas del gym ${gymId}`);
    
    const { AuthorizationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');
    
    // Verificar permisos
    if (requestingUserId !== gymId) {
        throw new AuthorizationError('No tenés permiso para ver estadísticas de este gimnasio');
    }
    
    // Verificar que el gym existe
    const gymProfile = await gymsRepository.getGymProfileFromDB(gymId);
    if (!gymProfile || gymProfile.userType !== 'gym') {
        throw new AuthorizationError('El usuario no es un gimnasio');
    }
    
    // Obtener todos los clientes
    const allClients = await gymsRepository.getClientsFromGym(gymId);
    
    // Contar activos e inactivos
    const activeClients = allClients.filter(c => c.isActive === true);
    const inactiveClients = allClients.filter(c => c.isActive === false);
    
    // Clientes nuevos este mes
    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    const newClientsThisMonth = allClients.filter(c => c.createdAt >= oneMonthAgo);
    
    return {
        totalClients: allClients.length,
        activeClients: activeClients.length,
        inactiveClients: inactiveClients.length,
        newClientsThisMonth: newClientsThisMonth.length
    };
};

module.exports = {
    getGymProfile,
    getAllGyms,
    getClientsFromGym,
    getGymStats
}