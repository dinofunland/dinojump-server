import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import { Room } from 'colyseus'
import logger from '../../services/logger.services'
import { GameSchema, GameStep, PlayerSchema } from '../game.state'
import { StartGameCommand } from './startGame.command'

interface PlayerReadyPayload {
  sessionId: string
}

function isEveryPlayerReady(players: MapSchema<PlayerSchema>): boolean {
  const arePlayersReady: boolean[] = Array.from(players.values()).map(
    (player) => player.isReady,
  )
  const isEveryPlayerReady = arePlayersReady.every(Boolean)
  return isEveryPlayerReady
}

export class PlayerReadyCommand extends Command<
  Room<GameSchema>,
  PlayerReadyPayload
> {
  execute(payload: PlayerReadyPayload) {
    logger('Player Ready', 'Command')
    if (this.state.gameStep != GameStep.LOBBY) return
    const player = this.state.players.get(payload.sessionId)
    if (!player) throw 'player not found'
    player.isReady = true

    const players = this.state.players

    if (isEveryPlayerReady(players)) {
      logger('Everyone is ready', 'Game')
      return new StartGameCommand()
    }
  }
}
