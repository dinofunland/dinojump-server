import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameStep, GameState } from "../game.state";
import { EndGameCommand } from "./endGame.command";

interface StartGamePayload { }

export class StartGameCommand extends Command<Room<GameState>, StartGamePayload> {
    execute(payload: StartGamePayload) {
        logger('Start Game', 'Command')
        if (this.state.gameStep != GameStep.LOBBY) throw 'game isnt in lobby step';
        this.room.lock()
        this.state.gameStep = GameStep.STARTING

        this.clock.setTimeout(() => {
            this.state.gameStep = GameStep.ONGOING
        }, 5_000)
        return
        this.clock.setTimeout(() => {
            // Do this command in 60 seconds
            new EndGameCommand()
        }, 10_000)
    }
}