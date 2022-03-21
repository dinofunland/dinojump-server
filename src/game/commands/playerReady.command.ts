import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep, PlayerSchema } from '../game.state'
import { IsEveryPlayerReadyCommand } from './isEveryPlayerReady.command'

interface PlayerReadyPayload {
  sessionId: string
}
export class PlayerReadyCommand extends Command<GameRoom, PlayerReadyPayload> {
  execute(payload: PlayerReadyPayload) {
    logger('Player Ready', 'Command')
    if (this.state.gameStep != GameStep.LOBBY) return
    const player = this.state.players.get(payload.sessionId)
    if (!player) return
    player.isReady = true

    this.room.dispatcher.dispatch(new IsEveryPlayerReadyCommand())
  }
}
