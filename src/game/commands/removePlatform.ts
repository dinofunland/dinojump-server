import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'

interface RemovePlatformPayload {
  id: string
}

export class RemovePlatformCommand extends Command<
  GameRoom,
  RemovePlatformPayload
> {
  execute(payload: RemovePlatformPayload) {
    logger('Remove Platform', 'Command')
    const platform = this.state.platforms.get(payload.id)
    if (!platform) return console.info('could not find platform')
    this.room.gameWorld.removeBody(platform.body)
    this.state.platforms.delete(payload.id)
  }
}
