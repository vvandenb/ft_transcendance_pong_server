import { Ball } from './Ball'
import { WebSocket } from 'ws'
import { formatWebsocketData, Point, Rect } from './utils'
import { Player } from './Player'
import { GameInfo, gameInfoConstants, GameUpdate, GAME_EVENTS } from './constants'

const GAME_TICKS = 30

function gameLoop(game: Game) {
	const canvas_rect = new Rect(
		new Point(gameInfoConstants.mapSize.x / 2, gameInfoConstants.mapSize.y / 2),
		new Point(gameInfoConstants.mapSize.x, gameInfoConstants.mapSize.y)
	)
	game.ball.update(
		canvas_rect,
		game.players.map((p) => p.paddle)
	)
	const index_player_scored: number = game.ball.getIndexPlayerScored()
	if (index_player_scored != -1) {
		game.players[index_player_scored].score += 1
		if (game.players[index_player_scored].score >= gameInfoConstants.winScore) {
			console.log(`Player ${index_player_scored + 1} won!`)
			game.stop()
		}
	}

	const data: GameUpdate = {
		paddlesPositions: game.players.map((p) => p.paddle.rect.center),
		ballPosition: game.ball.rect.center,
		scores: game.players.map((p) => p.score)
	}
	const websocketData: string = formatWebsocketData(GAME_EVENTS.GAME_TICK, data)
	game.broadcastGame(websocketData)
}

export class Game {
	timer: NodeJS.Timer
	ball: Ball
	players: Player[]

	constructor() {
		this.timer = null
		this.ball = new Ball(new Point(gameInfoConstants.mapSize.x / 2, gameInfoConstants.mapSize.y / 2))
		this.players = []
	}

	getGameInfo(uuid: string): GameInfo {
		const yourPaddleIndex = this.players.findIndex((p) => p.uuid == uuid)
		return {
			...gameInfoConstants,
			yourPaddleIndex: yourPaddleIndex
		}
	}

	addPlayer(uuid: string, socket: WebSocket) {
		let paddleCoords = new Point(gameInfoConstants.playerXOffset, gameInfoConstants.mapSize.y / 2)
		if (this.players.length == 1) {
			paddleCoords = new Point(
				gameInfoConstants.mapSize.x - gameInfoConstants.playerXOffset,
				gameInfoConstants.mapSize.y / 2
			)
		}
		const players_count = this.players.push(new Player(uuid, socket, paddleCoords, gameInfoConstants.mapSize))
		console.log(`Added player with UUID: ${this.players[players_count - 1].uuid}`)
	}

	removePlayer(uuid: string) {
		const player_index = this.players.findIndex((p) => p.uuid == uuid)
		if (player_index != -1) {
			console.log(`Removing player with UUID: ${this.players[player_index].uuid}`)
			this.players.splice(player_index, 1)
			if (this.players.length < 2) {
				this.stop()
			}
		}
	}

	start(): boolean {
		if (!this.timer && this.players.length == 2) {
			this.ball = new Ball(new Point(gameInfoConstants.mapSize.x / 2, gameInfoConstants.mapSize.y / 2))
			this.players.forEach((p) => p.newGame())

			this.timer = setInterval(gameLoop, 1000 / GAME_TICKS, this)
			console.log('Started game')
			return true
		}
		return false
	}

	stop() {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
			this.players = []
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
