import { Command } from '@colyseus/command'
import Matter from 'matter-js'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep } from '../game.state'

interface RemoveAllPlatformsPayload {}

export class RemoveAllPlatformsCommand extends Command<
  GameRoom,
  RemoveAllPlatformsPayload
> {
  execute(payload: RemoveAllPlatformsPayload) {
    logger('Remove All Platforms', 'Command')
    this.state.platforms.forEach((value, key) => {
      this.room.gameWorld.removeBody(value.body)
      this.state.platforms.delete(key)
    })
  }
}
