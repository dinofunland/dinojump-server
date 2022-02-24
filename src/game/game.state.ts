import { Schema, type, MapSchema } from '@colyseus/schema'

export enum GameStep {
    LOBBY = 'Lobby',
    ONGOING = 'Ongoing'
}

export class PlayerState extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
}

export class GameState extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}