"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/db.ts
const mongodb_1 = require("mongodb");
const environment_1 = require("../config/environment");
class DB {
    constructor() {
        this.client = new mongodb_1.MongoClient(environment_1.DB_URI);
        this.dbName = environment_1.DB_NAME;
        this.connect();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
            }
            catch (error) {
                console.error(error);
                process.exit(1); // terminate the process if the connection fails
            }
        });
    }
    FindAll(collection, query = {}, projection = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                return yield this.client.db(this.dbName).collection(collection).find(query, { projection }).toArray();
            }
            catch (error) {
                console.error(error);
            }
            finally {
                yield this.client.close();
            }
        });
    }
    FindByID(collection, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                return yield this.client.db(this.dbName).collection(collection).findOne({ _id: new mongodb_1.ObjectId(id) });
            }
            catch (error) {
                return error;
            }
            finally {
                yield this.client.close();
            }
        });
    }
    DeleteById(collection, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                return yield this.client.db(this.dbName).collection(collection).deleteOne({ _id: new mongodb_1.ObjectId(id) });
            }
            catch (error) {
                return error;
            }
            finally {
                yield this.client.close();
            }
        });
    }
    Insert(collection, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                return yield this.client.db(this.dbName).collection(collection).insertOne(doc);
            }
            catch (error) {
                return error;
            }
            finally {
                yield this.client.close();
            }
        });
    }
    Update(collection, id, updatedDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                const result = yield this.client.db(this.dbName).collection(collection).updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updatedDocument });
                return result;
            }
            catch (error) {
                return error;
            }
            finally {
                yield this.client.close();
            }
        });
    }
    UpdateWithOperation(collection, id, updateOperation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                const result = yield this.client.db(this.dbName).collection(collection).updateOne({ _id: new mongodb_1.ObjectId(id) }, updateOperation);
                console.log(result);
                return result;
            }
            catch (error) {
                return error;
            }
            finally {
                yield this.client.close();
            }
        });
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map