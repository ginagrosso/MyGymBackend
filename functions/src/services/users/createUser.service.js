//createUser.service.js:
//Función registerUser(data): (Lógica: Llama a usersRepo.createUserAuth, luego usersRepo.createUserProfileInDB. Si data.tipoUsuario es 'gimnasio', llama a gymsRepo.createGymProfileInDB).
//Exportar { registerUser }.

const Joi = require('joi');
const userRepository = require('../../repositories/users.repository');

//validaciones con joi

const createUserSchema = Joi.object({
    email : Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es obligatorio'
    }),
    password : Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es obligatoria'
    }),
    nombre: Joi.string().min(2).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    tipoUsuario: Joi.string()
    .valid('socio', 'gimnasio')
    .required().messages({
        'any.only': 'El tipo de usuario debe ser "socio" o "gimnasio"',
        'any.required': 'El tipo de usuario es obligatorio'
    }),

    //opcionales
    fotoUrl: Joi.string().uri().optional(),
    peso: Joi.number().min(20).max(300).optional(),
    altura: Joi.number().min(100).max(300).optional(),
    fechaNacimiento: Joi.string().optional(),  //formato "YYYY-MM-DD"

    //campos especificos para gimnasios
    logoUrl: Joi.string().uri().optional(),
    direccion: Joi.string().optional(),
    horarios: Joi.string().optional(),
    descripcion: Joi.string().optional()

});

const updateUserSchema = Joi.object({
    nombre: Joi.string().min(2).optional(),
    fotoUrl: Joi.string().uri().optional(),
    peso: Joi.number().min(20).max(300).optional(),
    altura: Joi.number().min(100).max(300).optional(),
    fechaNacimiento: Joi.string().optional()
}).min(1); // al menos 1 campo debe ser enviado.

// funcion registarr usuario
const registerUser = async (data) => {
    console.log(`SERVICIO. Iniciando registro de usuario ${data}`);
    
    try {
        //validar datos
        const {error, value} = createUserSchema.validate(data);
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
            tipoUsuario: value.tipoUsuario,
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

        //si es gimnasio

        if(value.tipoUsuario === 'gimansio'){
            console.log("SERVICIO.Creando usuario de tipo gimnasio");

            const datosGym = {
                uid: nuevoUser.uid,
                email: value.email,
                nombre: value.nombre,
                logoUrl: value.logoUrl || null,
                direccion: value.direccion || null,
                horarios: value.horarios || null,
                descripcion: value.descripcion || null

            };

            await gymsRepository.createGymProfileInDB(nuevoUser.uid, datosGym);
            console.log(`SERVICIO.Perfil de gimnasio creado en RTDB`);
        }

        // retornar usuario creado
        return{
            uid: nuevoUser.uid,
            email: nuevoUser.email,
            nombre: nuevoUser.nombre,
            tipoUsuario: nuevoUser.tipoUsuario,
            fotoUrl: nuevoUser.fotoUrl || null,
            peso: nuevoUser.peso || null,
            altura: nuevoUser.altura || null,
            fechaNacimiento: nuevoUser.fechaNacimiento || null
        }

    } catch (error) {

        console.log(`SERVICIO. Error registrando usuario:`, error.message);
        throw error;
        
    }
};



module.exports = { registerUser };
