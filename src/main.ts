import 'dotenv/config'
import { Server } from 'colyseus'
import { createServer } from 'http'
import { monitor } from '@colyseus/monitor'
import { playground } from "@colyseus/playground";
import express from 'express'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { GameRoom } from './game/game.room'
import logger from './services/logger.services'
import * as admin from 'firebase-admin'
import config from './config'
import basicAuth from 'express-basic-auth'

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
  app.use("/playground", basicAuthMiddleware, playground);
  app.get('/', function (req, res) {
    logger(`Health Check from ${req.ip}`)
    res.send('200 OK - Dino Fun Land')
  })
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: createServer(app),
    }),
  })

  gameServer.define(GameRoom.name, GameRoom)
  logger(`define: ${GameRoom.name}`)

  gameServer.listen(port)
  logger(`Listening on Port: ${port}`)
}

bootstrap()
