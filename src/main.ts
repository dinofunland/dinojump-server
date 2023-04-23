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
  const publicAddress = config.publicAddress
    ? `${config.publicAddress}`
    : undefined

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
    logger(`Health Check from ${req.ip}`)
    res.send('200 OK - Dino Fun Land')
  })
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: createServer(app),
    }),
    presence: config.connect.presence
      ? new RedisPresence(config.redis)
      : undefined,
    driver: config.connect.driver ? new RedisDriver(config.redis) : undefined,
    publicAddress: publicAddress,
  })

  gameServer.define(GameRoom.name, GameRoom)
  logger(`define: ${GameRoom.name}`)

  gameServer.listen(port)
  logger(`Listening on Port: ${port}`)
  logger(`Public address: ${publicAddress}`)
}

bootstrap()
