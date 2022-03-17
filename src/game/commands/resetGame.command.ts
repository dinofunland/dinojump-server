import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep } from '../game.state'
import { RemoveAllPlatformsCommand } from './removeAllPlatforms.command'
import { ResetPlayersCommand } from './resetPlayers.command'

interface ResetGamePayload {}

export class ResetGameCommand extends Command<GameRoom, ResetGamePayload> {
  execute(payload: ResetGamePayload) {
    logger('Reset Game', 'Command')
    this.room.dispatcher.dispatch(new RemoveAllPlatformsCommand())
    this.room.dispatcher.dispatch(new ResetPlayersCommand())
    this.state.floor.position.y = -20
    this.state.score = 0
    this.state.gameStep = GameStep.LOBBY
    this.room.gameWorld.runner.enabled = true
    this.room.unlock()
  }
}
