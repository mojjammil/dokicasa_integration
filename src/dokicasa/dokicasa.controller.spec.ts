import { Test, TestingModule } from '@nestjs/testing';
import { DokicasaController } from './dokicasa.controller';
import { DokicasaService } from './dokicasa.service';

describe('DokicasaController', () => {
  let controller: DokicasaController;

  const serviceMock = {
    submitContractInfo: jest.fn().mockResolvedValue({ ok: true, step3: {}, step4: {} }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DokicasaController],
      providers: [
        { provide: DokicasaService, useValue: serviceMock }
      ],
    }).compile();

    controller = module.get<DokicasaController>(DokicasaController);
  });

  it('delegates submit', async () => {
    const dto = { city: 'roma', contract_type: 'locazione-3-2-canone', fields: { x: 1 } } as any;
    const res = await controller.submit(dto);
    expect(res.ok).toBe(true);
    expect(serviceMock.submitContractInfo).toHaveBeenCalledWith(dto);
  });
});
