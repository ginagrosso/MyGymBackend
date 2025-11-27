const streaksRepository = require('../../repositories/streaks.repository');

const calculateStreak = (checkIns) => {
    if (!checkIns || Object.keys(checkIns).length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const dates = Object.keys(checkIns).sort().reverse();
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] === today || dates[0] === yesterday) {
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((prevDate - currDate) / 86400000);
            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    } else {
        currentStreak = dates.length === 1 ? 1 : 0;
    }

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

    return { currentStreak, longestStreak };
};

const getUserStreak = async (userId) => {
 
    try {
        const checkIns = await streaksRepository.getAllUserCheckInsFromDB(userId);
        const streakData = calculateStreak(checkIns);
        
        return {
            ...streakData,
            totalCheckIns: Object.keys(checkIns).length,
            checkIns
        };
        
    } catch (error) {
        throw error;
    }
};

module.exports = { getUserStreak };