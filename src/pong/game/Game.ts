import { Ball } from './Ball'
import { WebSocket } from 'ws'
import { formatWebsocketData, Point, Rect } from './utils'
import { Player } from './Player'

const GAME_TICKS = 30
const EVENT_GAME_TICK = 'BALL_MOVE'
const PLAYER_X_OFFSET = 50
const canvas = { width: 640, height: 480 }

export class Game {
	timer: NodeJS.Timer
	ball: Ball
	players: Player[]

	constructor() {
		this.timer = null
		this.ball = null
		this.players = []
	}

	getPlayerCount(): number {
		return this.players.length
	}

	addPlayer(uuid: string, socket: WebSocket) {
		let paddleCoords = new Point(PLAYER_X_OFFSET, canvas.height / 2)
		if (this.players.length == 1) {
			paddleCoords = new Point(canvas.width - PLAYER_X_OFFSET, canvas.height / 2)
		}
		this.players.push(new Player(uuid, socket, paddleCoords))
		console.log(`Added player with UUID: ${uuid}`)
	}

	removePlayer(uuid: string) {
		this.players.splice(
			this.players.findIndex((p) => {
				if (p.uuid == uuid) {
					console.log(`Removed player with UUID: ${uuid}`)
					return true
				}
				return false
			}),
			1
		)
	}

	start() {
		if (!this.timer && this.players.length == 2) {
			this.ball = new Ball(new Point(canvas.width / 2, canvas.height / 2))

			this.timer = setInterval(this.gameLoop, 1000 / GAME_TICKS, this)
			console.log('Started game')
		}
	}

	stop() {
		if (this.timer) {
			clearInterval(this.timer)
			console.log('Stopped game')
		}
	}

	gameLoop(game: Game) {
		const canvas_rect = new Rect(new Point(640 / 2, 480 / 2), new Point(640, 480))
		game.ball.move(
			canvas_rect,
			game.players.map((p) => p.paddle)
		)

		const data = formatWebsocketData(EVENT_GAME_TICK, {
			paddlesPositions: game.players.map((p) => p.paddle.rect.center),
			ballPosition: game.ball.rect.center
		})

		game.players.forEach((p) => p.socket.send(data))
	}

	movePaddle(uuid: string, position: Point) {
		const playerIndex = this.players.findIndex((p) => p.uuid == uuid)

		if (this.timer && playerIndex != -1) {
			this.players[playerIndex].paddle.move(position.y)
		}
	}
}
