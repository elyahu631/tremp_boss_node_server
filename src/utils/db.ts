// utiles/db.ts
import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI, DB_NAME } from '../config/environment';
import { Model } from '../config/models';

class DB {
  private static instance: DB;
  private client: MongoClient;
  private dbName: string;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new MongoClient(DB_URI);
    this.dbName = DB_NAME;
    this.connect();
  }



  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  private async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
      } catch (error) {
        console.error(error);
        process.exit(1); // Terminate the process if the connection fails
      }
    }
  }

  async FindAll(collection: string, query = {}, projection = {}, sort = {}) {
    try {
      return await this.client.db(this.dbName).collection(collection).find(query, { projection }).sort(sort).toArray();
    } catch (error) {
      throw error;
    }
  }

  async FindOne(collection: string, query = {}, projection = {}) {
    try {
      return await this.client.db(this.dbName).collection(collection).findOne(query, { projection });
    } catch (error) {
      throw error;
    }
  }

  async FindByID(collection: string, id: string, projection = {}) {
    try {
      return await this.client.db(this.dbName).collection(collection).findOne({ _id: new ObjectId(id) }, projection);
    } catch (error) {
      throw error;
    }
  }

  async DeleteById(collection: string, id: string) {
    try {
      return await this.client.db(this.dbName).collection(collection).deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw error;
    }
  }

  async Insert(collection: string, doc: Model) {
    try {
      return await this.client.db(this.dbName).collection(collection).insertOne(doc);
    } catch (error) {
      return error;
    }
  }

  async InsertMany(collection: string, docs: Model[]) {
    try {
      return await this.client.db(this.dbName).collection(collection).insertMany(docs);
    } catch (error) {
      console.error("Error inserting multiple documents into the database:", error);
      throw error;
    }
  }

  async Update(collection: string, id: string, updatedDocument: Partial<Model>) {
    try {
      const result = await this.client.db(this.dbName).collection(collection).updateOne({ _id: new ObjectId(id) }, { $set: updatedDocument });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async UpdateWithOperation(collection: string, id: string, updateOperation: object) {
    try {
      const result = await this.client.db(this.dbName).collection(collection).updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
      console.log(result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async aggregate(collection: string, pipeline = [{}]) {
    try {
      return await this.client.db(this.dbName).collection(collection).aggregate(pipeline).toArray();
    } catch (error) {
      throw error;
    }
  }

  async Count(collection: string, query = {}): Promise<number> {
    try {
      return await this.client.db(this.dbName).collection(collection).countDocuments(query);
    } catch (error) {
      throw error;
    }
  }

}

const db = DB.getInstance();
export default db;
