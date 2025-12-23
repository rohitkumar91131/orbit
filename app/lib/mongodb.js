import { MongoClient } from "mongodb"

let uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

// FIX: Agar URI mein khali appName= hai toh use yahan uda do
if (uri.includes("appName=")) {
  uri = uri.split("appName=")[0].replace(/[&?]$/, "");
}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri) 
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise