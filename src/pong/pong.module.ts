import { Module } from '@nestjs/common'
import { PongGateway } from './pong.gateway'
import { Pong } from './pong'

@Module({
	providers: [PongGateway, Pong]
})
export class PongModule {}
