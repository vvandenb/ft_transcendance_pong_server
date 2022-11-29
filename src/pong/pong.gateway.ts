import { WebSocket } from 'ws'
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway
} from '@nestjs/websockets'
import { randomUUID } from 'crypto'
import { Pong } from './pong'
import { formatWebsocketData, Point } from './game/utils'
import { GAME_EVENTS } from './game/constants'

interface WebSocketWithId extends WebSocket {
	id: string
}

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private pong: Pong) {}

	handleConnection(client: WebSocketWithId) {
		const uuid = randomUUID()
		client.id = uuid
		this.pong.addPlayer(uuid, client)
	}

	handleDisconnect(
		@ConnectedSocket()
		client: WebSocketWithId
	) {
		this.pong.removePlayer(client.id)
		this.pong.stopGame(client.id)
	}

	@SubscribeMessage(GAME_EVENTS.GET_PLAYER_COUNT)
	getPlayerCount(@ConnectedSocket() client: WebSocketWithId) {
		client.send(
			formatWebsocketData(GAME_EVENTS.GET_PLAYER_COUNT, {
				playerCount: this.pong.getPlayerCount()
			})
		)
	}

	@SubscribeMessage(GAME_EVENTS.START_GAME)
	startGame(
		@ConnectedSocket()
		client: WebSocketWithId
	) {
		if (this.pong.startGame(client.id)) {
			this.pong.broadcastGame(client.id, formatWebsocketData(GAME_EVENTS.START_GAME))
		}
	}

	@SubscribeMessage(GAME_EVENTS.PLAYER_MOVE)
	movePlayer(
		@ConnectedSocket()
		client: WebSocketWithId,
		@MessageBody('position') position: Point
	) {
		this.pong.movePlayer(client.id, position)
	}
}
