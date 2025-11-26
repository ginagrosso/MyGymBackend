const admin = require('firebase-admin');
const { AuthorizationError } = require('../utils/httpStatusCodes');

const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Middleware. Validando token de Firebase');

    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new AuthorizationError('Token de autenticación no proporcionado');
        }

        const token = authHeader.split('Bearer ')[1];

        if(!token){
            throw new AuthorizationError('Token de autenticación invalido');
        }

        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
        };

        console.log(`Token de Firebase validado exitosamente. Usuario id: ${decodedToken.uid}`);

        next();

    } catch (error) {
        console.error('Error verificando token:', error.message);
        
        const errorResponse = {
            success: false,
            message: 'No autorizado: ' + error.message
        };
        
        return res.status(401).json(errorResponse);
    }
};

module.exports = {
    validateFirebaseIdToken
};