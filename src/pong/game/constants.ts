import { Point } from './utils';

export const GAME_EVENTS = {
	START_GAME: 'START_GAME',
	READY: 'READY',
	GAME_TICK: 'GAME_TICK',
	PLAYER_MOVE: 'PLAYER_MOVE',
	GET_GAME_INFO: 'GET_GAME_INFO',
	CREATE_GAME: 'CREATE_GAME',
	REGISTER_PLAYER: 'REGISTER_PLAYER'
};

export interface GameInfo extends GameInfoConstants {
	yourPaddleIndex: number;
	gameId: string;
}
export interface GameInfoConstants {
	mapSize: Point;
	paddleSize: Point;
	playerXOffset: number;
	ballSize: Point;
	winScore: number;
}
export const gameInfoConstants: GameInfoConstants = {
	mapSize: new Point(600, 400),
	paddleSize: new Point(6, 50),
	playerXOffset: 50,
	ballSize: new Point(20, 20),
	winScore: 2
};

export interface GameUpdate {
	paddlesPositions: Point[];
	ballPosition: Point;
	scores: number[];
}
