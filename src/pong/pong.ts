import { Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'
import { Ball } from './game/Ball'
import { Paddle } from './game/Paddle'
import { Point, Rect } from './game/utils'

const GAME_TICKS = 30
const EVENT_BALL_MOVE = 'BALL_MOVE'
const PLAYER_X_OFFSET = 50

interface Game {
	timer: NodeJS.Timer
	ball: Ball
	paddles: Paddle[]
}

@Injectable()
export class Pong {
	private sockets = new Map<string, WebSocket>()
	private game: Game = {
		timer: null,
		ball: null,
		paddles: []
	}

	gameTick(client: WebSocket, game: Game) {
		const canvas_rect = new Rect(new Point(640 / 2, 480 / 2), new Point(640, 480))
		game.ball.move(canvas_rect, game.paddles)
		client.send(
			JSON.stringify({
				event: EVENT_BALL_MOVE,
				data: {
					position: game.ball.rect.center
				}
			})
		)
	}

	newPlayer(uuid: string, socket: WebSocket) {
		console.log(`New player with UUID: ${uuid}`)
		this.sockets.set(uuid, socket)
	}

	startGame(uuid: string) {
		const socket: WebSocket = this.sockets.get(uuid)
		if (socket) {
			const canvas = { width: 640, height: 480 }
			this.game.ball = new Ball(new Point(canvas.width / 2, canvas.height / 2))
			this.game.paddles[0] = new Paddle(new Point(PLAYER_X_OFFSET, canvas.height / 2))
			this.game.paddles[1] = new Paddle(new Point(canvas.width - PLAYER_X_OFFSET, canvas.height / 2))

			this.game.timer = setInterval(this.gameTick, 1000 / GAME_TICKS, socket, this.game)
			console.log('Started game')
		}
	}

	stopGame(uuid: string) {
		const socket: WebSocket = this.sockets.get(uuid)
		if (socket && this.game.timer) {
			clearInterval(this.game.timer)
			console.log('Stopped game')
		}
	}

	movePlayer(uuid: string, position: Point) {
		const socket: WebSocket = this.sockets.get(uuid)
		if (socket && this.game) {
			this.game.paddles[0].move(position)
		}
	}
}
