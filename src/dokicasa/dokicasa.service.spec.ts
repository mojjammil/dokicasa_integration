import { Test, TestingModule } from '@nestjs/testing';
import { DokicasaService } from './dokicasa.service';
import { FormResolverService } from './form-resolver.service';
import { MappingService } from '../mapping/mapping.service';
import { HttpService } from '../http/http.service';

describe('DokicasaService', () => {
  let service: DokicasaService;

  const httpMock = {
    instance: {
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
      tipologia_locazione_11_5: "Il Contratto riguarda l'intero immobile",
      durata_anni_2_6: '3+2',
      data_decorrenza_locazione_3_1_3_3_6: '2025-11-01',
      importo_mensile_locazione_6_5: 1000,
      pagamento_canone_3_2_6: 5,
      metodo_pagamento_34_6: 'Tramite bonifico bancario',
      domanda_spese_condominiali_1_5: 'Non ci sono spese condominiali (o non vengono richieste)',
      domanda_utenze_6_3: "L'Inquilino si intesterà personalmente tutti i Contratti delle utenze",
      domanda_cauzione_15_5: 'No, il Conduttore non rilascia alcuna cauzione',
      garanzie_accessorie_5_2_6: 'No, non sono previste garanzie accessorie',
      domanda_recesso_conduttore_2_4: 'Sì, il Conduttore potrà recedere anticipatamente dando il preavviso',
      cedolare_secca_6_7: 'Si, il Locatore intende avvalersi della Cedolare Secca',
      domanda_ape_1_5: 'No, non conosco il codice identificativo dell\'Attestato di Prestazione Energetica',
      locatore_4_3_6: [{ type: 'pf', nome: 'Mario', cognome: 'Rossi' }],
      conduttore_4_3_6: [{ type: 'pf', nome: 'Giulia', cognome: 'Bianchi' }],
      blocco_immobile_29: [{ type: 'ABITATIVO', indirizzo: 'Via Verdi 1' }],
      luogo_di_sottoscrizione_contratto_4_2_6: 'Milano',
      data_di_sottoscrizione_contratto_4_2_6: '2025-10-30'
    },
    creation_fields: {
      tipologia_locazione_20_4: "Viene affittato l'intero immobile",
      tipologia_contratto_14_5: 'Contratto Agevolato (3/4/5/6 + 2 anni)',
      domanda_arredi_12: 'No, non è arredato (oppure è parzialmente arredato)',
      domanda_note_22_5: 'No, va bene cosi'
    }
  };

  it('submitContractInfo: success calls Step3 then Step4 with step3_id', async () => {
    // Step 3 mock response
    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM123', status: 'ok' } }) // step 3
      .mockResolvedValueOnce({ data: { documentId: 'DOC999', status: 'created' } }); // step 4

    const res = await service.submitContractInfo(validPayload as any);

    // verify two calls
    expect(httpMock.instance.post).toHaveBeenCalledTimes(2);
    const [step3Call, step4Call] = (httpMock.instance.post as jest.Mock).mock.calls;

    expect(step3Call[0]).toContain('/api/v3/form/locazione-3-2-canone-concordato-milano');
    expect(step4Call[0]).toContain('/api/v3/form/creazione-documenti-canone-concordato-milano');

    // step4 payload must include step3_id
    expect(step4Call[1]).toMatchObject(expect.objectContaining({ step3_id: 'FORM123' }));

    // final result
    expect(res.ok).toBe(true);
    expect(res.step3).toEqual({ id: 'FORM123', status: 'ok' });
    expect(res.step4).toEqual({ documentId: 'DOC999', status: 'created' });
  });

  it('submitContractInfo: throws on Step 3 API error', async () => {
    (httpMock.instance.post as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { error: 'invalid' } } });

    await expect(service.submitContractInfo(validPayload as any)).rejects.toThrow();
  });

  it('submitContractInfo: throws on Step 4 API error', async () => {
    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM123' } }) // step 3
      .mockRejectedValueOnce({ response: { data: { error: 'creation failed' } } }); // step 4

    await expect(service.submitContractInfo(validPayload as any)).rejects.toThrow();
  });

  it('submitContractInfo: throws on Step 3 validation missing fields', async () => {
    const invalidPayload = {
      ...validPayload,
      fields: {} // missing required fields
    };

    await expect(service.submitContractInfo(invalidPayload as any)).rejects.toThrow();

    // Should not call any APIs
    expect(httpMock.instance.post).not.toHaveBeenCalled();
  });

  it('submitContractInfo: throws on Step 4 validation missing fields', async () => {
    const invalidPayload = {
      ...validPayload,
      creation_fields: {} // missing required fields for step 4
    };

    // Step 3 should succeed
    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM123', status: 'ok' } });

    await expect(service.submitContractInfo(invalidPayload as any)).rejects.toThrow();

    // Should call Step 3 API but not Step 4
    expect(httpMock.instance.post).toHaveBeenCalledTimes(1);
  });
});
