//mongoDB Configuration
const mongoUser = process.env.MONGO_DB_USER || 'root';
const mongoPass = process.env.MONGO_DB_PASS || 'password';
const mongoHost = process.env.MONGO_DB_DB || 'localhost';
const mongoPort = process.env.MONGO_DB_PORT || '6000';

export default () => ({
  mongo: {
    uri: `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}`,
    db: process.env.MONGO_DB_DB || 'noto-bot',
  },
});
