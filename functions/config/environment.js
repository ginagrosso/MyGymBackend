let nodeEnv = process.env.NODE_ENV || 'default';

try {
    const functions = require('firebase-functions');
    if(functions.config() && functions.config().environment.node_env) {
        nodeEnv = functions.config().environment.node_env;
    }
} catch (error) {
    console.warn('functions.config() no disponible en este entorno, usando NODE_ENV del sistema o valor por defecto');
}

console.log('nodeEnv:', nodeEnv);

let environmentFile;

switch (nodeEnv) {
    case 'production':
        environmentFile = '.env';
        break;
    case 'development':
        environmentFile = '.env.dev';
        break;
    case 'test':
        environmentFile = '.env.test';
        break;
    default:
        environmentFile = '.env.test';
        break;
}

require('dotenv').config({ path: environmentFile });

module.exports = nodeEnv;
