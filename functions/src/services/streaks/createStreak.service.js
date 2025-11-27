const streaksRepository = require('../../repositories/streaks.repository');
const { checkInSchema } = require('../../schemas/streak.schema');

const logCheckIn = async (data) => {
    
    try {
        const { error, value } = checkInSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        const dateString = new Date().toISOString().split('T')[0];
        
        const checkIn = await streaksRepository.createCheckInInDB(
            value.userId,
            dateString
        );
        return checkIn;
        
    } catch (error) {
        throw error;
    }
};

module.exports = { logCheckIn };