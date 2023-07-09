// src/utils/db.ts
import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI, DB_NAME } from '../config/environment';
import { Model } from '../config/models'
class DB {
  client: MongoClient;
  dbName: string;

  constructor() {   
    this.client = new MongoClient(DB_URI);
    this.dbName = DB_NAME; 
    this.connect();  
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error(error);
      process.exit(1); // terminate the process if the connection fails
    }
  }

  async FindAll(collection: string, query = {}, projection = {}) {
    try {
      await this.client.connect();
      return await this.client.db(this.dbName).collection(collection).find(query, {projection}).toArray();
    } catch (error) {
      console.error(error);
    } finally {
      await this.client.close();
    }
  }

  async FindByID(collection: string, id: string) {
    try {
      await this.client.connect();
      return await this.client.db(this.dbName).collection(collection).findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return error;
    } finally {
      await this.client.close();
    }
  }

  async DeleteById(collection: string, id: string) {
    try {
      await this.client.connect();
      return await this.client.db(this.dbName).collection(collection).deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      return error;
    } finally {
      await this.client.close();
    }
  }

  async Insert(collection: string, doc: Model) {
    try {
      await this.client.connect();
      return await this.client.db(this.dbName).collection(collection).insertOne(doc);
    } catch (error) {
      return error;
    } finally {
      await this.client.close();
    }
  }

  async Update(collection: string, id: string, updatedDocument: Partial<Model>) {
    try {
      await this.client.connect();
      const result = await this.client.db(this.dbName).collection(collection).updateOne({ _id: new ObjectId(id) }, { $set: updatedDocument });
      return result;
    } catch (error) {
      return error;
    } finally {
      await this.client.close();
    }
  }

  async UpdateWithOperation(collection: string, id: string, updateOperation: object) {
    try {
      await this.client.connect();
      const result = await this.client.db(this.dbName).collection(collection).updateOne(
        { _id: new ObjectId(id) }, 
        updateOperation
      );
      console.log(result);
      return result;
    } catch (error) {
      return error;
    } finally {
      await this.client.close();
    }
  }
  
}

export default DB;
