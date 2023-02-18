import { WebSocket } from 'ws';
import { GameInfo } from './game/constants';
import { Game } from './game/Game';
import { Point } from './game/utils';

export class Pong {
	private playerUUIDToGameIndex = new Map<string, number>();
	private games = new Array<Game>();

	newGame(sockets: Array<WebSocket>, uuids: Array<string>, names: Array<string>) {
		this.games.push(new Game(sockets, uuids, names));
		this.playerUUIDToGameIndex[uuids[0]] = this.games.length - 1;
		this.playerUUIDToGameIndex[uuids[1]] = this.games.length - 1;
		console.log(`Created game ${names[0]} vs ${names[1]}`);
	}

	removePlayer(uuid: string) {
		this.playerGame(uuid).removePlayer(uuid);
	}

	ready(uuid: string) {
		if (this.isInAGame(uuid)) {
			this.playerGame(uuid).ready(uuid);
		}
	}

	stopGame(uuid: string) {
		if (this.isInAGame(uuid)) {
			this.playerGame(uuid).stop();
			delete this.playerUUIDToGameIndex[uuid];
			delete this.games[this.playerUUIDToGameIndex[uuid]];
		}
	}

	getGameInfo(uuid: string): GameInfo {
		if (this.isInAGame(uuid)) {
			return this.playerGame(uuid).getGameInfo(uuid);
		}
	}

	movePlayer(uuid: string, position: Point) {
		if (this.isInAGame(uuid)) {
			this.playerGame(uuid).movePaddle(uuid, position);
		}
	}

	isInAGame(uuid: string): boolean {
		if (this.playerUUIDToGameIndex[uuid] === undefined) {
			return false;
		}
		return true;
	}

	playerGame(uuid: string): Game {
		if (this.isInAGame(uuid)) {
			return this.games[this.playerUUIDToGameIndex[uuid]];
		}
	}
}
