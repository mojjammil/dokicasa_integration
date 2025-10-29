import { Injectable } from '@nestjs/common';

@Injectable()
export class MappingService {
  /**
   * Merge client values into Dokicasa form schema
   * @param formSchema - The form structure from GET /api/v3/form/{slug}
   * @param clientValues - The values from the client request
   * @returns Merged form with populated values
   */
  mergeValues(
    formSchema: Record<string, any>,
    clientValues: Record<string, any>,
  ): Record<string, any> {
    const merged: Record<string, any> = {};

    for (const [fieldId, fieldMeta] of Object.entries(formSchema)) {
      merged[fieldId] = {
        ...fieldMeta,
        value: clientValues[fieldId] ?? '',
      };
    }

    return merged;
  }
}
