import { Injectable } from '@nestjs/common'
import { WebSocketGateway } from '@nestjs/websockets'

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!'
	}
}
