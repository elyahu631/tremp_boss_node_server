"use strict";
// src/middleware/jsonErrorHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonErrorHandler = void 0;
const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).send({ status: false, error: { message: 'Invalid JSON', statusCode: 400 } });
    }
    next(err);
};
exports.jsonErrorHandler = jsonErrorHandler;
//# sourceMappingURL=jsonErrorHandler.js.map