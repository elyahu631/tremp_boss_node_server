"use strict";
//  src/middleware/handleErrors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
const handleErrors = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.status(status).send({
        status: false,
        error: {
            message,
            statusCode: status
        }
    });
};
exports.handleErrors = handleErrors;
//# sourceMappingURL=handleErrors.js.map