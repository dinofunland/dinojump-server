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

const getHighestPlatform = (
  platforms: MapSchema<PlatformSchema>,
): PlatformSchema => {
  const arrayPlatforms = Array.from(platforms.values())
  if (!arrayPlatforms.length) return null
  return arrayPlatforms.reduce((max, platform) =>
    max.body.position.y < platform.body.position.y ? max : platform,
  )
}

export class SpawnPlatformCommand extends Command<
  GameRoom,
  SpawnPlatformPayload
> {
  execute(payload: SpawnPlatformPayload) {
    logger('Spawn Platform', 'Command')
    const highestPlatform = getHighestPlatform(this.state.platforms)
    const spawnPositionY = highestPlatform
      ? highestPlatform.body.position.y - 35
      : -35
    const body = this.room.gameWorld.addPlatform(
      getRndInteger(-60, 100),
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
