import { Test, TestingModule } from '@nestjs/testing'
import { Pong } from './pong'

describe('Pong', () => {
	let provider: Pong

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [Pong]
		}).compile()

		provider = module.get<Pong>(Pong)
	})

	it('should be defined', () => {
		expect(provider).toBeDefined()
	})
})
