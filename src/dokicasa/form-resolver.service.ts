import { Injectable, BadRequestException } from '@nestjs/common';

type City = 'milano' | 'roma' | 'torino';
type ContractType =
  | 'locazione-3-2-canone'
  | 'locazione-transitoria-canone'
  | 'locazione-studenti-universitari';

@Injectable()
export class FormResolverService {
  private readonly base = (process.env.DOKICASA_BASE_URL || 'https://app.dokicasa.it').replace(/\/+$/, '');

  resolveStep3Url(city: City, contractType: ContractType): string {
    const v3 = `${this.base}/api/v3/form`;

    if (city === 'milano') {
      const map = {
        'locazione-3-2-canone': `${v3}/locazione-3-2-canone-concordato-milano`,
        'locazione-transitoria-canone': `${v3}/locazione-transitoria-canone-concordato-milano`,
        'locazione-studenti-universitari': `${v3}/locazione-studenti-universitari-milano`,
      } as const;
      return map[contractType] ?? this.fail(city, contractType);
    }

    if (city === 'roma') {
      const map = {
        'locazione-3-2-canone': `${v3}/locazione-canone-concordato-roma`,
        'locazione-transitoria-canone': `${v3}/locazione-transitoria-canone-concordato-roma`,
        'locazione-studenti-universitari': `${v3}/locazione-studenti-universitari-roma`,
      } as const;
      return map[contractType] ?? this.fail(city, contractType);
    }

    if (city === 'torino') {
      const map = {
        'locazione-3-2-canone': `${v3}/locazione-canone-concordato-torino`,
        'locazione-transitoria-canone': `${v3}/locazione-transitoria-canone-concordato-torino`,
        'locazione-studenti-universitari': `${v3}/locazione-studenti-universitari-torino`,
      } as const;
      return map[contractType] ?? this.fail(city, contractType);
    }

    return this.fail(city, contractType);
  }

  resolveStep4Url(city: City): string {
    const v3 = `${this.base}/api/v3/form`;
    return `${v3}/creazione-documenti-canone-concordato-${city}`;
  }

  private fail(city: string, ct: string): never {
    throw new BadRequestException(`Unsupported combination city=${city} contract_type=${ct}`);
  }
}
