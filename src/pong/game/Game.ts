import { Ball } from './Ball'
import { WebSocket } from 'ws'
import { formatWebsocketData, Point, Rect } from './utils'
import { Player } from './Player'
import { GAME_EVENTS } from './constants'

const GAME_TICKS = 30
const WIN_SCORE = 2
const PLAYER_X_OFFSET = 50
const canvas = { width: 640, height: 480 }

function gameLoop(game: Game) {
	const canvas_rect = new Rect(new Point(640 / 2, 480 / 2), new Point(640, 480))
	game.ball.update(
		canvas_rect,
		game.players.map((p) => p.paddle)
	)
	const index_player_scored: number = game.ball.getIndexPlayerScored()
	if (index_player_scored != -1) {
		game.players[index_player_scored].score += 1
		if (game.players[index_player_scored].score >= WIN_SCORE) {
			console.log(`Player ${index_player_scored + 1} won!`)
			game.stop()
		}
	}

	const data = formatWebsocketData(GAME_EVENTS.GAME_TICK, {
		paddlesPositions: game.players.map((p) => p.paddle.rect.center),
		ballPosition: game.ball.rect.center,
		scores: game.players.map((p) => p.score)
	})
	game.broadcastGame(data)
}

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

	start(): boolean {
		if (!this.timer && this.players.length == 2) {
			this.ball = new Ball(new Point(canvas.width / 2, canvas.height / 2))

			this.timer = setInterval(gameLoop, 1000 / GAME_TICKS, this)
			console.log('Started game')
			return true
		}
		return false
	}

	stop() {
		if (this.timer) {
			clearInterval(this.timer)
			console.log('Stopped game')
		}
	}

	movePaddle(uuid: string, position: Point) {
		const playerIndex = this.players.findIndex((p) => p.uuid == uuid)

		if (this.timer && playerIndex != -1) {
			this.players[playerIndex].paddle.move(position.y)
		}
	}

	broadcastGame(data: string) {
		this.players.forEach((p) => p.socket.send(data))
	}
}
