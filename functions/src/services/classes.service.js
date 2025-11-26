// functions/src/services/classes.service.js
// Hub de exportaciones para todos los servicios de clases

// CRUD
const { createClass } = require('./classes/createClass.service');
const { getClassesByGym, getClassById, getClassStats } = require('./classes/readClass.service');
const { updateClass, toggleClassStatus, updateClassImage } = require('./classes/updateClass.service');
const { deleteClass } = require('./classes/deleteClass.service');

// Schedule
const { getClassSchedule, updateClassSchedule } = require('./classes/scheduleClass.service');

// Categories
const { getCategories, createCategory } = require('./classes/categoryClass.service');

// Waitlist
const { getWaitlist, addToWaitlist, removeFromWaitlist } = require('./classes/waitlistClass.service');

module.exports = {
    // CRUD de clases
    createClass,
    getClassesByGym,
    getClassById,
    getClassStats,
    updateClass,
    toggleClassStatus,
    updateClassImage,
    deleteClass,
    
    // Horarios
    getClassSchedule,
    updateClassSchedule,
    
    // Categorías
    getCategories,
    createCategory,
    
    // Lista de espera
    getWaitlist,
    addToWaitlist,
    removeFromWaitlist
};
