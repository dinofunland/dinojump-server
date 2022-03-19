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
    this.state.players.forEach((player) => {
      player.isReady = false
      Matter.Body.setPosition(player.body, { x: 0, y: -10 })
      Matter.Body.setVelocity(player.body, {
        x: 0,
        y: 0,
      })
      player.isDead = false
    })
  }
}
