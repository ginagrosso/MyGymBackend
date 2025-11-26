// functions/src/repositories/classes.repository.js
const { db } = require('../utils/firebase');

// =============================================
// CLASES - CRUD
// =============================================

/**
 * Crear una nueva clase en la base de datos
 * Path: classes/${gymId}/${classId}
 */
const createClassInDB = async (gymId, data) => {
    console.log(`REPO: Creando clase para gym ${gymId}`);
    
    const classesRef = db.ref(`classes/${gymId}`);
    const newClassRef = classesRef.push();
    
    const classData = {
        ...data,
        id: newClassRef.key,
        gymId: gymId,
        activa: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    await newClassRef.set(classData);
    console.log(`REPO: Clase creada con ID: ${newClassRef.key}`);
    
    return classData;
};

/**
 * Obtener una clase por su ID
 * Path: classes/${gymId}/${classId}
 */
const getClassByIdFromDB = async (gymId, classId) => {
    console.log(`REPO: Buscando clase ${classId} del gym ${gymId}`);
    
    const snapshot = await db.ref(`classes/${gymId}/${classId}`).once('value');
    const classData = snapshot.val();
    
    if (classData) {
        console.log(`REPO: Clase encontrada: ${classData.nombre}`);
    } else {
        console.log(`REPO: Clase ${classId} no encontrada`);
    }
    
    return classData;
};

/**
 * Obtener todas las clases de un gimnasio
 * Path: classes/${gymId}
 * @param {string} gymId - ID del gimnasio
 * @param {boolean} onlyActive - Si true, solo retorna clases activas
 */
const getClassesByGymFromDB = async (gymId, onlyActive = true) => {
    console.log(`REPO: Obteniendo clases del gym ${gymId} (onlyActive: ${onlyActive})`);
    
    const snapshot = await db.ref(`classes/${gymId}`).once('value');
    const classesObj = snapshot.val();
    
    if (!classesObj) {
        console.log(`REPO: No hay clases para gym ${gymId}`);
        return [];
    }
    
    // Convertir objeto a array
    let classesArray = Object.values(classesObj);
    
    // Filtrar por activas si es necesario
    if (onlyActive) {
        classesArray = classesArray.filter(clase => clase.activa === true);
    }
    
    console.log(`REPO: Encontradas ${classesArray.length} clases`);
    return classesArray;
};

/**
 * Actualizar una clase existente
 * Path: classes/${gymId}/${classId}
 */
const updateClassInDB = async (gymId, classId, data) => {
    console.log(`REPO: Actualizando clase ${classId} del gym ${gymId}`);
    
    const updateData = {
        ...data,
        updatedAt: Date.now()
    };
    
    await db.ref(`classes/${gymId}/${classId}`).update(updateData);
    
    // Retornar la clase actualizada
    const updatedClass = await getClassByIdFromDB(gymId, classId);
    console.log(`REPO: Clase actualizada`);
    
    return updatedClass;
};

/**
 * Soft delete de una clase (marca como inactiva)
 * Path: classes/${gymId}/${classId}
 */
const softDeleteClassInDB = async (gymId, classId) => {
    console.log(`REPO: Archivando clase ${classId} del gym ${gymId}`);
    
    await db.ref(`classes/${gymId}/${classId}`).update({
        activa: false,
        archivedAt: Date.now(),
        updatedAt: Date.now()
    });
    
    console.log(`REPO: Clase archivada correctamente`);
    return { success: true };
};

// =============================================
// CATEGORÍAS
// =============================================

/**
 * Obtener categorías globales predefinidas
 * Path: globalCategories
 */
const getGlobalCategoriesFromDB = async () => {
    console.log(`REPO: Obteniendo categorías globales`);
    
    const snapshot = await db.ref('globalCategories').once('value');
    const categoriesObj = snapshot.val();
    
    if (!categoriesObj) {
        // Retornar categorías por defecto si no existen
        return [
            { id: 'yoga', name: 'Yoga', description: 'Clases de yoga y meditación', isGlobal: true },
            { id: 'crossfit', name: 'CrossFit', description: 'Entrenamiento funcional de alta intensidad', isGlobal: true },
            { id: 'spinning', name: 'Spinning', description: 'Ciclismo indoor', isGlobal: true },
            { id: 'funcional', name: 'Funcional', description: 'Entrenamiento funcional', isGlobal: true },
            { id: 'musculacion', name: 'Musculación', description: 'Entrenamiento con pesas', isGlobal: true },
            { id: 'pilates', name: 'Pilates', description: 'Pilates y control corporal', isGlobal: true },
            { id: 'zumba', name: 'Zumba', description: 'Baile fitness', isGlobal: true },
            { id: 'boxeo', name: 'Boxeo', description: 'Boxeo y artes marciales', isGlobal: true }
        ];
    }
    
    return Object.values(categoriesObj).map(cat => ({ ...cat, isGlobal: true }));
};

/**
 * Obtener categorías personalizadas de un gimnasio
 * Path: classCategories/${gymId}
 */
const getGymCategoriesFromDB = async (gymId) => {
    console.log(`REPO: Obteniendo categorías del gym ${gymId}`);
    
    const snapshot = await db.ref(`classCategories/${gymId}`).once('value');
    const categoriesObj = snapshot.val();
    
    if (!categoriesObj) {
        return [];
    }
    
    return Object.values(categoriesObj).map(cat => ({ ...cat, isGlobal: false }));
};

/**
 * Crear una categoría personalizada para un gimnasio
 * Path: classCategories/${gymId}/${categoryId}
 */
const createCategoryInDB = async (gymId, data) => {
    console.log(`REPO: Creando categoría para gym ${gymId}`);
    
    const categoriesRef = db.ref(`classCategories/${gymId}`);
    const newCategoryRef = categoriesRef.push();
    
    const categoryData = {
        ...data,
        id: newCategoryRef.key,
        gymId: gymId,
        isGlobal: false,
        createdAt: Date.now()
    };
    
    await newCategoryRef.set(categoryData);
    console.log(`REPO: Categoría creada con ID: ${newCategoryRef.key}`);
    
    return categoryData;
};

// =============================================
// LISTA DE ESPERA (WAITLIST)
// =============================================

/**
 * Obtener la lista de espera de una clase
 * Path: classWaitlist/${classId}
 */
const getWaitlistFromDB = async (classId) => {
    console.log(`REPO: Obteniendo lista de espera de clase ${classId}`);
    
    const snapshot = await db.ref(`classWaitlist/${classId}`).once('value');
    const waitlistObj = snapshot.val();
    
    if (!waitlistObj) {
        return [];
    }
    
    // Convertir a array con userId y timestamp
    const waitlistArray = Object.entries(waitlistObj).map(([userId, data]) => ({
        userId,
        addedAt: data.addedAt || data
    }));
    
    // Ordenar por fecha de agregado (más antiguos primero)
    waitlistArray.sort((a, b) => a.addedAt - b.addedAt);
    
    console.log(`REPO: ${waitlistArray.length} usuarios en lista de espera`);
    return waitlistArray;
};

/**
 * Agregar usuario a la lista de espera
 * Path: classWaitlist/${classId}/${userId}
 */
const addToWaitlistInDB = async (classId, userId) => {
    console.log(`REPO: Agregando usuario ${userId} a lista de espera de clase ${classId}`);
    
    const waitlistData = {
        addedAt: Date.now()
    };
    
    await db.ref(`classWaitlist/${classId}/${userId}`).set(waitlistData);
    console.log(`REPO: Usuario agregado a lista de espera`);
    
    return { userId, ...waitlistData };
};

/**
 * Remover usuario de la lista de espera
 * Path: classWaitlist/${classId}/${userId}
 */
const removeFromWaitlistInDB = async (classId, userId) => {
    console.log(`REPO: Removiendo usuario ${userId} de lista de espera de clase ${classId}`);
    
    await db.ref(`classWaitlist/${classId}/${userId}`).remove();
    console.log(`REPO: Usuario removido de lista de espera`);
    
    return { success: true };
};

/**
 * Verificar si un usuario está en la lista de espera
 * Path: classWaitlist/${classId}/${userId}
 */
const isUserInWaitlistFromDB = async (classId, userId) => {
    console.log(`REPO: Verificando si usuario ${userId} está en lista de espera de clase ${classId}`);
    
    const snapshot = await db.ref(`classWaitlist/${classId}/${userId}`).once('value');
    const exists = snapshot.exists();
    
    console.log(`REPO: Usuario ${exists ? 'está' : 'no está'} en lista de espera`);
    return exists;
};

module.exports = {
    // Clases
    createClassInDB,
    getClassByIdFromDB,
    getClassesByGymFromDB,
    updateClassInDB,
    softDeleteClassInDB,
    // Categorías
    getGlobalCategoriesFromDB,
    getGymCategoriesFromDB,
    createCategoryInDB,
    // Waitlist
    getWaitlistFromDB,
    addToWaitlistInDB,
    removeFromWaitlistInDB,
    isUserInWaitlistFromDB
};
