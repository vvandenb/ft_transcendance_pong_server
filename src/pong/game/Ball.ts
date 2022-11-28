import { Paddle } from './Paddle'
import { Point, Rect } from './utils'

export class Ball {
	rect: Rect
	speed: Point
	spawn: Point

	constructor(spawn: Point, size: Point = new Point(20, 20), speed: Point = new Point(10, 2)) {
		this.rect = new Rect(spawn, size)
		this.speed = speed
		this.spawn = spawn.clone()
	}

	move(canvas_rect: Rect, paddles: Paddle[]) {
		if (!canvas_rect.contains_x(this.rect)) {
			this.rect.center = this.spawn.clone()
			this.speed.x = this.speed.x * -1
		} else {
			for (const paddle of paddles) {
				if (paddle.rect.collides(this.rect)) {
					if (this.speed.x < 0) this.rect.center.x = paddle.rect.center.x + paddle.rect.size.x
					else this.rect.center.x = paddle.rect.center.x - paddle.rect.size.x
					this.speed.x = this.speed.x * -1
					this.speed.y = ((this.rect.center.y - paddle.rect.center.y) / paddle.rect.size.y) * 20
					break
				}
			}
			if (!canvas_rect.contains_y(this.rect)) this.speed.y = this.speed.y * -1
			this.rect.center.add_inplace(this.speed)
		}
	}
}
