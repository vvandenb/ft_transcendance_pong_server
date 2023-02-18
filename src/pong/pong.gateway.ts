import { WebSocket } from 'ws';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Pong } from './pong';
import { formatWebsocketData, Point } from './game/utils';
import { GAME_EVENTS } from './game/constants';

interface WebSocketWithId extends WebSocket {
	id: string;
}

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private pong: Pong = new Pong();
	private socketToPlayerName: Map<WebSocketWithId, string> = new Map();

	handleConnection(client: WebSocketWithId) {
		const uuid = randomUUID();
		client.id = uuid;
	}

	handleDisconnect(
		@ConnectedSocket()
		client: WebSocketWithId
	) {
		if (this.pong.isInAGame(client.id)) {
			console.log(`Disconnected ${this.socketToPlayerName.get(client)}`);
			if (this.pong.playerGame(client.id).isPlaying()) {
				this.pong.playerGame(client.id).stop();
			}
			this.socketToPlayerName.delete(client);
		}
	}

	@SubscribeMessage(GAME_EVENTS.REGISTER_PLAYER)
	registerPlayer(
		@ConnectedSocket()
		client: WebSocketWithId,
		@MessageBody('playerName') playerName: string
	) {
		this.socketToPlayerName.set(client, playerName);
		console.log(`Connected ${this.socketToPlayerName.get(client)}`);
	}

	@SubscribeMessage(GAME_EVENTS.GET_GAME_INFO)
	getPlayerCount(@ConnectedSocket() client: WebSocketWithId) {
		client.send(formatWebsocketData(GAME_EVENTS.GET_GAME_INFO, this.pong.getGameInfo(client.id)));
	}

	@SubscribeMessage(GAME_EVENTS.PLAYER_MOVE)
	movePlayer(
		@ConnectedSocket()
		client: WebSocketWithId,
		@MessageBody('position') position: Point
	) {
		this.pong.movePlayer(client.id, position);
	}

	@SubscribeMessage(GAME_EVENTS.CREATE_GAME)
	createGame(
		@ConnectedSocket()
		client: WebSocketWithId,
		@MessageBody('playerNames') playerNames: string[]
	) {
		const allPlayerNames: Array<string> = Array.from(this.socketToPlayerName.values());
		if (playerNames && playerNames.length === 2 && allPlayerNames && allPlayerNames.length >= 2) {
			const player1Socket: WebSocketWithId = Array.from(this.socketToPlayerName.keys()).find(
				(key) => this.socketToPlayerName.get(key) === playerNames[0]
			);
			const player2Socket: WebSocketWithId = Array.from(this.socketToPlayerName.keys()).find(
				(key) => this.socketToPlayerName.get(key) === playerNames[1]
			);

			if (
				player1Socket &&
				player2Socket &&
				(client.id === player1Socket.id || client.id === player2Socket.id) &&
				player1Socket.id !== player2Socket.id
			) {
				this.pong.newGame([player1Socket, player2Socket], [player1Socket.id, player2Socket.id], playerNames);
			}
		}
	}

	@SubscribeMessage(GAME_EVENTS.READY)
	ready(
		@ConnectedSocket()
		client: WebSocketWithId
	) {
		this.pong.ready(client.id);
	}
}
