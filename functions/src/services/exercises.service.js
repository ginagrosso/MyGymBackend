const { getExerciseDetails } = require('./exercises/readExercise.service');
const { createExercise } = require('./exercises/createExercise.service');
const { updateExercise, archiveExercise } = require('./exercises/updateExercise.service');

module.exports = {
    getExerciseDetails,
    createExercise,
    updateExercise,
    archiveExercise
};