import { IsIn, IsObject, IsOptional } from 'class-validator';

export class SubmitClientPayloadDto {
  @IsIn(['milano', 'roma', 'torino'], { message: 'city must be one of milano|roma|torino' })
  city!: 'milano' | 'roma' | 'torino';

  @IsIn(['locazione-3-2-canone', 'locazione-transitoria-canone', 'locazione-studenti-universitari'])
  contract_type!:
    | 'locazione-3-2-canone'
    | 'locazione-transitoria-canone'
    | 'locazione-studenti-universitari';

  /** Step 3 fields (Dokicasa field IDs). Variable by city/type. */
  @IsObject()
  fields!: Record<string, any>;

  /** Optional: Step 4 fields (Dokicasa "creation" field IDs). */
  @IsOptional()
  @IsObject()
  creation_fields?: Record<string, any>;
}
