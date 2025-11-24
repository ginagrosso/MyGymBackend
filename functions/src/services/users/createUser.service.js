//createUser.service.js:
//Función registerUser(data): (Lógica: Llama a usersRepo.createUserAuth, luego usersRepo.createUserProfileInDB. Si data.tipoUsuario es 'gimnasio', llama a gymsRepo.createGymProfileInDB).
//Exportar { registerUser }.

const userRepository = require('../../repositories/users.repository');
const userSchema = require('../../schemas/user.schema');

// funcion registarr usuario
const registerUser = async (data) => {
    console.log(`SERVICIO. Iniciando registro de usuario ${data}`);
    
    try {
        //validar datos
        const {error, value} = userSchema.createUserSchema.validate(data);
        if(error){
            console.log(`SERVIVIO. Error validando datos:`, error.details[0].message);
            throw new Error(error.details[0].message);
        }
        

        console.log(`SERVICIO. Datos validados correctamente`);
        const nuevoUser = await userRepository.createUserAuth(
            value.email,
            value.password
        );

        console.log(`SERVICIO. Usuario creado en Auth con UID:`, nuevoUser.uid);

        //datos para el perfil
        const datosPerfil = {
            email: value.email,
            nombre: value.nombre,
            tipoUsuario: 'socio',
            fotoUrl: value.fotoUrl || null,
            peso: value.peso || null,
            altura: value.altura || null,
            fechaNacimiento: value.fechaNacimiento || null,
            activeRoutineId: null
        };

        const perfilUser = await userRepository.createUserProfileInDB(
            nuevoUser.uid,
            datosPerfil
        );

        console.log(`Perfil creado en RTDB`);

        // retornar usuario creado
        return perfilUser;
        
    } catch (error) {

        console.log(`SERVICIO. Error registrando usuario:`, error.message);
        throw error;
        
    }
};



module.exports = { registerUser };
