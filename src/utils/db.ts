import { UserInTremp } from './../resources/tremps/TrempInterfaces';
import { Agenda } from 'agenda';
import { MongoClient, ObjectId } from 'mongodb';
import { DB_URI, DB_NAME } from '../config/environment';
import { Model } from '../config/models';
import { getCurrentTimeInIsrael } from '../services/TimeService';

class DB {
  private static instance: DB;
  private client: MongoClient;
  private dbName: string;
  private isConnected: boolean = false;
  public agenda: Agenda;

  private constructor() {
    this.client = new MongoClient(DB_URI);
    this.dbName = DB_NAME;
    this.connect();

    this.agenda = new Agenda({ mongo: this.client.db(this.dbName) as any });
    this.defineJobs('logTrempDetails', this.logTrempDetails);
    this.agenda.start();
    this.agenda.every('5 minutes', 'logTrempDetails');
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

  public defineJobs(jobName: string, jobFunction: (jobData: any) => Promise<void>) {
    this.agenda.define(jobName, async (job, done) => {
      try {
        await jobFunction(job.attrs.data);
        done();
      } catch (error) {
        done();
      }
    });
  }

  private async logTrempDetails(data: any): Promise<void> {
    try {
      // Fetch tremps which are going to happen in the next 30 mins.
      const currentTime = new Date();
      const thirtyMinsFromNow = new Date(currentTime.getTime() + 30 * 60000);

      const tremps = await db.FindAll('Tremps', {
        tremp_time: {
          $lte: thirtyMinsFromNow,
          $gt: currentTime
        }
      });

      for (const tremp of tremps) {
        let userIdToLog: string;
        let nameToLog: string;

        if (tremp.tremp_type === 'driver') {
          userIdToLog = tremp.creator_id;
          const user = await db.FindOne('Users', { _id: new ObjectId(userIdToLog) }); // assuming your user collection is called 'Users'
          nameToLog = `${user.first_name} ${user.last_name}`;
        } else if (tremp.tremp_type === 'hitchhiker') {
          // Find the user who approved in `users_in_tremp`
          const approvedUser = tremp.users_in_tremp.find((u:UserInTremp) => u.is_approved === 'approved');
          if (approvedUser) {
            userIdToLog = approvedUser.user_id;
            const user = await db.FindOne('Users', { _id: new ObjectId(userIdToLog) });
            nameToLog = `${user.first_name} ${user.last_name}`;
          }
        }

        console.log(`Tremp ID: ${tremp._id}, User ID: ${userIdToLog}, User Name: ${nameToLog}`);
      }

    } catch (error) {
      console.error("Error in logTrempDetails job: ", error);
    }
  }

}


const db = DB.getInstance();
export default db;
