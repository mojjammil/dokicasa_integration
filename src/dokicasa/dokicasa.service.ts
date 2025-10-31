import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { FormResolverService } from './form-resolver.service';
import { SubmitClientPayloadDto } from './dto/submit-client-payload.dto';
import { MappingService } from '../mapping/mapping.service';
import { City, EXTERNAL_IDS } from '../mapping/external-ids';

type ContractType =
  | 'locazione-3-2-canone'
  | 'locazione-transitoria-canone'
  | 'locazione-studenti-universitari';

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

  private validateRequired(formSchema: Record<string, any>): string[] {
    const missing: string[] = [];
    for (const [fieldId, fieldMeta] of Object.entries(formSchema)) {
      if (fieldMeta.is_required && (!fieldMeta.value || fieldMeta.value === '')) {
        missing.push(fieldId);
      }
    }
    return missing;
  }

  async submitContractInfo(payload: SubmitClientPayloadDto) {
    const city = payload.city as City;
    const contractType = payload.contract_type as ContractType;
    const headers = this.headers();

    const step3Url = this.resolver.resolveStep3Url(city, contractType);
    const step4Url = this.resolver.resolveStep4Url(city);

    const externalId = payload.external_id || EXTERNAL_IDS[city];

    let step3Schema: Record<string, any>;
    try {
      const getResponse = await this.http.instance.get(step3Url, { headers });
      step3Schema = getResponse.data?.form || getResponse.data || {};
    } catch (e: any) {
      throw new InternalServerErrorException({
        code: 'DOKICASA_GET_ERROR',
        message: 'Error fetching Step 3 form schema',
        detail: e?.response?.data || e?.message,
        endpoint: step3Url,
      });
    }

    const mergedStep3 = this.mapping.mergeValues(step3Schema, payload.fields || {});

    const missingStep3 = this.validateRequired(mergedStep3);
    if (missingStep3.length) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields for Step 3',
        details: {
          step3: { missing: missingStep3 },
        },
      });
    }

    let step3Data: any;
    try {
      const step3Body = {
        form: mergedStep3,
        metadata: {
          external_id: externalId,
        },
      };
      const postResponse = await this.http.instance.post(step3Url, step3Body, { headers });
      step3Data = postResponse.data;
    } catch (e: any) {
      const errorData = e?.response?.data;
      // Dokicasa sometimes returns "Validation failed" with has_errors:false when fields are filtered
      // Check if it's actually a field filtering issue vs real validation error
      if (errorData?.messages?.has_errors === false && errorData?.messages?.errors?.length === 0) {
        throw new BadRequestException({
          code: 'DOKICASA_FILTERED_FIELDS',
          message: 'Dokicasa filtered some fields from your request. You may have sent fields that don\'t exist in the schema or don\'t match conditional dependencies.',
          detail: errorData,
          endpoint: step3Url,
        });
      }
      throw new InternalServerErrorException({
        code: 'DOKICASA_FORM_ERROR',
        message: 'Error while submitting Dokicasa Step 3 form',
        detail: errorData || e?.message,
        endpoint: step3Url,
      });
    }

    let step4Schema: Record<string, any>;
    try {
      const getResponse = await this.http.instance.get(step4Url, { headers });
      step4Schema = getResponse.data?.form || getResponse.data || {};
    } catch (e: any) {
      throw new InternalServerErrorException({
        code: 'DOKICASA_GET_ERROR',
        message: 'Error fetching Step 4 form schema',
        detail: e?.response?.data || e?.message,
        endpoint: step4Url,
      });
    }

    const mergedStep4 = this.mapping.mergeValues(step4Schema, payload.creation_fields || {});

    const missingStep4 = this.validateRequired(mergedStep4);
    if (missingStep4.length) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields for Step 4',
        details: {
          step4: { missing: missingStep4 },
        },
      });
    }

    let step4Data: any;
    try {
      const step4Body = {
        form: mergedStep4,
        metadata: {
          external_id: externalId,
        },
      };

      const postResponse = await this.http.instance.post(step4Url, step4Body, { headers });
      step4Data = postResponse.data;
    } catch (e: any) {
      const errorData = e?.response?.data;
      // Dokicasa sometimes returns "Validation failed" with has_errors:false when fields are filtered
      // Check if it's actually a field filtering issue vs real validation error
      if (errorData?.messages?.has_errors === false && errorData?.messages?.errors?.length === 0) {
        throw new BadRequestException({
          code: 'DOKICASA_FILTERED_FIELDS',
          message: 'Dokicasa filtered some fields from your request. You may have sent fields that don\'t exist in the schema or don\'t match conditional dependencies.',
          detail: errorData,
          endpoint: step4Url,
        });
      }
      throw new InternalServerErrorException({
        code: 'DOKICASA_CREATION_ERROR',
        message: 'Error while creating Dokicasa documents (Step 4)',
        detail: errorData || e?.message,
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
