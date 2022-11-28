import { WebSocket } from 'ws'
import { Paddle } from './Paddle'
import { Point } from './utils'

export class Player {
	socket: WebSocket
	uuid: string
	paddle: Paddle

	constructor(uuid: string, socket: WebSocket, paddleCoords: Point) {
		this.uuid = uuid
		this.socket = socket
		this.paddle = new Paddle(paddleCoords)
	}
}