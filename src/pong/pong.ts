import { Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'
import { Game } from './game/Game'
import { Point } from './game/utils'

@Injectable()
export class Pong {
	// private games = new Map<Array<string>, Game>()
	private game: Game = new Game()

	addPlayer(uuid: string, socket: WebSocket) {
		this.game.addPlayer(uuid, socket)
	}

	removePlayer(uuid: string) {
		this.game.removePlayer(uuid)
	}

	startGame(uuid: string) {
		this.game.start()
	}

	stopGame(uuid: string) {
		this.game.stop()
		this.game = new Game()
	}

	getPlayerCount() {
		return this.game.getPlayerCount()
	}

	movePlayer(uuid: string, position: Point) {
		this.game.movePaddle(uuid, position)
	}
}
