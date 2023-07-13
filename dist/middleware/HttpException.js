"use strict";
// src/middleware/HttpException.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.HttpException = HttpException;
class BadRequestException extends HttpException {
    constructor(message = "Bad Request") {
        super(400, message);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends HttpException {
    constructor(message = "Unauthorized") {
        super(401, message);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends HttpException {
    constructor(message = "Forbidden") {
        super(403, message);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends HttpException {
    constructor(message = "Not Found") {
        super(404, message);
    }
}
exports.NotFoundException = NotFoundException;
class InternalServerException extends HttpException {
    constructor(message = "Internal Server Error") {
        super(500, message);
    }
}
exports.InternalServerException = InternalServerException;
//# sourceMappingURL=HttpException.js.map