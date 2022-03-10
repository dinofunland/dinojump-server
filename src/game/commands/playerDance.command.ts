import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { PlayerAnimation } from '../game.state'

interface PlayerDancePayload {
  sessionId: string
}

export class PlayerDanceCommand extends Command<GameRoom, PlayerDancePayload> {
  execute(payload: PlayerDancePayload) {
    logger('Player Dance', 'Command')
    const player = this.state.players.get(payload.sessionId)
    if (player) {
      player.animation = PlayerAnimation.DANCE
    }
  }
}
