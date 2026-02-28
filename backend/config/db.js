import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

export const connectDB = async () => {
  let uri = process.env.MONGO_URI
  try {
    if (!uri) {
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
    }
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || 'guess_flags',
    })
    console.log('MongoDB connected')
  } catch (err) {
    try {
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
      await mongoose.connect(uri, {
        dbName: process.env.MONGO_DB || 'guess_flags',
      })
      console.log('MongoDB connected (memory)')
    } catch (e) {
      console.error('MongoDB connection error', e)
      process.exit(1)
    }
  }
}
