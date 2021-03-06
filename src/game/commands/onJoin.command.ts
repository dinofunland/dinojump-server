import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { invertNumber } from '../../utility/invertNumber'
import { GameRoom } from '../game.room'
import { PlayerSchema, PositionSchema, SizeSchema } from '../game.state'

interface OnJoinPayload {
  sessionId: string
  username?: string
}

export class OnJoinCommand extends Command<GameRoom, OnJoinPayload> {
  execute(payload: OnJoinPayload) {
    logger('On Join', 'Command')
    const spawnPosition = {
      x: 0,
      y: -10,
    }
    this.state.players.set(
      payload.sessionId,
      new PlayerSchema().assign({
        sessionId: payload.sessionId,
        username: payload.username || 'No Name',
        position: new PositionSchema().assign({
          x: spawnPosition.x,
          y: invertNumber(spawnPosition.y),
        }),
        size: new SizeSchema().assign({
          width: 5,
          height: 10,
        }),
        body: this.room.gameWorld.addPlayer(
          spawnPosition.x,
          spawnPosition.y,
          5,
          10,
        ),
      }),
    )
  }
}
