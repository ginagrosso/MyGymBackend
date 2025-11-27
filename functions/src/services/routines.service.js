const { createRoutine } = require('./routines/createRoutine.service');
const { updateRoutine, archiveRoutine } = require('./routines/updateRoutine.service');
const { assignRoutine } = require('./routines/assignRoutine.service');
const {  getRoutineDetails, getUserActiveRoutine } = require('./routines/readRoutine.service');
const { logProgress } = require('./routines/logProgress.service');

module.exports = {
    createRoutine,
    updateRoutine,
    archiveRoutine,
    assignRoutine,
    getRoutineDetails,
    getUserActiveRoutine,
    logProgress
};
