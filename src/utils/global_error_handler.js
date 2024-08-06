const AppError = require("../utils/app_error");
const HttpStatusCodes = require("./http_status_codes");

const sentErrorDev = (err, req, res, statusCode, status) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stackTrace: err.stack
    });
}

const sentErrorProd = (err, req, res, statusCode, status) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('Error', err);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
}

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    const status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sentErrorDev(err, req, res, statusCode, status);
    } else if(process.env.NODE_ENV === 'production'){
        sentErrorProd(err, req, res, statusCode, status);
    } else{
        res.status(statusCode).json({
            status: status,
            message: err.message
        });
    }
}

module.exports = globalErrorHandler