const axios = require('axios');
const { forgotPasswordSchema, resetPasswordSchema } = require('../../schemas/user.schema');
const { DataValidationError } = require('../../utils/httpStatusCodes');


const forgotPassword = async (data) => {
    console.log(`SERVICIO. Solicitando recuperación de contraseña para: ${data.email}`);
    
    // Validar datos
    const { error, value } = forgotPasswordSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    const firebaseApiKey = process.env.MY_FIREBASE_API_KEY;
    
    try {
        // Llamar a la API de Firebase para enviar email de recuperación
        await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
            {
                requestType: 'PASSWORD_RESET',
                email: value.email
            }
        );
        
        return {
            message: 'Email de recuperación enviado. Revisá tu casilla de correo.'
        };
        
    } catch (error) {
        if (error.response && error.response.data) {
            const errorCode = error.response.data.error.message;
            
            if (errorCode === 'EMAIL_NOT_FOUND') {
                // Por seguridad, no revelamos si el email existe o no
                return {
                    message: 'Si el email existe, recibirás un correo de recuperación.'
                };
            }
        }
        
        throw new DataValidationError('Error al enviar email de recuperación');
    }
};


const resetPassword = async (data) => {
    console.log(`SERVICIO. Reseteando contraseña`);
    
    // Validar datos
    const { error, value } = resetPasswordSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    const firebaseApiKey = process.env.MY_FIREBASE_API_KEY;
    
    try {
        // Llamar a la API de Firebase para resetear contraseña
        await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${firebaseApiKey}`,
            {
                oobCode: value.oobCode,
                newPassword: value.newPassword
            }
        );
        
        return {
            message: 'Contraseña restablecida exitosamente. Ya podés iniciar sesión.'
        };
        
    } catch (error) {
        if (error.response && error.response.data) {
            const errorCode = error.response.data.error.message;
            
            if (errorCode === 'INVALID_OOB_CODE') {
                throw new DataValidationError('Código de recuperación inválido o expirado');
            }
        }
        
        throw new DataValidationError('Error al restablecer la contraseña');
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};