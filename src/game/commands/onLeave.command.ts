import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameSchema } from "../game.state";

interface OnLeavePayload {
    sessionId: string
}

export class OnLeaveCommand extends Command<Room<GameSchema>, OnLeavePayload> {
    execute(payload: OnLeavePayload) {
        logger('On Leave', 'Command')
        this.state.players.delete(payload.sessionId)
    }
}