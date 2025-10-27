import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { FormResolverService } from './form-resolver.service';
import { SubmitClientPayloadDto } from './dto/submit-client-payload.dto';
import { MappingService } from '../mapping/mapping.service';
import { REQUIRED_REGISTRY, REQUIRED_STEP4_BY_CITY, City, ContractType } from '../mapping/required-fields';

@Injectable()
export class DokicasaService {
  constructor(
    private readonly http: HttpService,
    private readonly resolver: FormResolverService,
    private readonly mapping: MappingService,
  ) {}

  private headers() {
    const token = process.env.DOKICASA_TOKEN;
    if (!token) throw new Error('Missing DOKICASA_TOKEN env var');
    return { Authorization: `Bearer ${token}` };
  }

  private spec(city: City, contractType: ContractType) {
    const s = REQUIRED_REGISTRY[city]?.[contractType];
    if (!s) throw new BadRequestException(`Unsupported combination city=${city} contract_type=${contractType}`);
    return s;
  }

  private missing(requiredList: string[], provided: Record<string, any>): string[] {
    return requiredList.filter((f) => !(f in provided) || provided[f] === undefined || provided[f] === null || provided[f] === '');
  }

  /** Validate ➜ Step 3 ➜ Validate ➜ Step 4 */
  async submitContractInfo(payload: SubmitClientPayloadDto) {
    const city = payload.city as City;
    const contractType = payload.contract_type as ContractType;
    const headers = this.headers();

    const step3Url = this.resolver.resolveStep3Url(city, contractType);
    const step4Url = this.resolver.resolveStep4Url(city);

    // Map data
    const mappedStep3 = this.mapping.mapStep3(city, contractType, payload.fields || {});
    const mappedStep4 = this.mapping.mapStep4(city, payload.creation_fields || {});

    // Step 3 Validation
    const spec = this.spec(city, contractType);
    const miss3 = this.missing(spec.step3, mappedStep3);

    if (miss3.length) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields for Step 3',
        details: {
          step3: { missing: miss3 },
        },
      });
    }

    // Step 3 API Call
    let step3Data: any;
    try {
      const r = await this.http.instance.post(step3Url, mappedStep3, { headers });
      step3Data = r.data;
    } catch (e: any) {
      throw new InternalServerErrorException({
        code: 'DOKICASA_FORM_ERROR',
        message: 'Error while submitting Dokicasa Step 3 form',
        detail: e?.response?.data || e?.message,
        endpoint: step3Url,
      });
    }

    // Step 4 Validation
    const miss4 = this.missing(REQUIRED_STEP4_BY_CITY[city], mappedStep4);

    if (miss4.length) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields for Step 4',
        details: {
          step4: { missing: miss4 },
        },
      });
    }

    // Step 4: inject step3 id if present
    const step3Id =
      step3Data?.id ||
      step3Data?.uuid ||
      step3Data?.formId ||
      undefined;

    const step4Payload = {
      ...mappedStep4,
      ...(step3Id ? { step3_id: step3Id } : {}),
    };

    let step4Data: any;
    try {
      const r = await this.http.instance.post(step4Url, step4Payload, { headers });
      step4Data = r.data;
    } catch (e: any) {
      throw new InternalServerErrorException({
        code: 'DOKICASA_CREATION_ERROR',
        message: 'Error while creating Dokicasa documents (Step 4)',
        detail: e?.response?.data || e?.message,
        endpoint: step4Url,
      });
    }

    return {
      ok: true,
      city,
      contract_type: contractType,
      step3: step3Data,
      step4: step4Data,
    };
  }
}
