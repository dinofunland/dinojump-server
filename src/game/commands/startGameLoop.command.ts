import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";
import { GameStep, GameSchema } from "../game.state";
import { EndGameCommand } from "./endGame.command";

interface StartGameLoopPayload { }

export class StartGameLoopCommand extends Command<GameRoom, StartGameLoopPayload> {
    execute(payload: StartGameLoopPayload) {
        this.room.setSimulationInterval(() => {
            logger(this.clock.elapsedTime.toString(), 'GameLoop') 
        })
    }
}