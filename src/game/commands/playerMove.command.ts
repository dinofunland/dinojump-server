import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'

interface PlayerMovePayload {
  horizontal: number
  sessionId: string
}

export class PlayerMoveCommand extends Command<GameRoom, PlayerMovePayload> {
  execute(payload: PlayerMovePayload) {
    logger('Player Move', 'Command')
    const player = this.state.players.get(payload.sessionId)
    player.input.horizontal = payload.horizontal
  }
}
