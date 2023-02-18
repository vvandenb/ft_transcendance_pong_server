import { gameInfoConstants } from './constants';
import { Point, Rect } from './utils';

export class Paddle {
	rect: Rect;
	color: string | CanvasGradient | CanvasPattern = 'white';
	mapSize: Point;

	constructor(spawn: Point, gameSize: Point, size: Point = gameInfoConstants.paddleSize) {
		this.rect = new Rect(spawn, size);
		this.mapSize = gameSize;
	}

	draw(context: CanvasRenderingContext2D) {
		this.rect.draw(context, this.color);
	}

	move(new_y: number) {
		const offset: number = this.rect.size.y / 2;
		if (new_y - offset < 0) {
			this.rect.center.y = offset;
		} else if (new_y + offset > this.mapSize.y) {
			this.rect.center.y = this.mapSize.y - offset;
		} else {
			this.rect.center.y = new_y;
		}
	}
}
