// functions/src/services/classes/readClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

/**
 * Obtener todas las clases de un gimnasio
 * @param {string} gymId - ID del gimnasio
 * @param {object} filters - Filtros opcionales { active: boolean }
 * @returns {array} Array de clases
 */
const getClassesByGym = async (gymId, filters = {}) => {
    console.log(`SERVICIO: Obteniendo clases del gym ${gymId}`);
    
    // Determinar si filtrar solo activas (por defecto true)
    const onlyActive = filters.active !== 'false' && filters.active !== false;
    
    const clases = await classesRepository.getClassesByGymFromDB(gymId, onlyActive);
    
    console.log(`SERVICIO: ${clases.length} clases encontradas`);
    
    return clases;
};

/**
 * Obtener una clase por su ID
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @returns {object} Datos de la clase
 * @throws {ResourceNotFoundError} Si la clase no existe
 */
const getClassById = async (gymId, classId) => {
    console.log(`SERVICIO: Obteniendo clase ${classId} del gym ${gymId}`);
    
    const clase = await classesRepository.getClassByIdFromDB(gymId, classId);
    
    if (!clase) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    console.log(`SERVICIO: Clase "${clase.nombre}" encontrada`);
    
    return clase;
};

/**
 * Obtener estadísticas de ocupación de una clase
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {object} dateRange - Rango de fechas { startDate, endDate }
 * @returns {object} Estadísticas de la clase
 */
const getClassStats = async (gymId, classId, dateRange = {}) => {
    console.log(`SERVICIO: Obteniendo estadísticas de clase ${classId}`);
    
    // Verificar que la clase existe
    const clase = await getClassById(gymId, classId);
    
    // Por ahora retornamos estadísticas básicas
    // En el futuro se puede integrar con inscripciones reales
    const stats = {
        classId: classId,
        className: clase.nombre,
        cupoMaximo: clase.cupoMaximo,
        activa: clase.activa,
        // Estadísticas placeholder - se pueden expandir con datos reales de inscripciones
        ocupacionPromedio: 0,
        totalInscripciones: 0,
        diasConClases: Object.keys(clase.diasHorarios || {}).length,
        horariosSemanales: Object.values(clase.diasHorarios || {}).flat().length,
        periodo: {
            startDate: dateRange.startDate || null,
            endDate: dateRange.endDate || null
        }
    };
    
    console.log(`SERVICIO: Estadísticas generadas para "${clase.nombre}"`);
    
    return stats;
};

module.exports = {
    getClassesByGym,
    getClassById,
    getClassStats
};
