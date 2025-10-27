import { FormResolverService } from './form-resolver.service';

describe('FormResolverService', () => {
  const svc = new FormResolverService();

  it('resolves Step 3 URLs for Milano', () => {
    expect(svc.resolveStep3Url('milano', 'locazione-3-2-canone'))
      .toContain('/api/v3/form/locazione-3-2-canone-concordato-milano');
    expect(svc.resolveStep3Url('milano', 'locazione-transitoria-canone'))
      .toContain('/api/v3/form/locazione-transitoria-canone-concordato-milano');
    expect(svc.resolveStep3Url('milano', 'locazione-studenti-universitari'))
      .toContain('/api/v3/form/locazione-studenti-universitari-milano');
  });

  it('resolves Step 3 URLs for Roma', () => {
    expect(svc.resolveStep3Url('roma', 'locazione-3-2-canone'))
      .toContain('/api/v3/form/locazione-canone-concordato-roma');
    expect(svc.resolveStep3Url('roma', 'locazione-transitoria-canone'))
      .toContain('/api/v3/form/locazione-transitoria-canone-concordato-roma');
    expect(svc.resolveStep3Url('roma', 'locazione-studenti-universitari'))
      .toContain('/api/v3/form/locazione-studenti-universitari-roma');
  });

  it('resolves Step 3 URLs for Torino', () => {
    expect(svc.resolveStep3Url('torino', 'locazione-3-2-canone'))
      .toContain('/api/v3/form/locazione-canone-concordato-torino');
    expect(svc.resolveStep3Url('torino', 'locazione-transitoria-canone'))
      .toContain('/api/v3/form/locazione-transitoria-canone-concordato-torino');
    expect(svc.resolveStep3Url('torino', 'locazione-studenti-universitari'))
      .toContain('/api/v3/form/locazione-studenti-universitari-torino');
  });

  it('resolves Step 4 URLs', () => {
    expect(svc.resolveStep4Url('milano')).toContain('/api/v3/form/creazione-documenti-canone-concordato-milano');
    expect(svc.resolveStep4Url('roma')).toContain('/api/v3/form/creazione-documenti-canone-concordato-roma');
    expect(svc.resolveStep4Url('torino')).toContain('/api/v3/form/creazione-documenti-canone-concordato-torino');
  });
});
