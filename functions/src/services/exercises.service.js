//source/services/exercises.service.js
//Importar getExternalExercises desde ./exercises/getExternalExercises.service.js.
//Importar createCustomExercise desde ./exercises/createCustomExercise.service.js.
//Importar getCustomExercises desde ./exercises/getCustomExercises.service.js.
//Exportar { ...getExternalExercisesService, ...createCustomExerciseService, ...getCustomExercisesService }.

const { getGymExercises, getExerciseDetails } = require('./exercises/readExercise.service');
const { createExercise } = require('./exercises/createExercise.service');
const { updateExercise, archiveExercise } = require('./exercises/updateExercise.service');

module.exports = {
    getGymExercises,
    getExerciseDetails,
    createExercise,
    updateExercise,
    archiveExercise
};