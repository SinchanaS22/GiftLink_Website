// db.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

const dbName = "giftdb";
let dbInstance = null;


async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };

    const client = new MongoClient(url);      

    // Task 1: Connect to MongoDB
    await client.connect();
    // {{insert code}}

    // Task 2: Connect to database giftDB and store in variable dbInstance
    dbInstance=client.db(dbName);
    //{{insert code}}

    // Task 3: Return database instance
    return dbInstance;
    // {{insert code}}
}

export default connectToDatabase;
