import { Command } from '@colyseus/command'
import * as Matter from 'matter-js'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep } from '../game.state'

interface PlayerJumpPayload {
  sessionId: string
}

export class PlayerJumpCommand extends Command<GameRoom, PlayerJumpPayload> {
  execute(payload: PlayerJumpPayload) {
    logger('Player Jump', 'Command')
    const isGameStarting = this.state.gameStep == GameStep.STARTING
    const hasGameEnded = this.state.gameStep == GameStep.ENDED
    if (isGameStarting || hasGameEnded) return

    const player = this.state.players.get(payload.sessionId)

    const gameWorld = this.room.gameWorld
    if (gameWorld && player) {
      const platforms = Array.from(this.room.state.platforms.values()).map(
        (value) => value.body,
      )
      const jump = () => {
        Matter.Body.setVelocity(player.body, {
          x: player.body.velocity.x,
          y: -player.jumpPower,
        })
      }
      let isGrounded = false

      for (let platform of [gameWorld.ground, ...platforms]) {
        const collision = Matter.SAT.collides(platform, player.body)
        if (collision) {
          isGrounded = true
          break
        }
      }

      if (isGrounded) {
        jump()
      } else if (!isGrounded && player.extraJumpsUsed < player.extraJumps) {
        jump()
        player.extraJumpsUsed = player.extraJumpsUsed + 1
      }
    }
  }
}
