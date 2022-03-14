import { Command } from '@colyseus/command'
import Matter from 'matter-js'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'

interface ResetPlayersPayload {}

export class ResetPlayersCommand extends Command<
  GameRoom,
  ResetPlayersPayload
> {
  execute(payload: ResetPlayersPayload) {
    logger('Reset Players', 'Command')
    this.state.players.forEach((value) => {
      value.isReady = false
      Matter.Body.setPosition(value.body, { x: 0, y: -10 })
      Matter.Body.setVelocity(value.body, {
        x: 0,
        y: 0,
      })
    })
  }
}
