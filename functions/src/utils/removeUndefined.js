const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            const value = obj[key];
            if (value !== undefined && value !== null) {
                cleaned[key] = cleanObject(value);
            }
        }
        return cleaned;
    }
    
    return obj;
};

module.exports = cleanObject;