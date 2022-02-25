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

export class PositionState extends Schema {
    @type('number') x: number = 0
    @type('number') y: number = 0
}

export class FloorState extends Schema {
    @type('string') type: FloorType = FloorType.STATIC
    @type('number') width: number = 1
    @type(PositionState) position: PositionState
}

export class PlayerState extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
    @type('boolean') isReady: boolean = false
}

export class GameState extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type('number') gameSpeed = 10
    @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
    @type({ map: FloorState }) floors = new MapSchema<FloorState>()
}