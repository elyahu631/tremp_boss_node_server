"use strict";
//  src/middleware/handleErrors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
const handleErrors = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    console.log('====================================');
    console.log(message);
    console.log('====================================');
    res.status(status).send({
        status,
        message,
    });
};
exports.handleErrors = handleErrors;
//# sourceMappingURL=handleErrors.js.map