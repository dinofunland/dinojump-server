import { Schema, type, MapSchema } from '@colyseus/schema'
import Matter from 'matter-js'

const invertNumber = (i: number) => {
  return i - i * 2
}

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
  @type(SizeSchema) size = new SizeSchema()
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

export class GameSchema extends Schema {
  @type('string') gameStep: GameStep = GameStep.LOBBY
  @type('number') gameSpeed = 1
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
  @type({ map: PlatformSchema }) platforms = new MapSchema<PlatformSchema>()
  @type(FloorSchema) floor = new FloorSchema()

  sync() {
    this.players.forEach((value) => {
      value.sync()
    })
    this.platforms.forEach((value) => {
      value.sync()
    })
  }
}
