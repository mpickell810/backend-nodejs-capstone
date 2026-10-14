// secondChance-backend/models/db.js
require('dotenv').config()
const { MongoClient } = require('mongodb')

const url = process.env.MONGO_URL
if (!url) {
  throw new Error('MONGO_URL is not set in environment (.env)')
}

let dbInstance = null
const dbName = 'secondChance'

async function connectToDatabase () {
  if (dbInstance) {
    return dbInstance
  }

  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  dbInstance = client.db(dbName)
  return dbInstance
}

module.exports = connectToDatabase
