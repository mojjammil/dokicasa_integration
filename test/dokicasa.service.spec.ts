import { Test, TestingModule } from '@nestjs/testing';
import { DokicasaService } from '../src/dokicasa/dokicasa.service';
import { FormResolverService } from '../src/dokicasa/form-resolver.service';
import { MappingService } from '../src/mapping/mapping.service';
import { HttpService } from '../src/http/http.service';

describe('DokicasaService (legacy folder fixed)', () => {
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

  it('submitContractInfo works (smoke)', async () => {
    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM1' } })
      .mockResolvedValueOnce({ data: { documentId: 'DOC1' } });

    const res = await service.submitContractInfo({
      city: 'roma',
      contract_type: 'locazione-3-2-canone',
      fields: {
        tipologia_locazione_11: "Il Contratto riguarda l'intero immobile",
        durata_anni_2: '3+2',
        data_decorrenza_locazione_3_1_3_3: '2025-11-01',
        importo_mensile_locazione_6: 1000,
        pagamento_canone_3_2: 5,
        metodo_pagamento_34: 'Tramite bonifico bancario',
        domanda_spese_condominiali_1: 'Non ci sono spese condominiali (o non vengono richieste)',
        domanda_utenze_6: "L'Inquilino si intesterà personalmente tutti i Contratti delle utenze",
        domanda_cauzione_15: 'No, il Conduttore non rilascia alcuna cauzione',
        garanzie_accessorie_5_2: 'No, non sono previste garanzie accessorie',
        domanda_recesso_conduttore_2: 'Sì, il Conduttore potrà recedere anticipatamente dando il preavviso',
        recesso_conduttore_1_2: '6 mesi',
        cedolare_secca_6: 'Si, il Locatore intende avvalersi della Cedolare Secca',
        domanda_ape_1: 'No, non conosco il codice identificativo dell\'Attestato di Prestazione Energetica',
        locatore_4_3: [{ type: 'pf', nome: 'Mario', cognome: 'Rossi' }],
        conduttore_4_3: [{ type: 'pf', nome: 'Giulia', cognome: 'Bianchi' }],
        blocco_immobile_24: [{ type: 'ABITATIVO', indirizzo: 'Via Roma 1' }],
        luogo_di_sottoscrizione_contratto_4_2: 'Roma',
        data_di_sottoscrizione_contratto_4_2: '2025-10-30'
      },
      creation_fields: {
        tipologia_locazione_20: "Viene affittato l'intero immobile",
        tipologia_contratto_14: 'Contratto Agevolato (3/4/5/6 + 2 anni)',
        domanda_arredi: 'No, non è arredato (oppure è parzialmente arredato)',
        domanda_note_22: 'No, va bene cosi'
      }
    } as any);

    expect(res.ok).toBe(true);
  });
});
