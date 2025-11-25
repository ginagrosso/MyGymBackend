const gymsRepository = require('../../repositories/gyms.repository');
const {registerGymSchema} = require('../../schemas/user.schema');
const { DataValidationError, DatabaseError } = require('../../utils/httpStatusCodes');

// funcion registarr usuario
const registerGym = async (data) => {
    console.log(`SERVICIO. Iniciando registro de usuario: ${JSON.stringify(data)}`);
    
    try {
        //validar datos
        const {error, value} = registerGymSchema.validate(data);
        if(error){
            throw new DataValidationError(error.details[0].message);
        }
        

        //crear usuario en Firebase Auth
        const nuevoUser = await gymsRepository.createGymAuth(
            value.email,
            value.password
        );


        //datos para el perfil
        const datosPerfil = {
            email: value.email,
            businessName: value.businessName,
            address: value.address,
            phone: value.phone || null,
            avatarUri: value.avatarUri || null,
            userType: 'gym',
            createdAt: Date.now(),
            isActive: true,
        };

        const perfilUser = await gymsRepository.createGymProfileInDB(
            nuevoUser.uid,
            datosPerfil
        );

        // retornar usuario creado
        return {
            uid: nuevoUser.uid,
            email: perfilUser.email,
            businessName: perfilUser.businessName,
            address: perfilUser.address,
            phone: perfilUser.phone,
            avatarUri: perfilUser.avatarUri,
            userType: perfilUser.userType
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

module.exports = { registerGym };
