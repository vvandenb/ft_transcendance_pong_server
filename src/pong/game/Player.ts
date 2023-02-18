import { WebSocket } from 'ws';
import { Paddle } from './Paddle';
import { Point } from './utils';

export class Player {
	socket: WebSocket;
	uuid: string;
	name: string;
	ready: boolean;
	paddle: Paddle;
	paddleCoords: Point;
	mapSize: Point;
	score: number;

	constructor(socket: WebSocket, uuid: string, name: string, paddleCoords: Point, mapSize: Point) {
		this.socket = socket;
		this.uuid = uuid;
		this.name = name;
		this.paddle = new Paddle(paddleCoords, mapSize);
		this.paddleCoords = paddleCoords;
		this.mapSize = mapSize;
		this.score = 0;
	}

	newGame() {
		this.score = 0;
		this.paddle = new Paddle(this.paddleCoords, this.mapSize);
	}
}
