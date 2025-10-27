import { Injectable } from '@nestjs/common';
import { City, ContractType } from './required-fields';

@Injectable()
export class MappingService {
  /** Identity mapper for Step 3 (replace with your own transforms later) */
  mapStep3(_city: City, _type: ContractType, fields: Record<string, any>) {
    return fields || {};
  }
  /** Identity mapper for Step 4 (replace with your own transforms later) */
  mapStep4(_city: City, creationFields?: Record<string, any>) {
    return creationFields || {};
  }
}
