import { Point } from './utils'

export const GAME_EVENTS = {
	START_GAME: 'START_GAME',
	GAME_TICK: 'GAME_TICK',
	PLAYER_MOVE: 'PLAYER_MOVE',
	GET_GAME_INFO: 'GET_GAME_INFO'
}

export interface GameInfo extends GameInfoConstants {
	yourPaddleIndex: number
}
export interface GameInfoConstants {
	mapSize: Point
	paddleSize: Point
	playerXOffset: number
	ballSize: Point
}
export const gameInfoConstants: GameInfoConstants = {
	mapSize: new Point(600, 400),
	paddleSize: new Point(6, 50),
	playerXOffset: 50,
	ballSize: new Point(20, 20)
}
