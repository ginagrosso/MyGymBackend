////source/repository/exercises.repository.js
//Propósito: Manejar los ejercicios personalizados del gimnasio.
//
//Importaciones: db (de ../utils/firebase).
//
//Función createCustomExerciseInDB(gymId, data):
//
//Define const newExRef = db.ref(customExercises/${gymId}).push().
//
//Define fullData = { ...data, id: newExRef.key, isArchived: false }.
//
//Usa newExRef.set(fullData).
//
//Devuelve fullData.
//
//Función getCustomExercisesFromDB(gymId):
//
//Usa db.ref(customExercises/${gymId}).orderByChild('isArchived').equalTo(false).once('value').
//
//Devuelve snapshot.val().
//
//Exportar: { createCustomExerciseInDB, getCustomExercisesFromDB }.