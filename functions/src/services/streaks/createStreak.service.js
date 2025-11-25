//createStreak.service.js:

//Función logCheckIn(data): (Lógica: Llama a streaksRepo.createCheckInInDB(data.userId, data.dateString)).

//Exportar { logCheckIn }.

const streaksRepository = require('../../repositories/streaks.repository');
const { checkInSchema } = require('../../schemas/streak.schema');

const logCheckIn = async (data) => {
    console.log(`SERVICIO. Registrando check-in`);
    
    try {
        // Validar datos
        const { error, value } = checkInSchema.validate(data);
        if (error) {
            console.log(`SERVICIO. Error validando datos:`, error.details[0].message);
            throw new Error(error.details[0].message);
        }
        
        // Obtener fecha actual en formato YYYY-MM-DD
        const dateString = new Date().toISOString().split('T')[0];
        
        // Registrar check-in
        const checkIn = await streaksRepository.createCheckInInDB(
            value.userId,
            dateString
        );
        
        console.log(`Check-in registrado exitosamente`);
        return checkIn;
        
    } catch (error) {
        console.log(`SERVICIO. Error registrando check-in:`, error.message);
        throw error;
    }
};

module.exports = { logCheckIn };