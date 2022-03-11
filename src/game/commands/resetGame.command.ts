import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep } from '../game.state'

interface ResetGamePayload {}

export class ResetGameCommand extends Command<GameRoom, ResetGamePayload> {
  execute(payload: ResetGamePayload) {
    logger('Reset Game', 'Command')
    // TODO: RESET GAME world
    this.state.players.forEach((value) => {
      value.isReady = false
      value.body.position.x = 0
      value.body.position.y = -10
    })
    this.state.gameStep = GameStep.LOBBY
    this.room.unlock()
  }
}
