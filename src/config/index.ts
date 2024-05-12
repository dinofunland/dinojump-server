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
}
