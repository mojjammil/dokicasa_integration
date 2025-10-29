import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DokicasaModule } from '../src/dokicasa/dokicasa.module';
import { HttpService } from '../src/http/http.service';

describe('DokicasaController (e2e-like legacy fixed)', () => {
  let app: INestApplication;
  const httpMock = {
    instance: {
      get: jest.fn(),
      post: jest.fn()
    }
  } as unknown as HttpService;

  beforeAll(async () => {
    process.env.DOKICASA_TOKEN = 'TEST_TOKEN';
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DokicasaModule],
    })
      .overrideProvider(HttpService)
      .useValue(httpMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('POST /api/v1/submit-contract-info returns 400 on missing', async () => {
    const payload = {
      city: 'milano',
      contract_type: 'locazione-3-2-canone',
      fields: {}
    };

    // Mock GET to return form schema with required fields
    (httpMock.instance.get as jest.Mock).mockResolvedValueOnce({
      data: {
        form: {
          field1: { question: 'Q1', type: 'varchar', is_required: 1 },
          field2: { question: 'Q2', type: 'varchar', is_required: 1 },
        }
      }
    });

    await request(app.getHttpServer())
      .post('/api/v1/submit-contract-info')
      .send(payload)
      .expect(400);
  });
});
