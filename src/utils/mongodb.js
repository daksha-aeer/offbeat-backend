// src/utils/mongodb.js
import { MongoClient } from 'mongodb';

let client;
let clientPromise;

const uri = process.env.MONGODB_URI; // Store MongoDB URI in .env file
const options = {};

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (!client) {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
