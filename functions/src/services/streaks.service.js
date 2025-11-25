//source/services/streaks.service.js
//Importar logCheckIn desde ./streaks/logCheckIn.service.js.
//Importar getUserStreak desde ./streaks/getUserStreak.service.js.
//Exportar { ...logCheckInService, ...getUserStreakService }.

const { logCheckIn } = require('./streaks/createStreak.service');
const { getUserStreak } = require('./streaks/readStreak.service');

module.exports = {
    logCheckIn,
    getUserStreak
};