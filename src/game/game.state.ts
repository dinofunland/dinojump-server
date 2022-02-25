import { Schema, type, MapSchema } from '@colyseus/schema'

export enum GameStep {
    LOBBY = 'Lobby',
    STARTING = 'Starting',
    ONGOING = 'Ongoing',
    ENDED = 'Ended'
}

export class PlayerState extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
    @type('boolean') isReady: boolean = false
}

export class GameState extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}