import { Command } from "@colyseus/command";
import { GameRoom } from "../game.room";

interface EndGameLoopPayload { }

export class EndGameLoopCommand extends Command<GameRoom, EndGameLoopPayload> {
    execute(payload: EndGameLoopPayload) {
        this.room.setSimulationInterval(() => {})
    }
}