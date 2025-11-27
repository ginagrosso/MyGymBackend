const registrationsRepository = require('../../repositories/registrations.repository');
const { createRegistrationSchema } = require('../../schemas/registration.schema');


const createRegistration = async (data) => {
    try {
        const { error, value } = createRegistrationSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        const registration = await registrationsRepository.createRegistrationInDB(value);
        
        return registration;
        
    } catch (error) {
        throw error;
    }
};

module.exports = { createRegistration };