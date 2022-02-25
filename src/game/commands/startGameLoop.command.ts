import { Command } from "@colyseus/command";
import { GameRoom } from "../game.room";

interface StartGameLoopPayload { }

export class StartGameLoopCommand extends Command<GameRoom, StartGameLoopPayload> {
    execute(payload: StartGameLoopPayload) {
        this.room.setSimulationInterval((delateTime) => {
            this.state.update(delateTime)
        })
    }
}