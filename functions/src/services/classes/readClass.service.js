//readClass.service.js:
//Función getClassesByGym(gymId): (Lógica: Llama a classesRepo.getClassesByGymFromDB(gymId)).
//Función getUserClasses(userId): (Lógica: Llama a classesRepo.getUserClassesFromDB para obtener IDs, luego itera y llama a classesRepo.getClassDetailsFromDB para obtener detalles).
//Exportar { getClassesByGym, getUserClasses }.