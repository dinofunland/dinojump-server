import { Command } from "@colyseus/command";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";

interface StartGameLoopPayload { }

export class StartGameLoopCommand extends Command<GameRoom, StartGameLoopPayload> {
    execute(payload: StartGameLoopPayload) {
        this.room.setSimulationInterval(() => {
            logger(this.clock.elapsedTime.toString(), 'GameLoop') 
        })
    }
}