const { logCheckIn } = require('./streaks/createStreak.service');
const { getUserStreak } = require('./streaks/readStreak.service');

module.exports = {
    logCheckIn,
    getUserStreak
};