import http from 'http'
import { Room, Client } from 'colyseus'
import logger from '../services/logger.services'
import { GameSchema, GameStep, PlayerSkin } from './game.state'
import { Dispatcher } from '@colyseus/command'
import { OnJoinCommand } from './commands/onJoin.command'
import { OnLeaveCommand } from './commands/onLeave.command'
import { PlayerReadyCommand } from './commands/playerReady.command'
import { PlayerNotReadyCommand } from './commands/playerNotReady.command'
import { PlayerMoveCommand } from './commands/playerMove.command'
import { useGameWorld } from './game.world'
import { PlayerJumpCommand } from './commands/playerJump.command'
import { PlayerSetSkinCommand } from './commands/playerSetSkin.command'
import { PlayerDanceCommand } from './commands/playerDance.command'
import { ResetGameCommand } from './commands/resetGame.command'
import { SpawnPlatformCommand } from './commands/spawnPlatform.command'

const LETTERS = '12345890ASDF'

export class GameRoom extends Room<GameSchema> {
  LOBBY_CHANNEL = '$mylobby'

  public dispatcher: Dispatcher<GameRoom> = new Dispatcher(this)

  public gameWorld: useGameWorld

  generateRoomIdSingle(): string {
    let result = ''
    for (var i = 0; i < 4; i++) {
      result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length))
    }
    return result
  }

  async generateRoomId(): Promise<string> {
    const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL)
    let id
    do {
      id = this.generateRoomIdSingle()
    } while (currentIds.includes(id))

    await this.presence.sadd(this.LOBBY_CHANNEL, id)
    return id
  }

  async onCreate(options: any) {
    logger(`onCreate`, 'GameRoom')

    this.roomId = await this.generateRoomId()

    this.setState(new GameSchema())

    this.gameWorld = useGameWorld(this.state)
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))

    this.dispatcher.dispatch(new ResetGameCommand())

    logger(`onCreate ${this.roomName} ${this.roomId}`, 'GameRoom')

    this.onMessage('ready', (client) => {
      this.dispatcher.dispatch(new PlayerReadyCommand(), {
        sessionId: client.sessionId,
      })
    })

    this.onMessage('notReady', (client) => {
      this.dispatcher.dispatch(new PlayerNotReadyCommand(), {
        sessionId: client.sessionId,
      })
    })

    this.onMessage(
      'move',
      (client, message: { left: boolean; right: boolean }) => {
        this.dispatcher.dispatch(new PlayerMoveCommand(), {
          sessionId: client.sessionId,
          left: message.left,
          right: message.right,
        })
      },
    )

    this.onMessage('jump', (client, message) => {
      this.dispatcher.dispatch(new PlayerJumpCommand(), {
        sessionId: client.sessionId,
      })
    })

    this.onMessage('dance', (client, message) => {
      this.dispatcher.dispatch(new PlayerDanceCommand(), {
        sessionId: client.sessionId,
      })
    })

    this.onMessage('selectSkin', (client, message) => {
      const hasSkinValue =
        message?.skin != undefined &&
        Object.values(PlayerSkin).includes(message?.skin) &&
        typeof message?.skin == 'number'
          ? true
          : false
      if (!hasSkinValue) return
      this.dispatcher.dispatch(new PlayerSetSkinCommand(), {
        sessionId: client.sessionId,
        skin: message.skin,
      })
    })

    this.onMessage('*', (client, type, message) => {
      logger(
        `onMessage Client: ${client.sessionId} sent ${type} ${JSON.stringify(
          message,
        )}`,
        'GameRoom',
      )
    })
  }

  onAuth(client: Client, options: any, request: http.IncomingMessage) {
    logger(
      `onAuth Client: ${client.sessionId} with options: ${JSON.stringify(
        options,
      )}`,
      'GameRoom',
    )
    return true
  }

  onJoin(client: Client, options: any, auth: any) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      sessionId: client.sessionId,
      username: options.name,
    })
    logger(`onJoin Client: ${client.sessionId}`, 'GameRoom')
  }

  onLeave(client: Client, consented: boolean) {
    if (consented) {
      this.dispatcher.dispatch(new OnLeaveCommand(), {
        sessionId: client.sessionId,
      })
    }
    logger(
      `onLeave Client with sessionId: ${client.sessionId} consented: ${consented}`,
      'GameRoom',
    )
  }

  onDispose() {
    this.dispatcher.stop()
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId)
    logger(`onDispose ${this.roomName} ${this.roomId}`, 'GameRoom')
  }

  update(deltaTime: number) {
    this.state.sync()
    this.state.update(deltaTime)

    const maxDistanceToLastPlatform = 200

    if (
      this.state.gameStep != GameStep.STARTING &&
      this.state.gameStep != GameStep.ENDED
    ) {
      const highestPlatform = this.state.getHighestPlatform()
      const highestPlayer = this.state.getHighestPlayer()
      if (highestPlayer) {
        if (!highestPlatform) {
          this.dispatcher.dispatch(new SpawnPlatformCommand())
        } else {
          const distanceToHighestPlatform =
            highestPlayer.body.position.y - highestPlatform.body.position.y
          if (distanceToHighestPlatform < maxDistanceToLastPlatform) {
            this.dispatcher.dispatch(new SpawnPlatformCommand())
          }
        }
      }
    }
  }
}
