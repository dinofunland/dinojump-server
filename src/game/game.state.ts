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

export class PlatformSchema extends Schema {
    @type('string') type: FloorType = FloorType.STATIC
    @type('number') width: number = 1
    @type(PositionSchema) position = new PositionSchema()
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

export class InputSchema extends Schema {
    @type('boolean') left = false
    @type('boolean') right = false
}

export class PlayerSchema extends Schema {
    @type('string') sessionId: string
    @type('string') username: string = 'Player Name'
    @type('boolean') isReady: boolean = false
    @type(PositionSchema) position = new PositionSchema().assign({
        x: 0,
        y: 1
    })
    @type('number') speedX = 1
    @type('number') speedY = 0
    @type('boolean') isOnPlatform = false

    @type(InputSchema) input = new InputSchema()

    reset = () => {
        this.isReady = false
        this.isOnPlatform = false
        this.position.assign({
            x: 0,
            y: 1
        })
    }

    update(delateTime: number, gameSpeed: number) {
        this.moveY(delateTime, gameSpeed)
        this.moveX(delateTime, gameSpeed)
        this.fall(delateTime, gameSpeed)
    }

    private moveX(delateTime: number, gameSpeed: number) {
        const needsToMove = this.input.left != this.input.right
        if (!needsToMove) return;
        const distanceToMove = new BigNumber(this.speedX).dividedBy(100).multipliedBy(gameSpeed).multipliedBy(delateTime).toNumber()
        if (this.input.left) {
            this.position.x = new BigNumber(this.position.x).minus(distanceToMove).toNumber()
        }
        if (this.input.right) {
            this.position.x = new BigNumber(this.position.x).plus(distanceToMove).toNumber()
        }
    }

    private moveY(delateTime: number, gameSpeed: number) {
        const distanceToMove = new BigNumber(this.speedY).dividedBy(100).multipliedBy(gameSpeed).multipliedBy(delateTime).toNumber()
        this.position.y = new BigNumber(this.position.y).plus(distanceToMove).toNumber()
    }

    private fall(delateTime: number, gameSpeed: number) {
        if (this.isOnPlatform) return
        const gravityToAdd = new BigNumber(gravity).multipliedBy(gameSpeed).dividedBy(1000).multipliedBy(delateTime).toNumber()
        this.speedY = new BigNumber(this.speedY).plus(gravityToAdd).toNumber()
    }
}

export class GameSchema extends Schema {
    @type('string') gameStep: GameStep = GameStep.LOBBY
    @type('number') gameSpeed = 1
    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
    @type({ map: PlatformSchema }) platforms = new MapSchema<PlatformSchema>().set('00', new PlatformSchema().assign({
        width: 100
    }))
    @type(FloorSchema) floor = new FloorSchema()

    update(delateTime: number) {
        this.ckeckCollision()
        this.floor.update(delateTime, this.gameSpeed)
        this.players.forEach((value) => {
            value.update(delateTime, this.gameSpeed)
        })
    }

    ckeckCollision() {

    }

    reset() {
        this.platforms.clear()
        this.platforms.set('00', new PlatformSchema().assign({
            width: 100
        }))

        this.floor.reset()

        this.players.forEach((value) => {
            value.reset()
        })
        this.gameStep = GameStep.LOBBY

        this.players.forEach
    }
}