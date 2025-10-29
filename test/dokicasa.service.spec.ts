import { Test, TestingModule } from '@nestjs/testing';
import { DokicasaService } from '../src/dokicasa/dokicasa.service';
import { FormResolverService } from '../src/dokicasa/form-resolver.service';
import { MappingService } from '../src/mapping/mapping.service';
import { HttpService } from '../src/http/http.service';

describe('DokicasaService (legacy folder fixed)', () => {
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

  it('submitContractInfo works (smoke)', async () => {
    // Mock GET responses for form schemas
    (httpMock.instance.get as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          form: {
            tipologia_locazione_11: { question: 'Q1', type: 'varchar', is_required: 1 },
            mobilio_porzione_11: { question: 'Q2', type: 'varchar', is_required: 1 },
            spazi_comuni_31: { question: 'Q3', type: 'varchar', is_required: 1 },
            durata_anni_2: { question: 'Q4', type: 'varchar', is_required: 1 },
            data_decorrenza_locazione_3_1_3_3: { question: 'Q5', type: 'varchar', is_required: 1 },
            importo_mensile_locazione_6: { question: 'Q6', type: 'varchar', is_required: 1 },
            pagamento_canone_3_2: { question: 'Q7', type: 'varchar', is_required: 1 },
            metodo_pagamento_34: { question: 'Q8', type: 'varchar', is_required: 1 },
            domanda_spese_condominiali_1: { question: 'Q9', type: 'varchar', is_required: 1 },
            spese_4_2: { question: 'Q10', type: 'varchar', is_required: 1 },
            domanda_utenze_6: { question: 'Q11', type: 'varchar', is_required: 1 },
            utenze_12: { question: 'Q12', type: 'varchar', is_required: 1 },
            domanda_cauzione_15: { question: 'Q13', type: 'varchar', is_required: 1 },
            cauzione_locazione_12: { question: 'Q14', type: 'varchar', is_required: 1 },
            garanzie_accessorie_5_2: { question: 'Q15', type: 'varchar', is_required: 1 },
            domanda_garante_19: { question: 'Q16', type: 'varchar', is_required: 1 },
            garante_dati_19: { question: 'Q17', type: 'varchar', is_required: 1 },
            domanda_recesso_conduttore_2: { question: 'Q18', type: 'varchar', is_required: 1 },
            recesso_conduttore_1_2: { question: 'Q19', type: 'varchar', is_required: 1 },
            cedolare_secca_6: { question: 'Q20', type: 'varchar', is_required: 1 },
            mobilio_12_2: { question: 'Q21', type: 'varchar', is_required: 1 },
            domanda_elenco_arredi_intero_1: { question: 'Q22', type: 'varchar', is_required: 1 },
            elenco_arredi_lista_intero_1: { question: 'Q23', type: 'varchar', is_required: 1 },
            domanda_elenco_arredi_porzione: { question: 'Q24', type: 'varchar', is_required: 1 },
            elenco_arredi_lista_porzione: { question: 'Q25', type: 'varchar', is_required: 1 },
            comune_immobile_7: { question: 'Q26', type: 'varchar', is_required: 1 },
            blocco_immobile_24: { question: 'Q27', type: 'varchar', is_required: 1 },
            domanda_pertinenze_14_2: { question: 'Q28', type: 'varchar', is_required: 1 },
            pertinenze_16_2: { question: 'Q29', type: 'varchar', is_required: 1 },
            domanda_ape_1: { question: 'Q30', type: 'varchar', is_required: 1 },
            numero_attestato_prestazione_energetica_3: { question: 'Q31', type: 'varchar', is_required: 1 },
            locatore_4_3: { question: 'Q32', type: 'varchar', is_required: 1 },
            conduttore_4_3: { question: 'Q33', type: 'varchar', is_required: 1 },
            domanda_note_50: { question: 'Q34', type: 'varchar', is_required: 1 },
            note_49: { question: 'Q35', type: 'varchar', is_required: 1 },
            luogo_di_sottoscrizione_contratto_4_2: { question: 'Q36', type: 'varchar', is_required: 1 },
            data_di_sottoscrizione_contratto_4_2: { question: 'Q37', type: 'varchar', is_required: 1 },
          }
        }
      }) // Step 3 GET
      .mockResolvedValueOnce({
        data: {
          form: {
            tipologia_locazione_20: { question: 'C1', type: 'varchar', is_required: 1 },
            indicazione_stanza: { question: 'C2', type: 'varchar', is_required: 1 },
            tipologia_contratto_14: { question: 'C3', type: 'varchar', is_required: 1 },
            domanda_arredi: { question: 'C4', type: 'varchar', is_required: 1 },
            domanda_note_22: { question: 'C5', type: 'varchar', is_required: 1 },
            note_34_5_1_1_1_2_1_1: { question: 'C6', type: 'varchar', is_required: 1 },
          }
        }
      }); // Step 4 GET

    // Mock POST responses
    (httpMock.instance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { id: 'FORM1' } })
      .mockResolvedValueOnce({ data: { documentId: 'DOC1' } });

    const res = await service.submitContractInfo({
      city: 'roma',
      contract_type: 'locazione-3-2-canone',
      fields: {
        tipologia_locazione_11: "Il Contratto riguarda l'intero immobile",
        mobilio_porzione_11: "Si, la porzione è arredata",
        spazi_comuni_31: "Si",
        durata_anni_2: '3+2',
        data_decorrenza_locazione_3_1_3_3: '2025-11-01',
        importo_mensile_locazione_6: 1000,
        pagamento_canone_3_2: 5,
        metodo_pagamento_34: 'Tramite bonifico bancario',
        domanda_spese_condominiali_1: 'Non ci sono spese condominiali (o non vengono richieste)',
        spese_4_2: 50,
        domanda_utenze_6: "L'Inquilino si intesterà personalmente tutti i Contratti delle utenze",
        utenze_12: 'Luce',
        domanda_cauzione_15: 'No, il Conduttore non rilascia alcuna cauzione',
        cauzione_locazione_12: 1000,
        garanzie_accessorie_5_2: 'No, non sono previste garanzie accessorie',
        domanda_garante_19: 'No, compilerò successivamente una Scrittura Privata a parte',
        garante_dati_19: [],
        domanda_recesso_conduttore_2: 'Sì, il Conduttore potrà recedere anticipatamente dando il preavviso',
        recesso_conduttore_1_2: 6,
        cedolare_secca_6: 'Si, il Locatore intende avvalersi della Cedolare Secca',
        mobilio_12_2: 'Si, l\'immobile è arredato',
        domanda_elenco_arredi_intero_1: 'Si, vorrei inserire ora il dettaglio degli arredi',
        elenco_arredi_lista_intero_1: 'Divano, tavolo, sedie',
        domanda_elenco_arredi_porzione: 'Si, vorrei inserire ora il dettaglio degli arredi',
        elenco_arredi_lista_porzione: 'Letto, armadio',
        comune_immobile_7: 'Roma',
        blocco_immobile_24: [{ type: 'ABITATIVO', indirizzo: 'Via Roma 1' }],
        domanda_pertinenze_14_2: 'No, l\'immobile non viene locato con pertinenze registrate separatamente',
        pertinenze_16_2: [],
        domanda_ape_1: 'No, non conosco il codice identificativo dell\'Attestato di Prestazione Energetica',
        numero_attestato_prestazione_energetica_3: 'ABC123',
        locatore_4_3: [{ type: 'pf', nome: 'Mario', cognome: 'Rossi' }],
        conduttore_4_3: [{ type: 'pf', nome: 'Giulia', cognome: 'Bianchi' }],
        domanda_note_50: 'No',
        note_49: 'No additional notes',
        luogo_di_sottoscrizione_contratto_4_2: 'Roma',
        data_di_sottoscrizione_contratto_4_2: '2025-10-30'
      },
      creation_fields: {
        tipologia_locazione_20: "Viene affittato l'intero immobile",
        indicazione_stanza: 'Soggiorno',
        tipologia_contratto_14: 'Contratto Agevolato (3/4/5/6 + 2 anni)',
        domanda_arredi: 'No, non è arredato (oppure è parzialmente arredato)',
        domanda_note_22: 'No, va bene cosi',
        note_34_5_1_1_1_2_1_1: 'No additional notes'
      }
    } as any);

    expect(res.ok).toBe(true);
  });
});
