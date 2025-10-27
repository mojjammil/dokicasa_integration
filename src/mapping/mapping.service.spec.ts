import { MappingService } from './mapping.service';

describe('MappingService', () => {
  const svc = new MappingService();

  it('identity maps step 3 fields', () => {
    const input = { a: 1, b: 'x' };
    expect(svc.mapStep3('milano', 'locazione-3-2-canone', input)).toEqual(input);
  });

  it('identity maps step 4 fields', () => {
    const input = { c: 2 };
    expect(svc.mapStep4('roma', input)).toEqual(input);
    expect(svc.mapStep4('roma', undefined)).toEqual({});
  });
});
