import 'dotenv/config'
import { Server } from 'colyseus'
import { createServer } from 'http'
import { monitor } from '@colyseus/monitor'
import express from 'express'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { GameRoom } from './game/game.room'
import logger from './services/logger.services'
import * as admin from 'firebase-admin';
import config from './config'

const bootstrap = async () => {
  const port = config.port
  const firebaseAdminConfig: admin.ServiceAccount= {
    projectId: config.firebase.projectId,
    privateKey: config.firebase.privateKey,
    clientEmail: config.firebase.clientEmail
  }

  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
  })

  const app = express()
  app.use('/colyseus', monitor())
  app.get('/', function (req, res) {
    res.send('200 OK - Dino Fun Land')
  })

  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: createServer(app),
    }),
  })

  gameServer.define(GameRoom.name, GameRoom)
  logger(`define: ${GameRoom.name}`, 'Server')

  gameServer.listen(port)
  logger(`Listening on Port: ${port}`, 'Server')
}

bootstrap()
