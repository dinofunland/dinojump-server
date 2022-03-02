import { Command } from "@colyseus/command";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";

interface OnLeavePayload {
    sessionId: string
}

export class OnLeaveCommand extends Command<GameRoom, OnLeavePayload> {
    execute(payload: OnLeavePayload) {
        logger('On Leave', 'Command')
        const bodyPlayer = this.state.players.get(payload.sessionId).body
        this.state.players.delete(payload.sessionId)
        this.room.gameWorld.removeBody(bodyPlayer)
    }
}