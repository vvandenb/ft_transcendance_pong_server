import { Server, WebSocket } from 'ws'
import {
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway
} from '@nestjs/websockets'
import { Ball } from './Ball'
import { Paddle } from './Paddle'
import { Point, Rect } from './utils'

const GAME_TICKS = 30
const EVENT_START_GAME = 'START_GAME'
const EVENT_BALL_MOVE = 'BALL_MOVE'
const PLAYER_X_OFFSET = 50

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	game: NodeJS.Timer

	gameTick(
		@ConnectedSocket()
		client: WebSocket,
		ball: Ball,
		paddles: Paddle[]
	) {
		const canvas_rect = new Rect(new Point(640 / 2, 480 / 2), new Point(640, 480))
		ball.move(canvas_rect, paddles)
		client.send(
			JSON.stringify({
				event: EVENT_BALL_MOVE,
				data: {
					center: ball.rect.center
				}
			})
		)
	}

	@SubscribeMessage(EVENT_START_GAME)
	handleMessage(
		@ConnectedSocket()
		client: WebSocket
	) {
		console.log('Starting game!')

		const canvas = { width: 640, height: 480 }
		const ball: Ball = new Ball(new Point(canvas.width / 2, canvas.height / 2))
		const paddle1: Paddle = new Paddle(new Point(PLAYER_X_OFFSET, canvas.height / 2))
		const paddle2: Paddle = new Paddle(new Point(canvas.width - PLAYER_X_OFFSET, canvas.height / 2))

		this.game = setInterval(this.gameTick, 1000 / GAME_TICKS, client, ball, [paddle1, paddle2])

		client.send(
			JSON.stringify({
				event: EVENT_START_GAME,
				data: {
					position: [50, 50]
				}
			})
		)
	}

	handleConnection(client: WebSocket) {
		console.log('#Conekt')
	}

	handleDisconnect() {
		console.log('Closed#')
		console.log(`Client disconnected ##`)
	}
}
