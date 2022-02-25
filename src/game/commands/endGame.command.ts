import { Command } from "@colyseus/command";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";
import { GameStep } from "../game.state";
import { EndGameLoopCommand } from "./endGameLoop.command";
import { ResetGameCommand } from "./resetGame.command";

interface EndGamePayload { }

export class EndGameCommand extends Command<GameRoom, EndGamePayload> {
    execute(payload: EndGamePayload) {
        logger('End Game', 'Command')
        if (this.state.gameStep != GameStep.ONGOING) return;
        this.state.gameStep = GameStep.ENDED

        this.room.dispatcher.dispatch(new EndGameLoopCommand())

        this.clock.setTimeout(() => {
            this.room.dispatcher.dispatch(new ResetGameCommand())
        }, 10_000)
    }
}