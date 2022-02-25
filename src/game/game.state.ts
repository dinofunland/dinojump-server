import { Schema, type, MapSchema } from '@colyseus/schema'
import BigNumber from 'bignumber.js'

export const gravity = 0.1

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

    update(delateTime: number, gameSpeed: number) {
        this.moveUp(delateTime, gameSpeed)  
    }

    private moveUp(delateTime: number, gameSpeed: number) {
        const distanceToMove = new BigNumber(gameSpeed).dividedBy(1000).multipliedBy(delateTime).toNumber()
        this.position.y = new BigNumber(this.position.y).plus(distanceToMove).toNumber()
    }
}

export class PlayerSchema extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
    @type('boolean') isReady: boolean = false
    @type(PositionSchema) position = new PositionSchema()
    @type('number') fallingSpeed = 0

    public reset = () => {
        this.isReady = false
    }

    update(delateTime: number, gameSpeed: number) {
        this.fallDown(delateTime, gameSpeed)
        return 
        const distanceToFall = new BigNumber(this.fallingSpeed).multipliedBy(gameSpeed).multipliedBy(delateTime).toNumber()
        this.position.y = new BigNumber(this.position.y).minus(distanceToFall).toNumber()
        const fallingSpeedToAdd = new BigNumber(gravity).multipliedBy(gameSpeed).multipliedBy(delateTime).toNumber()
        this.fallingSpeed = new BigNumber(this.fallingSpeed).plus(fallingSpeedToAdd).toNumber()
    }

    private fallDown(delateTime: number, gameSpeed: number) {
        const distanceToMove = new BigNumber(this.fallingSpeed).multipliedBy(gameSpeed).multipliedBy(delateTime).toNumber()
        this.position.y = new BigNumber(this.position.y).minus(distanceToMove).toNumber()
        const gravityToAdd = new BigNumber(gravity).multipliedBy(gameSpeed).dividedBy(1000).multipliedBy(delateTime).toNumber()
        this.fallingSpeed = new BigNumber(this.fallingSpeed).plus(gravityToAdd).toNumber()
        console.log('DOWN', this.position.y)
    }
}

export class GameSchema extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type('number') gameSpeed = 1
    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
    @type({ map: PatformSchema }) platforms = new MapSchema<PatformSchema>()
    @type(FloorSchema) floor = new FloorSchema()

    update(delateTime: number) {
        this.floor.update(delateTime, this.gameSpeed)
        this.players.forEach((value) => {
            value.update(delateTime, this.gameSpeed)
        })
    }
}