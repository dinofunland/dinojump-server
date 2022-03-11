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
import { RemoveAllPlatformsCommand } from './removeAllPlatforms.command'
import { SpawnPlatformCommand } from './spawnPlatform.command'

interface ResetGamePayload {}

export class ResetGameCommand extends Command<GameRoom, ResetGamePayload> {
  execute(payload: ResetGamePayload) {
    logger('Reset Game', 'Command')
    this.room.dispatcher.dispatch(new RemoveAllPlatformsCommand())
    // TODO: RESET GAME world
    this.state.players.forEach((value) => {
      value.isReady = false
      Matter.Body.set(value.body, 'position', { x: 0, y: -10 })
    })
    this.state.floor.position.y = -20
    this.state.gameStep = GameStep.LOBBY
    this.room.unlock()
  }
}
