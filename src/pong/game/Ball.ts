import { Paddle } from './Paddle'
import { Point, Rect } from './utils'

export class Ball {
	rect: Rect
	speed: Point
	color: string | CanvasGradient | CanvasPattern = 'white'

	constructor(spawn: Point, size: Point = new Point(20, 20), speed: Point = new Point(10, 2)) {
		this.rect = new Rect(spawn, size)
		this.speed = speed
	}

	draw(context: CanvasRenderingContext2D) {
		this.rect.draw(context, this.color)
	}

	move(canvas_rect: Rect, paddles: Paddle[]) {
		const offset: Point = new Point(this.rect.size.x / 2, this.rect.size.y / 2)

		for (const paddle of paddles) {
			if (paddle.rect.collides(this.rect)) {
				this.speed.x = this.speed.x * -1
				break
			}
		}
		if (!canvas_rect.contains_x(this.rect)) {
			console.log('Scoooore!')
			this.speed.x = this.speed.x * -1
		}
		if (!canvas_rect.contains_y(this.rect)) this.speed.y = this.speed.y * -1
		this.rect.center.add_inplace(this.speed)
	}
}
