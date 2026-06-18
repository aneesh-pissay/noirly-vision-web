import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Persist connection across Next.js hot reloads in development.
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to your .env.local file."
    );
  }

  return uri;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn?.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoUri();

    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((instance) => instance)
      .catch((error: unknown) => {
        cached.promise = null;

        const message =
          error instanceof Error ? error.message : "Unknown connection error";

        throw new Error(`Failed to connect to MongoDB: ${message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
