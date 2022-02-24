import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameStep, GameState } from "../game.state";

interface StartGamePayload { }

export class StartGameCommand extends Command<Room<GameState>, StartGamePayload> {
    execute(payload: StartGamePayload) {
        logger('Start Game', 'Command')
        if (this.state.gameStep != GameStep.LOBBY) return;
        this.state.gameStep = GameStep.ONGOING
    }
}