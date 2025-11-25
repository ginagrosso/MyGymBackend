//createUser.service.js:
//Función registerUser(data): (Lógica: Llama a usersRepo.createUserAuth, luego usersRepo.createUserProfileInDB. Si data.tipoUsuario es 'gimnasio', llama a gymsRepo.createGymProfileInDB).
//Exportar { registerUser }.

const userRepository = require('../../repositories/users.repository');
const {registerClientSchema} = require('../../schemas/user.schema');
const { DataValidationError, DatabaseError } = require('../../utils/httpStatusCodes');

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
            userType: 'client',
            avatarUri: null,
            phone: null,
            weight: null,
            height: null,
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

module.exports = { registerClient };
