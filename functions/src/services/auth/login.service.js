const axios = require('axios');
const { loginSchema } = require('../../schemas/user.schema');
const { DataValidationError, AuthorizationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');
const userRepository = require('../../repositories/users.repository');
const gymsRepository = require('../../repositories/gyms.repository');

const login = async (data) => {
    console.log(`SERVICIO. Iniciando login de usuario: ${JSON.stringify(data)}`);

    try {
        const {error, value} = loginSchema.validate(data);

        if(error){
            throw new DataValidationError(error.details[0].message);
        }

        const firebaseApiKey = process.env.MY_FIREBASE_API_KEY;

        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
        let authResponse;

        try {
            authResponse = await axios.post(authUrl, 
                {
                    email: value.email,
                    password: value.password,
                    returnSecureToken: true
                },
            );
        } catch (error) {
            if(error.response && error.response.data){
                throw new AuthorizationError('Email o contraseña incorrectos');
            }
            throw new AuthorizationError('Error en la autenticación');
        }

        const uid = authResponse.data.localId;
        const idToken = authResponse.data.idToken;

        let userProfile = await userRepository.getUserProfileFromDB(uid);

        if(!userProfile){
            userProfile = await gymsRepository.getGymProfileFromDB(uid);
        }

        if(!userProfile){
            throw new ResourceNotFoundError('Usuario no encontrado en la base de datos');
        }

        if(!userProfile.isActive){
            throw new AuthorizationError('Usuario inactivo');
        }

        return {
            token: idToken,
            expiresIn: authResponse.data.expiresIn,
            user: {
                uid: uid,
                email: userProfile.email,
                name: userProfile.name || userProfile.businessName,
                userType: userProfile.userType
            }
        }

    } catch (error) {
        console.log('SERVICIO AUTH. Error en login:', error.message);
        throw error; 
    };
};

module.exports = {
    login
};