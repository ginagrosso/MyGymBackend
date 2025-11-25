
const { 
    httpStatusCodes, 
    DataValidationError, 
    DatabaseError, 
    AuthorizationError, 
    ResourceNotFoundError 
} = require('./httpStatusCodes');

function getSuccessResponseObject(data, message = 'Operación exitosa') {
    return {
        success: true,
        message: message,
        data: data
    };
}

function getErrorResponseObject(error) {
    const response = {
        success: false,
        message: error.message || 'Error interno del servidor'
    };

    console.error('[ERROR]', error);

    if (error instanceof AuthorizationError) {
        response.statusCode = httpStatusCodes.unauthorized;
    } else if (error instanceof DataValidationError) {
        response.statusCode = httpStatusCodes.badRequest;
    } else if (error instanceof DatabaseError) {
        response.statusCode = httpStatusCodes.internalServerError;
    } else if (error instanceof ResourceNotFoundError) {
        response.statusCode = httpStatusCodes.notFound;
    } else {
        response.statusCode = httpStatusCodes.internalServerError;
    }

    return response;
}

module.exports = {
    getSuccessResponseObject,
    getErrorResponseObject
};