import { WebSocket } from 'ws'
import { Paddle } from './Paddle'
import { Point } from './utils'

export class Player {
	socket: WebSocket
	uuid: string
	paddle: Paddle
	paddleCoords: Point
	mapSize: Point
	score: number

	constructor(uuid: string, socket: WebSocket, paddleCoords: Point, mapSize: Point) {
		this.uuid = uuid
		this.socket = socket
		this.paddle = new Paddle(paddleCoords, mapSize)
		this.paddleCoords = paddleCoords
		this.mapSize = mapSize
		this.score = 0
	}

	newGame() {
		this.score = 0
		this.paddle = new Paddle(this.paddleCoords, this.mapSize)
	}
}
