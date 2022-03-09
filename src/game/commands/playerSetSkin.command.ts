import { Command } from '@colyseus/command'
import logger from '../../services/logger.services'
import { GameRoom } from '../game.room'
import { GameStep, PlayerSkin } from '../game.state'

interface PlayerSetSkinPayload {
  sessionId: string
  skin: PlayerSkin
}

export class PlayerSetSkinCommand extends Command<
  GameRoom,
  PlayerSetSkinPayload
> {
  execute(payload: PlayerSetSkinPayload) {
    logger('Player Set Skin', 'Command')

    const player = this.state.players.get(payload.sessionId)
    if (!player) return
    player.skin = payload.skin
  }
}
