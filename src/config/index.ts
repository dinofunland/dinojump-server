export default {
  port: Number(process.env.PORT || 3000),
  auth: {
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  },
  firebase: {
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
  },
  connect: {
    presence: process.env.CONNECT_PRESENCE === 'true',
    driver: process.env.CONNECT_DRIVER === 'true',
  },
  redis: {
    url: process.env.REDIS_URL,
    port: process.env.REDISPORT,
    host: process.env.REDISHOST,
    username: process.env.REDISUSER,
    password: process.env.REDISPASSWORD,
  },
  publicAddress: process.env.PUBLIC_ADDRESS,
}
