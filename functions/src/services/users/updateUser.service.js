const admin = require('firebase-admin');
const axios = require('axios');
const userRepository = require('../../repositories/users.repository');
const gymsRepository = require('../../repositories/gyms.repository');
const { updateUserSchema, changePasswordSchema } = require('../../schemas/user.schema');
const { DataValidationError, ResourceNotFoundError, AuthorizationError } = require('../../utils/httpStatusCodes');

// Actualizar perfil del usuario
const updateUserProfile = async (uid, data) => {
    console.log(`SERVICIO. Actualizando perfil del usuario: ${uid}`);
    
    // Validar datos
    const { error, value } = updateUserSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // Verificar que el usuario existe
    const existingUser = await userRepository.getUserProfileFromDB(uid);
    if (!existingUser) {
        throw new ResourceNotFoundError('Usuario no encontrado');
    }
    
    // Actualizar solo los campos enviados
    const updatedProfile = await userRepository.updateUserProfileInDB(uid, value);
    
    return updatedProfile;
};

// Cambiar contraseña del usuario
const changePassword = async (uid, email, data) => {
    console.log(`SERVICIO. Cambiando contraseña del usuario: ${uid}`);
    
    // Validar datos
    const { error, value } = changePasswordSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // Verificar que la contraseña actual es correcta
    const firebaseApiKey = process.env.MY_FIREBASE_API_KEY;
    
    try {
        await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
            {
                email: email,
                password: value.currentPassword,
                returnSecureToken: true
            }
        );
    } catch (error) {
        throw new AuthorizationError('La contraseña actual es incorrecta');
    }
    
    // Actualizar la contraseña en Firebase Auth
    try {
        await admin.auth().updateUser(uid, {
            password: value.newPassword
        });
        
        console.log('Contraseña actualizada exitosamente');
        return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw new Error('Error al actualizar la contraseña');
    }
};

// Dar de baja un cliente (por gym admin)
const deactivateClient = async (gymId, clientId, requestingUserId) => {
    console.log(`SERVICIO. Dando de baja cliente ${clientId} del gym ${gymId}`);
    
    // 1. Verificar que el usuario que hace la request es el gym dueño
    if (requestingUserId !== gymId) {
        throw new AuthorizationError('No tenés permiso para dar de baja clientes de este gimnasio');
    }
    
    // 2. Verificar que el gym existe
    const gymProfile = await gymsRepository.getGymProfileFromDB(gymId);
    if (!gymProfile || gymProfile.userType !== 'gym') {
        throw new AuthorizationError('El usuario no es un gimnasio');
    }
    
    // 3. Verificar que el cliente existe y pertenece a ese gym
    const clientProfile = await userRepository.getUserProfileFromDB(clientId);
    if (!clientProfile) {
        throw new ResourceNotFoundError('Cliente no encontrado');
    }
    
    if (clientProfile.gymId !== gymId) {
        throw new AuthorizationError('El cliente no pertenece a este gimnasio');
    }
    
    // 4. marcar como inactivo
    await userRepository.updateUserProfileInDB(clientId, { isActive: false });
    
    return {
        message: 'Cliente dado de baja exitosamente',
        clientId: clientId
    };
};

// Reactivar un cliente (por gym admin)
const activateClient = async (gymId, clientId, requestingUserId) => {
    console.log(`SERVICIO. Reactivando cliente ${clientId} del gym ${gymId}`);
    
    // Reutilizar la misma lógica de deactivate pero con isActive: true
    // 1. Verificar permisos
    if (requestingUserId !== gymId) {
        throw new AuthorizationError('No tenés permiso para reactivar clientes de este gimnasio');
    }
    
    // 2. Verificar que el gym existe
    const gymProfile = await gymsRepository.getGymProfileFromDB(gymId);
    if (!gymProfile || gymProfile.userType !== 'gym') {
        throw new AuthorizationError('El usuario no es un gimnasio');
    }
    
    // 3. Verificar que el cliente existe y pertenece a ese gym
    const clientProfile = await userRepository.getUserProfileFromDB(clientId);
    if (!clientProfile) {
        throw new ResourceNotFoundError('Cliente no encontrado');
    }
    
    if (clientProfile.gymId !== gymId) {
        throw new AuthorizationError('El cliente no pertenece a este gimnasio');
    }
    
    // 4. Marcar como activo
    await userRepository.updateUserProfileInDB(clientId, { isActive: true });
    
    return {
        message: 'Cliente reactivado exitosamente',
        clientId: clientId
    };
};

module.exports = {
    updateUserProfile,
    changePassword,
    deactivateClient,
    activateClient
};