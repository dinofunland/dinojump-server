import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { PlayerState, GameState } from "../game.state";

interface OnJoinPayload {
    sessionId: string
    username?: string
}

export class OnJoinCommand extends Command<Room<GameState>, OnJoinPayload> {
    execute(payload: OnJoinPayload) {
        logger('On Join', 'Command')
        this.state.players.set(payload.sessionId, new PlayerState().assign({
            sessionId: payload.sessionId,
            username: payload.username || 'No Name'
        }))
    }
}