import { Command } from '@colyseus/command'
import Matter from 'matter-js'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep } from '../game.state'
import { EndGameCommand } from './endGame.command'
import { ResetPlayersCommand } from './resetPlayers.command'

interface StartGamePayload {}

export class StartGameCommand extends Command<GameRoom, StartGamePayload> {
  execute(payload: StartGamePayload) {
    logger('Start Game', 'Command')
    if (this.state.gameStep != GameStep.LOBBY) return
    this.room.lock()
    this.state.gameStep = GameStep.STARTING
    this.room.dispatcher.dispatch(new ResetPlayersCommand())

    this.clock.setTimeout(() => {
      this.state.gameStep = GameStep.ONGOING
    }, 5_000)
  }
}
