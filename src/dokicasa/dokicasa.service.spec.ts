import { Test, TestingModule } from '@nestjs/testing';
import { DokicasaService } from './dokicasa.service';
import { FormResolverService } from './form-resolver.service';
import { MappingService } from '../mapping/mapping.service';
import { HttpService } from '../http/http.service';

describe('DokicasaService', () => {
  let service: DokicasaService;

  const httpMock = {
    instance: {
      get: jest.fn(),
      post: jest.fn()
    }
  } as unknown as HttpService;

  beforeAll(() => {
    process.env.DOKICASA_TOKEN = 'TEST_TOKEN';
    process.env.DOKICASA_BASE_URL = 'https://app.dokicasa.it';
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DokicasaService,
        FormResolverService,
        MappingService,
        { provide: HttpService, useValue: httpMock },
      ],
    }).compile();

    service = module.get<DokicasaService>(DokicasaService);
  });

  const validPayload = {
    city: 'milano' as const,
    contract_type: 'locazione-3-2-canone' as const,
    fields: {
      field1: 'value1',
      field2: 'value2',
    },
    creation_fields: {
      creation_field1: 'creation_value1',
    }
  };

  const mockStep3Schema = {
    form: {
      field1: {
        question: 'Question 1?',
        type: 'varchar',
        field_subtype: 'STRING',
        is_required: 1,
      },
      field2: {
        question: 'Question 2?',
        type: 'varchar',
        field_subtype: 'STRING',
        is_required: 1,
      },
    }
  };

  const mockStep4Schema = {
    form: {
      creation_field1: {
        question: 'Creation Question?',
        type: 'varchar',
        field_subtype: 'STRING',
        is_required: 1,
      },
    }
  };

  it('submitContractInfo: success calls GET → POST for Step3, then GET → POST for Step4', async () => {
    // Mock GET responses for form schemas
    (httpMock.instance.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockStep3Schema }) // Step 3 GET
      .mockResolvedValueOnce({ data: mockStep4Schema }); // Step 4 GET

    // Mock POST responses
    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM123', status: 'ok' } }) // Step 3 POST
      .mockResolvedValueOnce({ data: { documentId: 'DOC999', status: 'created' } }); // Step 4 POST

    const res = await service.submitContractInfo(validPayload as any);

    // Verify GET calls (2 total)
    expect(httpMock.instance.get).toHaveBeenCalledTimes(2);
    const [getStep3Call, getStep4Call] = (httpMock.instance.get as jest.Mock).mock.calls;
    expect(getStep3Call[0]).toContain('/api/v3/form/locazione-3-2-canone-concordato-milano');
    expect(getStep4Call[0]).toContain('/api/v3/form/creazione-documenti-canone-concordato-milano');

    // Verify POST calls (2 total)
    expect(httpMock.instance.post).toHaveBeenCalledTimes(2);
    const [postStep3Call, postStep4Call] = (httpMock.instance.post as jest.Mock).mock.calls;
    expect(postStep3Call[0]).toContain('/api/v3/form/locazione-3-2-canone-concordato-milano');
    expect(postStep4Call[0]).toContain('/api/v3/form/creazione-documenti-canone-concordato-milano');

    // Verify step3_id is injected in step4
    expect(postStep4Call[1].form.step3_id).toEqual({ value: 'FORM123' });

    // Final result
    expect(res.ok).toBe(true);
    expect(res.step3).toEqual({ id: 'FORM123', status: 'ok' });
    expect(res.step4).toEqual({ documentId: 'DOC999', status: 'created' });
  });

  it('submitContractInfo: throws on Step 3 GET error', async () => {
    (httpMock.instance.get as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { error: 'not found' } } });

    await expect(service.submitContractInfo(validPayload as any)).rejects.toThrow('Error fetching Step 3 form schema');
  });

  it('submitContractInfo: throws on Step 3 POST error', async () => {
    (httpMock.instance.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockStep3Schema });

    (httpMock.instance.post as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { error: 'invalid' } } });

    await expect(service.submitContractInfo(validPayload as any)).rejects.toThrow('Error while submitting Dokicasa Step 3 form');
  });

  it('submitContractInfo: throws on Step 3 validation missing required fields', async () => {
    const invalidPayload = {
      ...validPayload,
      fields: {} // missing required fields
    };

    (httpMock.instance.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockStep3Schema });

    await expect(service.submitContractInfo(invalidPayload as any)).rejects.toThrow('Missing required fields for Step 3');

    // Should GET schema but not POST
    expect(httpMock.instance.get).toHaveBeenCalledTimes(1);
    expect(httpMock.instance.post).not.toHaveBeenCalled();
  });

  it('submitContractInfo: throws on Step 4 validation missing required fields', async () => {
    const invalidPayload = {
      ...validPayload,
      creation_fields: {} // missing required fields for step 4
    };

    // Step 3 succeeds
    (httpMock.instance.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockStep3Schema }) // Step 3 GET
      .mockResolvedValueOnce({ data: mockStep4Schema }); // Step 4 GET

    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM123', status: 'ok' } }); // Step 3 POST

    await expect(service.submitContractInfo(invalidPayload as any)).rejects.toThrow('Missing required fields for Step 4');

    // Should call Step 3 GET+POST and Step 4 GET, but not Step 4 POST
    expect(httpMock.instance.get).toHaveBeenCalledTimes(2);
    expect(httpMock.instance.post).toHaveBeenCalledTimes(1);
  });
});
