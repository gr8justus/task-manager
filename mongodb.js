'use strict';

// Module
import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'task-manager';

async function main() {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('users')
    try {
        const add = collection.insertOne({
            name: 'Oluwatobi',
            age: 27
        })
        return add;
    } catch(e) {
        return e;
    }
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());