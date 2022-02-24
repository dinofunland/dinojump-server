import http from 'http';
import { Room, Client } from 'colyseus';
import logger from '../services/logger.services';
import { GameState } from './game.state';
import { Dispatcher } from '@colyseus/command';
import { OnJoinCommand } from './commands/onJoin.command';
import { OnLeaveCommand } from './commands/onLeave.command';
import { StartGameCommand } from './commands/startGame.command';

export class GameRoom extends Room<GameState> {

    dispatcher: Dispatcher<GameRoom> = new Dispatcher(this);

    async onCreate(options: any) {
        logger(`onCreate`, 'GameRoom')

        this.setState(new GameState())

        logger(`onCreate ${this.roomName} ${this.roomId}`, 'GameRoom')

        this.onMessage('startGame', () => {
            this.dispatcher.dispatch(new StartGameCommand())
        })

        this.onMessage("*", (client, type, message) => {
            logger(`onMessage Client: ${client.sessionId} sent ${type} ${JSON.stringify(message)}`, 'GameRoom')
        });
    }

    onAuth(client: Client, options: any, request: http.IncomingMessage) {
        logger(`onAuth Client: ${client.sessionId} with options: ${JSON.stringify(options)}`, 'GameRoom')
        return true;
    }

    onJoin(client: Client, options: any, auth: any) {
        this.dispatcher.dispatch(new OnJoinCommand(), {
            sessionId: client.sessionId,
            username: options.name
        })
        logger(`onJoin Client: ${client.sessionId}`, 'GameRoom')
    }

    onLeave(client: Client, consented: boolean) {
        if(consented) {
            this.dispatcher.dispatch(new OnLeaveCommand(),{
                sessionId: client.sessionId
            })
        }
        logger(`onLeave Client with sessionId: ${client.sessionId} consented: ${consented}`, 'GameRoom')
    }

    onDispose() {
        this.dispatcher.stop()
        logger(`onDispose ${this.roomName} ${this.roomId}`, 'GameRoom')
    }
}