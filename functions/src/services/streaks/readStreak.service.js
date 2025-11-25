//readStreak.service.js:

//Función getUserStreak(userId): (Lógica: Llama a streaksRepo.getAllUserCheckInsFromDB, luego replica la lógica de utils/racha.ts para calcular la racha).

//Exportar { getUserStreak }.

const streaksRepository = require('../../repositories/streaks.repository');

// Función para calcular la racha actual
const calculateStreak = (checkIns) => {
    if (!checkIns || Object.keys(checkIns).length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }
    
    const dates = Object.keys(checkIns).sort().reverse(); // Ordenar de más reciente a más antigua
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Verificar si hay check-in hoy o ayer para iniciar racha actual
    if (dates[0] === today || dates[0] === yesterday) {
        currentStreak = 1;
        
        // Calcular racha consecutiva
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((prevDate - currDate) / 86400000);
            
            if (diffDays === 1) {
                currentStreak++;
                tempStreak++;
            } else {
                break;
            }
        }
    }
    
    // Calcular racha más larga
    tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate - currDate) / 86400000);
        
        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
    
    return { currentStreak, longestStreak };
};

const getUserStreak = async (userId) => {
    console.log(`SERVICIO. Obteniendo racha del usuario ${userId}`);
    
    try {
        const checkIns = await streaksRepository.getAllUserCheckInsFromDB(userId);
        const streakData = calculateStreak(checkIns);
        
        console.log(`Racha calculada:`, streakData);
        return {
            ...streakData,
            totalCheckIns: Object.keys(checkIns).length,
            checkIns
        };
        
    } catch (error) {
        console.log(`SERVICIO. Error obteniendo racha:`, error.message);
        throw error;
    }
};

module.exports = { getUserStreak };