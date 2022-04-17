import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep } from '../game.state'
import { RemoveAllPlatformsCommand } from './removeAllPlatforms.command'
import { ResetPlayersCommand } from './resetPlayers.command'

interface StartGamePayload {}

export class StartGameCommand extends Command<GameRoom, StartGamePayload> {
  execute(payload: StartGamePayload) {
    logger('Start Game', 'Command')
    if (this.state.gameStep != GameStep.LOBBY) return
    this.room.lock()
    this.state.gameStep = GameStep.STARTING
    this.room.dispatcher.dispatch(new ResetPlayersCommand())
    this.room.dispatcher.dispatch(new RemoveAllPlatformsCommand())

    this.clock.setTimeout(() => {
      this.state.gameStep = GameStep.ONGOING
    }, 3_000)
  }
}
