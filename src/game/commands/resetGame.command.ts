import { Command } from '@colyseus/command'
import Matter from 'matter-js'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import {
  GameStep,
  PlatformSchema,
  PositionSchema,
  SizeSchema,
} from '../game.state'

interface ResetGamePayload {}

const getRndInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min
}

export class ResetGameCommand extends Command<GameRoom, ResetGamePayload> {
  execute(payload: ResetGamePayload) {
    logger('Reset Game', 'Command')
    this.state.platforms.forEach((value, key) => {
      this.state.platforms.delete(key)
    })
    // TODO: RESET GAME world
    this.state.players.forEach((value) => {
      value.isReady = false
      Matter.Body.set(value.body, 'position', { x: 0, y: -10 })
    })
    this.state.floor.position.y = -20
    this.state.gameStep = GameStep.LOBBY

    const generatePlatforms = (count: number) => {
      for (let i = 0; i < count; i++) {
        const body = this.room.gameWorld.addPlatform(
          getRndInteger(-60, 100),
          -i * 35 + -30,
          40,
          5,
        )
        this.state.platforms.set(
          `${body.position.x}${body.position.y}`,
          new PlatformSchema().assign({
            position: new PositionSchema().assign({
              x: body.position.x,
              y: body.position.y,
            }),
            size: new SizeSchema().assign({
              width: 40,
              height: 5,
            }),
            body: body,
          }),
        )
      }
    }
    generatePlatforms(5)

    this.room.unlock()
  }
}
