import { Command } from "@colyseus/command";
import logger from "../../services/logger.services";
import { GameRoom } from "../game.room";
import { GameStep } from "../game.state";

interface SpawnFloorPayload { }

export class SpawnFloorCommand extends Command<GameRoom, SpawnFloorPayload> {
    execute(payload: SpawnFloorPayload) {
        logger('Spawn Floor', 'Command')
    }
}