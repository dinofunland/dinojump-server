import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { invertNumber } from '../../utility/invertNumber'
import { GameRoom } from '../game.room'
import {
  PlatformSchema,
  PositionSchema,
  SizeSchema,
  PlatformType,
} from '../game.state'

interface SpawnPlatformPayload {
  sessionId: string
}

const getRndInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const spawnRates: {
  spawnRate: number
  type: PlatformType
}[] = [
  {
    spawnRate: 20,
    type: PlatformType.STATIC,
  },
  {
    spawnRate: 3,
    type: PlatformType.MOVING,
  },
  {
    spawnRate: 1,
    type: PlatformType.FALLING,
  },
]

const getRandomPlatformType = (): PlatformType => {
  const totalSpawnRate = spawnRates.reduce(
    (partialSum, obj) => partialSum + obj.spawnRate,
    0,
  )
  const randomNumber = Math.floor(Math.random() * totalSpawnRate) + 1
  let checkedIndex = 0
  let rolledPlatformType = PlatformType.STATIC
  for (let spawnRate of spawnRates) {
    checkedIndex += spawnRate.spawnRate
    const isRolledPlatformType = randomNumber < checkedIndex
    if (isRolledPlatformType) {
      rolledPlatformType = spawnRate.type
      break
    }
  }
  return rolledPlatformType
}

const spread = 80

export class SpawnPlatformCommand extends Command<
  GameRoom,
  SpawnPlatformPayload
> {
  execute(payload: SpawnPlatformPayload) {
    logger('Spawn Platform', 'Command')
    const highestPlatform = this.state.getHighestPlatform()
    const spawnPositionY = highestPlatform
      ? highestPlatform.body.position.y - 30
      : -25
    const body = this.room.gameWorld.addPlatform(
      getRndInteger(-spread, spread),
      spawnPositionY,
      40,
      5,
    )
    this.state.platforms.set(
      `${body.position.x}${body.position.y}`,
      new PlatformSchema().assign({
        type: getRandomPlatformType(),
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
