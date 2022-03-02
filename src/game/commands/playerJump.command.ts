import { Command } from "@colyseus/command";
import * as Matter from 'matter-js'
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";

interface PlayerJumpPayload {
    sessionId: string
}

export class PlayerJumpCommand extends Command<GameRoom, PlayerJumpPayload> {
    execute(payload: PlayerJumpPayload) {
        logger('Player Jump', 'Command')
        const player = this.state.players.get(payload.sessionId)
        
        const gameWorld = this.room.gameWorld
        if (gameWorld && player) {
            const powerJump = 5
            const platforms = Array.from(this.room.state.platforms.values()).map(value => value.body)
            for (let platform of [gameWorld.ground, ...platforms]) {
                const isCollidingWithPlatform = Matter.SAT.collides(platform, player.body)
                if (isCollidingWithPlatform) {
                    Matter.Body.setVelocity(player.body, {
                        x: player.body.velocity.x,
                        y: -powerJump
                    })
                }
            }
        }
    }
}