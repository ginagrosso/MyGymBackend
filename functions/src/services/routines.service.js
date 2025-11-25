//source/services/routines.service.js
//Importar createRoutine desde ./routines/createRoutine.service.js.
//Importar updateRoutine desde ./routines/updateRoutine.service.js.
//Importar assignRoutine desde ./routines/assignRoutine.service.js.
//Importar getUserRoutine desde ./routines/getUserRoutine.service.js.
//Exportar { ...createRoutineService, ...updateRoutineService, ...assignRoutineService, ...getUserRoutineService }.

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
