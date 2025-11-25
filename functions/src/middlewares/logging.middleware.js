function loggingMiddleware(req, res, next) {
    const metodo = req.method;
    const url = req.url;
    const fecha = new Date().toISOString();
    
    console.log(`[${fecha}] ${metodo} ${url}`);
    
    next();
}

module.exports = loggingMiddleware;