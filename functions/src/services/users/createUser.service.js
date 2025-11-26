const userRepository = require('../../repositories/users.repository');
const {registerClientSchema} = require('../../schemas/user.schema');
const { DataValidationError, DatabaseError, AuthorizationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');
const gymsRepository = require('../../repositories/gyms.repository');
const { generateTemporaryPassword } = require('../../utils/passwordGenerator');

// funcion registarr usuario
const registerClient = async (data) => {
    console.log(`SERVICIO. Iniciando registro de usuario: ${JSON.stringify(data)}`);
    
    try {
        //validar datos
        const {error, value} = registerClientSchema.validate(data);
        if(error){
            throw new DataValidationError(error.details[0].message);
        }
        

        //crear usuario en Firebase Auth
        const nuevoUser = await userRepository.createUserAuth(
            value.email,
            value.password
        );


        //datos para el perfil
        const datosPerfil = {
            email: value.email,
            name: value.name,
            dni: value.dni,
            birthDate: value.birthDate,
            gymId: value.gymId,
            gender: value.gender || null,
            userType: 'client',
            avatarUri: value.avatarUri || null,
            phone: value.phone || null,
            weight: value.weight || null,
            height: value.height || null,
            isActive: true,
            createdAt: Date.now(),

        };

        const perfilUser = await userRepository.createUserProfileInDB(
            nuevoUser.uid,
            datosPerfil
        );

        // retornar usuario creado
        return {
            uid: nuevoUser.uid,
            email: perfilUser.email,
            name: perfilUser.name,
            userType: perfilUser.userType,
            gymId: perfilUser.gymId
        };
        
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            throw new DataValidationError('El email ya está registrado');
        }
        if (error.code && error.code.startsWith('auth/')) {
            throw new DatabaseError('Error en el servicio de autenticación');
        }

        throw error;
        
    }
};

// Wrapper para alta manual
const registerClientManually = async (gymId, requestingUserId, data) => {
    console.log(`SERVICIO. Iniciando registro de usuario manual: ${JSON.stringify(data)}`);

    if (requestingUserId !== gymId) {
        throw new AuthorizationError('No tenés permiso para dar de alta clientes en este gimnasio');
    }
    
    const gymProfile = await gymsRepository.getGymProfileFromDB(gymId);
    if (!gymProfile) {
        throw new ResourceNotFoundError('Gimnasio no encontrado');
    }
    if (gymProfile.userType !== 'gym') {
        throw new AuthorizationError('El usuario no es un gimnasio');
    }
    
    const temporaryPassword = generateTemporaryPassword();
    const clientData = {
        ...data,
        password: temporaryPassword,
        gymId: gymId,
        birthDate: data.birthDate || '2000-01-01'
    };
    
    const newClient = await registerClient(clientData);
    
    // Enviar email automático de configuración de contraseña
    const axios = require('axios');
    const firebaseApiKey = process.env.MY_FIREBASE_API_KEY;
    
    try {
        await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
            {
                requestType: 'PASSWORD_RESET',
                email: data.email
            }
        );
        console.log('Email de configuración enviado al cliente');
    } catch (error) {
        console.log('Advertencia: No se pudo enviar email automático');
    }
    
    return {
        ...newClient,
        temporaryPassword: temporaryPassword,
        message: 'Cliente creado. Se envió email de configuración. Contraseña temporal como backup: ' + temporaryPassword
    };
};

module.exports = { registerClient, registerClientManually };
