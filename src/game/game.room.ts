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
import { EndGameCommand } from './commands/endGame.command'
import { RemovePlatformCommand } from './commands/removePlatform'
import Matter from 'matter-js'

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
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1 / 120)

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

    this.onMessage<number>('inputHorizontal', (client, message: number) => {
      if (typeof message != 'number') return

      this.dispatcher.dispatch(new PlayerMoveCommand(), {
        sessionId: client.sessionId,
        horizontal: message,
      })
    })

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

    this.onMessage<{
      skin: number
    }>('selectSkin', (client, message) => {
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

    this.onMessage<number>('emote', (client, message) => {
      this.broadcast('emote', {
        sessionId: client.sessionId,
        emoteType: message,
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
    this.dispatcher.dispatch(new OnLeaveCommand(), {
      sessionId: client.sessionId,
    })
    logger(
      `onLeave Client with sessionId: ${client.sessionId} consented: ${consented}`,
      'GameRoom',
    )
  }

  onDispose() {
    this.dispatcher.stop()
    this.gameWorld.destory()
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId)
    logger(`onDispose ${this.roomName} ${this.roomId}`, 'GameRoom')
  }

  update(deltaTime: number) {
    const hasGameEnded = this.state.gameStep == GameStep.ENDED
    if (!hasGameEnded) {
      Matter.Engine.update(this.gameWorld.engine, deltaTime)
    }
    this.state.sync()
    this.state.update(deltaTime)

    const maxDistanceToLastPlatform = 200
    const isGameOngoing = this.state.gameStep == GameStep.ONGOING

    if (isGameOngoing) {
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

    if (isGameOngoing) {
      // kill any player which is below lava
      this.state.players.forEach((player) => {
        if (player.position.y < this.state.floor.position.y) {
          player.isDead = true
        }
      })

      // end game if any player is dead
      for (let [key, player] of this.state.players.entries()) {
        if (player.isDead) {
          this.dispatcher.dispatch(new EndGameCommand())
          break
        }
      }

      this.state.platforms.forEach((platform, key) => {
        if (platform.position.y < this.state.floor.position.y - 5) {
          this.dispatcher.dispatch(new RemovePlatformCommand(), {
            id: key,
          })
        }
      })
    }
  }
}
