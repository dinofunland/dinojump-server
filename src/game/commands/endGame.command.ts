import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameStep, GameSchema } from "../game.state";

interface EndGamePayload { }

export class EndGameCommand extends Command<Room<GameSchema>, EndGamePayload> {
    execute(payload: EndGamePayload) {
        logger('End Game', 'Command')
        if (this.state.gameStep != GameStep.ONGOING) return;
        this.state.gameStep = GameStep.ENDED

        this.clock.setTimeout(() => {
            this.state.players.forEach((value) => {
                value.isReady = false
            })
            this.state.gameStep = GameStep.LOBBY
            this.room.unlock()
        }, 10_000)
    }
}