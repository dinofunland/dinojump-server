import { Schema, type, MapSchema } from '@colyseus/schema'

export enum GameStep {
    LOBBY = 'Lobby',
    STARTING = 'Starting',
    ONGOING = 'Ongoing',
    ENDED = 'Ended'
}

export enum FloorType {
    STATIC = 'Static',
    FALLING = 'Falling',
    MOVING = 'Moving'
}

export class PositionSchema extends Schema {
    @type('number') x: number = 0
    @type('number') y: number = 0
}

export class FloorSchema extends Schema {
    @type('string') type: FloorType = FloorType.STATIC
    @type('number') width: number = 1
    @type(PositionSchema) position: PositionSchema
}

export class PlayerSchema extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
    @type('boolean') isReady: boolean = false

    public resetPlayer = () => {
        this.isReady = false
    }
}

export class GameSchema extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type('number') gameSpeed = 10
    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
    @type({ map: FloorSchema }) floors = new MapSchema<FloorSchema>()
}