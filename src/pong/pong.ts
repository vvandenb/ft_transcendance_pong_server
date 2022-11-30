import { WebSocket } from 'ws'
import { GameInfo } from './game/constants'
import { Game } from './game/Game'
import { Point } from './game/utils'

export class Pong {
	// private games = new Map<Array<string>, Game>()
	private game: Game = new Game()

	addPlayer(uuid: string, socket: WebSocket) {
		this.game.addPlayer(uuid, socket)
	}

	removePlayer(uuid: string) {
		this.game.removePlayer(uuid)
	}

	startGame(uuid: string): boolean {
		return this.game.start()
	}

	stopGame(uuid: string) {
		this.game.stop()
	}

	getGameInfo(uuid: string): GameInfo {
		return this.game.getGameInfo(uuid)
	}

	movePlayer(uuid: string, position: Point) {
		this.game.movePaddle(uuid, position)
	}

	broadcastGame(uuid: string, data: string) {
		this.game.broadcastGame(data)
	}
}
