import { Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'
import { Ball } from './game/Ball'
import { Paddle } from './game/Paddle'
import { Point, Rect } from './game/utils'

const GAME_TICKS = 30
const EVENT_BALL_MOVE = 'BALL_MOVE'
const PLAYER_X_OFFSET = 50

class Game {
	socket1: WebSocket
	uuid1: string
	socket2: WebSocket
	uuid2: string
	timer: NodeJS.Timer
	ball: Ball
	paddles: Paddle[]

	constructor() {
		this.socket1 = null
		this.uuid1 = null
		this.socket2 = null
		this.uuid2 = null
		this.timer = null
		this.ball = null
		this.paddles = []
	}

	getPlayerCount(): number {
		if (this.uuid1 && this.uuid2) return 2
		else if (this.uuid1 || this.uuid2) return 1
		return 0
	}
}

@Injectable()
export class Pong {
	// private sockets = new Map<string, Game>()
	private game: Game = new Game()

	gameTick(client1: WebSocket, client2: WebSocket, game: Game) {
		const canvas_rect = new Rect(new Point(640 / 2, 480 / 2), new Point(640, 480))
		game.ball.move(canvas_rect, game.paddles)

		const data = JSON.stringify({
			event: EVENT_BALL_MOVE,
			data: {
				player1Position: game.paddles[0].rect.center,
				player2Position: game.paddles[1].rect.center,
				ballPosition: game.ball.rect.center
			}
		})
		client1.send(data)
		client2.send(data)
	}

	newPlayer(uuid: string, socket: WebSocket) {
		console.log(`New player with UUID: ${uuid}`)
		if (!this.game.socket1) {
			this.game.uuid1 = uuid
			this.game.socket1 = socket
		} else if (!this.game.socket2) {
			this.game.uuid2 = uuid
			this.game.socket2 = socket
		}
	}

	startGame(uuid: string) {
		if (!this.game.timer) {
			const is_player1: boolean = this.game.uuid1 == uuid
			const is_player2: boolean = this.game.uuid2 == uuid

			if ((is_player1 || is_player2) && this.game.socket1 && this.game.socket2) {
				const canvas = { width: 640, height: 480 }
				this.game.ball = new Ball(new Point(canvas.width / 2, canvas.height / 2))
				this.game.paddles[0] = new Paddle(new Point(PLAYER_X_OFFSET, canvas.height / 2))
				this.game.paddles[1] = new Paddle(new Point(canvas.width - PLAYER_X_OFFSET, canvas.height / 2))

				this.game.timer = setInterval(
					this.gameTick,
					1000 / GAME_TICKS,
					this.game.socket1,
					this.game.socket2,
					this.game
				)
				console.log('Started game')
			}
		}
	}

	stopGame(uuid: string) {
		if (this.game.timer) {
			const is_player1: boolean = this.game.uuid1 == uuid
			const is_player2: boolean = this.game.uuid2 == uuid

			if (is_player1 || is_player2) {
				clearInterval(this.game.timer)
				this.game = new Game()
				console.log('Stopped game')
			}
		}
	}

	getPlayerCount() {
		return this.game.getPlayerCount()
	}

	movePlayer(uuid: string, position: Point) {
		if (this.game.timer) {
			const is_player1: boolean = this.game.uuid1 == uuid
			const is_player2: boolean = this.game.uuid2 == uuid

			if (is_player1) {
				this.game.paddles[0].move(position.y)
			}
			if (is_player2) {
				this.game.paddles[1].move(position.y)
			}
		}
	}
}
