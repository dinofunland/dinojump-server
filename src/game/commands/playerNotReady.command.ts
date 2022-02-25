import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameSchema, GameStep } from "../game.state";

interface PlayerNotReadyPayload {
    sessionId: string
}

export class PlayerNotReadyCommand extends Command<Room<GameSchema>, PlayerNotReadyPayload> {
    execute(payload: PlayerNotReadyPayload) {
        logger('Player Ready', 'Command')
        if (this.state.gameStep != GameStep.LOBBY) throw 'game isnt in lobby step';
        const player = this.state.players.get(payload.sessionId)
        if (!player) throw 'player not found'
        player.isReady = false
    }
}