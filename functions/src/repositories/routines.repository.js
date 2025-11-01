// //source/repository/routines.repository.js
// Propósito: Manejar la creación y asignación de rutinas.
// 
// Importaciones: db (de ../utils/firebase).
// 
// Función createRoutineInDB(data):
// 
// Define const newRoutineRef = db.ref('routines').push().
// 
// Define fullData = { ...data, id: newRoutineRef.key, createdAt: Date.now(), isArchived: false }.
// 
// Usa newRoutineRef.set(fullData).
// 
// Devuelve fullData.
// 
// Función updateRoutineInDB(routineId, data):
// 
// Usa db.ref(routines/${routineId}).update(data). (Se usa para soft delete seteando isArchived: true).
// 
// Función assignRoutineToUserInDB(userId, routineId):
// 
// Usa db.ref(userRoutines/${userId}).set({ activeRoutineId: routineId }).
// 
// Función getUserActiveRoutineIdFromDB(userId):
// 
// Usa db.ref(userRoutines/${userId}/activeRoutineId).once('value').
// 
// Devuelve snapshot.val().
// 
// Función getRoutineDetailsFromDB(routineId):
// 
// Usa db.ref(routines/${routineId}).once('value').
// 
// Devuelve snapshot.val().
// 
// Exportar: Todas las funciones (createRoutineInDB, updateRoutineInDB, assignRoutineToUserInDB, getUserActiveRoutineIdFromDB, getRoutineDetailsFromDB).