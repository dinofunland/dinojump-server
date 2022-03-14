import { Schema, type, MapSchema } from '@colyseus/schema'
import Matter from 'matter-js'
import { clamp } from '../utility/clamp'
import { invertNumber } from '../utility/invertNumber'
import { lerp } from '../utility/lerp'

export enum GameStep {
  LOBBY = 'Lobby',
  STARTING = 'Starting',
  ONGOING = 'Ongoing',
  ENDED = 'Ended',
}

export enum PlatformType {
  STATIC = 'Static',
  FALLING = 'Falling',
  MOVING = 'Moving',
}

export enum PlayerSkin {
  BLUE,
  GREEN,
  YELLOW,
  PURPLE,
}

export enum PlayerAnimation {
  IDLE,
  WALKING,
  JUMPING,
  FALLING,
  DANCE,
}

export class PositionSchema extends Schema {
  @type('number') x: number = 0
  @type('number') y: number = 0
}

export class SizeSchema extends Schema {
  @type('number') width: number = 1
  @type('number') height: number = 1
}

export class PlatformSchema extends Schema {
  @type('string') type: PlatformType = PlatformType.STATIC
  @type(PositionSchema) position = new PositionSchema()
  @type(SizeSchema) size = new SizeSchema()

  body: Matter.Body

  sync() {
    this.position.x = this.body.position.x
    this.position.y = invertNumber(this.body.position.y)
  }
}

export class FloorSchema extends Schema {
  @type(PositionSchema) position = new PositionSchema().assign({
    y: -20,
  })
}

export class InputSchema extends Schema {
  @type('boolean') left = false
  @type('boolean') right = false
}

export class PlayerSchema extends Schema {
  @type('string') sessionId: string
  @type('string') username: string = 'No Name'
  @type('boolean') isReady: boolean = false
  @type(PositionSchema) position = new PositionSchema()
  @type(SizeSchema) size = new SizeSchema()
  @type(InputSchema) input = new InputSchema()
  @type('uint16') skin: PlayerSkin = PlayerSkin.BLUE
  @type('uint16') animation: PlayerAnimation = PlayerAnimation.IDLE
  moveSpeed: number = 2
  jumpPower: number = 5
  extraJumps: number = 1
  extraJumpsUsed: number = 0

  body: Matter.Body

  sync() {
    this.position.x = this.body.position.x
    this.position.y = invertNumber(this.body.position.y)

    // animation handling
    const velocityX = this.body.velocity.x
    const velocityY = this.body.velocity.y
    const isDancing = this.animation == PlayerAnimation.DANCE

    if (velocityY < 0) {
      this.animation = PlayerAnimation.JUMPING
    } else if (velocityY > 0) {
      this.animation = PlayerAnimation.FALLING
    } else if (velocityX != 0) {
      this.animation = PlayerAnimation.WALKING
    } else if (velocityX == 0 && !isDancing) {
      this.animation = PlayerAnimation.IDLE
    }
  }
}

export class GroundSchema extends Schema {
  @type(PositionSchema) position = new PositionSchema().assign({
    y: 0,
  })
  @type(SizeSchema) size = new SizeSchema()
}

export class GameSchema extends Schema {
  @type('string') gameStep: GameStep = GameStep.LOBBY
  @type('number') gameSpeed = 1
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
  @type({ map: PlatformSchema }) platforms = new MapSchema<PlatformSchema>()
  @type(FloorSchema) floor = new FloorSchema()
  @type(GroundSchema) ground = new GroundSchema()
  @type('number') score = 0
  public minFloorSpeed: number = 5
  public maxFloorSpeed: number = 50
  public maxFloorDistance: number = 100

  getHighestPlatform = (): PlatformSchema => {
    const arrayPlatforms = Array.from(this.platforms.values())
    if (!arrayPlatforms.length) return null
    return arrayPlatforms.reduce((max, platform) =>
      max.body.position.y < platform.body.position.y ? max : platform,
    )
  }

  getHighestPlayer = (): PlayerSchema => {
    const arrayPlayers = Array.from(this.players.values())
    if (!arrayPlayers.length) return null
    return arrayPlayers.reduce((max, player) =>
      max.body.position.y < player.body.position.y ? max : player,
    )
  }

  sync() {
    this.players.forEach((value) => {
      value.sync()
    })
    this.platforms.forEach((value) => {
      value.sync()
    })
  }

  update(deltaTime: number) {
    if (this.gameStep == GameStep.ONGOING) {
      const floorSpeed = clamp(
        this.floor.position.y / 10,
        this.minFloorSpeed,
        this.maxFloorSpeed,
      )
      this.floor.position.y += (deltaTime / 1000) * floorSpeed

      const highestPlayer = this.getHighestPlayer()
      if (highestPlayer) {
        this.score = Math.floor(highestPlayer.position.y)
        const isLavaToFarAway =
          this.maxFloorDistance <
          highestPlayer.position.y - this.floor.position.y
        if (isLavaToFarAway) {
          this.floor.position.y = lerp(
            this.floor.position.y,
            highestPlayer.position.y - this.maxFloorDistance,
            0.01,
          )
        }
      }
    }
  }
}
