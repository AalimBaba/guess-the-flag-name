import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim()
  if (!uri) {
    throw new Error('MONGO_URI is required; the server will not start without a persistent database')
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB || 'guess_flags',
  })
  console.log('MongoDB connected')
}
