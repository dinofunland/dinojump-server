import { Schema, type, MapSchema } from '@colyseus/schema'
import BigNumber from 'bignumber.js'

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

export class PatformSchema extends Schema {
    @type('string') type: FloorType = FloorType.STATIC
    @type('number') width: number = 1
    @type(PositionSchema) position: PositionSchema
}

export class FloorSchema extends Schema {
    @type(PositionSchema) position = new PositionSchema().assign({
        y: -5
    })

    reset() {
        this.position.y = -5
    }

    moveUp(delateTime, speed) {
        const distanceToMove = new BigNumber(speed).dividedBy(1000).multipliedBy(delateTime).toNumber()
        this.position.y = new BigNumber(this.position.y).plus(distanceToMove).toNumber()

        console.log(this.position.y)
    }
}

export class PlayerSchema extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
    @type('boolean') isReady: boolean = false

    public reset = () => {
        this.isReady = false
    }
}

export class GameSchema extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type('number') gameSpeed = 1
    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
    @type({ map: PatformSchema }) platforms = new MapSchema<PatformSchema>()
    @type(FloorSchema) floor = new FloorSchema()
}