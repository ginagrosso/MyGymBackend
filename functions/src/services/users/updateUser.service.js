const admin = require('firebase-admin');
const axios = require('axios');
const userRepository = require('../../repositories/users.repository');
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

module.exports = {
    updateUserProfile,
    changePassword
};