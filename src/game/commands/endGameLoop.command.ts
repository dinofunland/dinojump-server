import { Command } from "@colyseus/command";
import { Room } from "colyseus";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";
import { GameStep, GameSchema } from "../game.state";
import { EndGameCommand } from "./endGame.command";

interface EndGameLoopPayload { }

export class EndGameLoopCommand extends Command<GameRoom, EndGameLoopPayload> {
    execute(payload: EndGameLoopPayload) {
        this.room.setSimulationInterval(() => {})
    }
}