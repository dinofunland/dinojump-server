import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import {
  invertNumber,
  PlatformSchema,
  PositionSchema,
  SizeSchema,
} from '../game.state'

interface SpawnPlatformPayload {
  sessionId: string
}

const getRndInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const spread = 30

const minDistance = 10

const maxDistance = 40

export class SpawnPlatformCommand extends Command<
  GameRoom,
  SpawnPlatformPayload
> {
  execute(payload: SpawnPlatformPayload) {
    logger('Spawn Platform', 'Command')
    const highestPlatform = this.state.getHighestPlatform()
    const spawnPositionY = highestPlatform
      ? highestPlatform.body.position.y -
        getRndInteger(minDistance, maxDistance)
      : -35
    const body = this.room.gameWorld.addPlatform(
      getRndInteger(-spread, spread),
      spawnPositionY,
      40,
      5,
    )
    this.state.platforms.set(
      `${body.position.x}${body.position.y}`,
      new PlatformSchema().assign({
        position: new PositionSchema().assign({
          x: body.position.x,
          y: invertNumber(body.position.y),
        }),
        size: new SizeSchema().assign({
          width: 40,
          height: 5,
        }),
        body: body,
      }),
    )
  }
}
