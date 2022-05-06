import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep, PlayerSchema } from '../game.state'
import { ResetGameCommand } from './resetGame.command'
import * as admin from 'firebase-admin'

interface EndGamePayload {}

export class EndGameCommand extends Command<GameRoom, EndGamePayload> {
  execute(payload: EndGamePayload) {
    logger('End Game', 'Command')
    if (this.state.gameStep != GameStep.ONGOING) return
    this.state.gameStep = GameStep.ENDED

    const playerNames = Array.from(this.state.players.values()).map((obj) => {
      return obj.username
    })

    admin.firestore().collection('scores').add({
      score: this.state.score,
      players: playerNames,
      playersCount: playerNames.length,
    })

    this.clock.setTimeout(() => {
      this.room.dispatcher.dispatch(new ResetGameCommand())
    }, 3_000)
  }
}
