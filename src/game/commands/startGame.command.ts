import { Command } from "@colyseus/command";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";
import { GameStep } from "../game.state";
import { EndGameCommand } from "./endGame.command";
import { StartGameLoopCommand } from "./startGameLoop.command";

interface StartGamePayload { }

export class StartGameCommand extends Command<GameRoom, StartGamePayload> {
    execute(payload: StartGamePayload) {
        logger('Start Game', 'Command')
        if (this.state.gameStep != GameStep.LOBBY) return;
        this.room.lock()
        this.state.gameStep = GameStep.STARTING

        this.clock.setTimeout(() => {
            this.state.gameStep = GameStep.ONGOING
            this.room.dispatcher.dispatch(new StartGameLoopCommand())

            this.clock.setTimeout(() => {
                this.room.dispatcher.dispatch(new EndGameCommand())
            }, 10_000)
        }, 5_000)
    }
}