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
import { Point } from './game/utils'

const EVENT_START_GAME = 'START_GAME'
const EVENT_PLAYER_MOVE = 'PLAYER_MOVE'
const EVENT_GET_PLAYER_COUNT = 'GET_PLAYER_COUNT'

interface WebSocketWithId extends WebSocket {
	id: string
}

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private pong: Pong) {}

	handleConnection(client: WebSocketWithId) {
		const uuid = randomUUID()
		client.id = uuid
		this.pong.newPlayer(uuid, client)
	}

	handleDisconnect(
		@ConnectedSocket()
		client: WebSocketWithId
	) {
		this.pong.stopGame(client.id)
	}

	@SubscribeMessage(EVENT_GET_PLAYER_COUNT)
	getPlayerCount(@ConnectedSocket() client: WebSocketWithId) {
		const data = JSON.stringify({
			event: EVENT_GET_PLAYER_COUNT,
			data: {
				playerCount: this.pong.getPlayerCount()
			}
		})
		client.send(data)
	}

	@SubscribeMessage(EVENT_START_GAME)
	startGame(
		@ConnectedSocket()
		client: WebSocketWithId
	) {
		this.pong.startGame(client.id)
	}

	@SubscribeMessage(EVENT_PLAYER_MOVE)
	movePlayer(
		@ConnectedSocket()
		client: WebSocketWithId,
		@MessageBody('position') position: Point
	) {
		this.pong.movePlayer(client.id, position)
	}
}
