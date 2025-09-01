
import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI (to be replaced with actual connection string from environment variables)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Create a MongoClient with appropriate options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbConnection: any = null;

export async function connectToDatabase() {
  if (dbConnection) return dbConnection;
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    
    // Get the database name from env or use default
    const dbName = process.env.MONGODB_DB_NAME || "lyricsapp";
    dbConnection = client.db(dbName);
    
    console.log("Successfully connected to MongoDB");
    return dbConnection;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (client) {
    await client.close();
    dbConnection = null;
    console.log("Disconnected from MongoDB");
  }
}

export const getCollection = async (collectionName: string) => {
  const db = await connectToDatabase();
  return db.collection(collectionName);
};
