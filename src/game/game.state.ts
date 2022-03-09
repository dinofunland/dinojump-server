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
  PURPLE
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
    y: -5,
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
  @type('number') skin: PlayerSkin = PlayerSkin.BLUE

  body: Matter.Body

  sync() {
    this.position.x = this.body.position.x
    this.position.y = invertNumber(this.body.position.y)
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
