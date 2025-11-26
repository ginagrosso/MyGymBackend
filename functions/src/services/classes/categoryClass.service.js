// functions/src/services/classes/categoryClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { createCategorySchema } = require('../../schemas/class.schema');
const { DataValidationError } = require('../../utils/httpStatusCodes');

/**
 * Obtener todas las categorías disponibles
 * Combina categorías globales + categorías personalizadas del gym
 * @param {string} gymId - ID del gimnasio (opcional, para incluir personalizadas)
 * @returns {array} Array de categorías
 */
const getCategories = async (gymId = null) => {
    console.log(`SERVICIO: Obteniendo categorías${gymId ? ` para gym ${gymId}` : ' globales'}`);
    
    // Obtener categorías globales
    const globalCategories = await classesRepository.getGlobalCategoriesFromDB();
    
    // Si hay gymId, también obtener las personalizadas
    let gymCategories = [];
    if (gymId) {
        gymCategories = await classesRepository.getGymCategoriesFromDB(gymId);
    }
    
    // Combinar ambas listas
    const allCategories = [...globalCategories, ...gymCategories];
    
    console.log(`SERVICIO: ${allCategories.length} categorías encontradas (${globalCategories.length} globales, ${gymCategories.length} del gym)`);
    
    return allCategories;
};

/**
 * Crear una categoría personalizada para un gimnasio
 * @param {string} gymId - ID del gimnasio
 * @param {object} data - Datos de la categoría { name, description }
 * @returns {object} Categoría creada
 */
const createCategory = async (gymId, data) => {
    console.log(`SERVICIO: Creando categoría para gym ${gymId}`);
    
    // 1. Validar datos
    const { error, value } = createCategorySchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Crear la categoría
    const nuevaCategoria = await classesRepository.createCategoryInDB(gymId, value);
    
    console.log(`SERVICIO: Categoría "${nuevaCategoria.name}" creada exitosamente`);
    
    return nuevaCategoria;
};

module.exports = {
    getCategories,
    createCategory
};

