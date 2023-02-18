import { Module } from '@nestjs/common';
import { PongModule } from './pong/pong.module';

@Module({
	imports: [PongModule]
})
export class AppModule {}
