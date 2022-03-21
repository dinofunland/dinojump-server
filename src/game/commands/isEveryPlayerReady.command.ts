import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep, PlayerSchema } from '../game.state'
import { StartGameCommand } from './startGame.command'

interface IsEveryPlayerReadyPayload {}

function isEveryPlayerReady(players: MapSchema<PlayerSchema>): boolean {
  const arePlayersReady: boolean[] = Array.from(players.values()).map(
    (player) => player.isReady,
  )
  const isEveryPlayerReady = arePlayersReady.every(Boolean)
  return isEveryPlayerReady
}

export class IsEveryPlayerReadyCommand extends Command<
  GameRoom,
  IsEveryPlayerReadyPayload
> {
  execute(payload: IsEveryPlayerReadyPayload) {
    logger('Is Every Player Ready', 'Command')
    if (this.state.gameStep != GameStep.LOBBY) return

    const players = this.state.players

    if (isEveryPlayerReady(players)) {
      logger('Everyone is ready', 'Game')
      return new StartGameCommand()
    }
  }
}
