import 'dotenv/config'
import { RedisPresence, Server } from 'colyseus'
import { createServer } from 'http'
import { monitor } from '@colyseus/monitor'
import express from 'express'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { GameRoom } from './game/game.room'
import logger from './services/logger.services'
import * as admin from 'firebase-admin'
import config from './config'
import basicAuth from 'express-basic-auth'
import { RedisDriver } from '@colyseus/redis-driver'

const bootstrap = async () => {
  const port = config.port
  const firebaseAdminConfig: admin.ServiceAccount = {
    projectId: config.firebase.projectId,
    privateKey: config.firebase.privateKey,
    clientEmail: config.firebase.clientEmail,
  }

  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
  })

  const app = express()
  const basicAuthMiddleware = basicAuth({
    users: {
      admin: config.auth.adminPassword,
    },
    challenge: true,
  })

  app.use('/colyseus', basicAuthMiddleware, monitor())
  app.get('/', function (req, res) {
    res.send('200 OK - Dino Fun Land')
  })
  const redisOptions = {
    url: process.env.REDIS_URL,
    port: process.env.REDISPORT,
    host: process.env.REDISHOST,
    username: process.env.REDISUSER,
    password: process.env.REDISPASSWORD,
  }
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: createServer(app),
    }),
    presence: new RedisPresence(redisOptions),
    driver: new RedisDriver(redisOptions),
    publicAddress: 'dinojump-server-test.up.railway.app'
  })

  gameServer.define(GameRoom.name, GameRoom)
  logger(`define: ${GameRoom.name}`, 'Server')

  gameServer.listen(port)
  logger(`Listening on Port: ${port}`, 'Server')
}

bootstrap()
