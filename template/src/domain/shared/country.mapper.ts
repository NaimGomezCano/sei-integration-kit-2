import { DomainError } from '@/core/errors/domain.error'

type CountryMapping = {
  Pais: string
  sf_country: string
  sap_country: string
}

export class CountryMapper {
  public translateSfToSapCode(salesforceCode: string): string {
    const match = this.countryMappings.find((entry) => entry['sf_country'] === salesforceCode)
    if (!match) {
      throw new DomainError(`El código de país de Salesforce "${salesforceCode}" no está mapeado a ningún código SAP válido.`)
    }
    return match['sap_country']
  }

  public translateSapToSfCode(sapCountryCode: string): string {
    const match = this.countryMappings.find((entry) => entry['sap_country'] === sapCountryCode)
    if (!match) {
      throw new DomainError(`El código de país SAP "${sapCountryCode}" no está mapeado a ningún código de país de Salesforce válido.`)
    }
    return match['sf_country']
  }

  countryMappings: CountryMapping[] = [
    {
      Pais: 'España',
      sf_country: 'Spain',
      sap_country: 'ES',
    },
    {
      Pais: 'Estados Unidos',
      sf_country: 'United States',
      sap_country: 'US',
    },
    {
      Pais: 'México',
      sf_country: 'Mexico',
      sap_country: 'MX',
    },
    {
      Pais: 'Argentina',
      sf_country: 'Argentina',
      sap_country: 'AR',
    },
    {
      Pais: 'Brasil',
      sf_country: 'Brazil',
      sap_country: 'BR',
    },
    {
      Pais: 'Canadá',
      sf_country: 'Canada',
      sap_country: 'CA',
    },
    {
      Pais: 'Alemania',
      sf_country: 'Germany',
      sap_country: 'DE',
    },
    {
      Pais: 'Francia',
      sf_country: 'France',
      sap_country: 'FR',
    },
    {
      Pais: 'Italia',
      sf_country: 'Italy',
      sap_country: 'IT',
    },
    {
      Pais: 'Reino Unido',
      sf_country: 'United Kingdom',
      sap_country: 'GB',
    },
    {
      Pais: 'Japón',
      sf_country: 'Japan',
      sap_country: 'JP',
    },
    {
      Pais: 'China',
      sf_country: 'China',
      sap_country: 'CN',
    },
    {
      Pais: 'India',
      sf_country: 'India',
      sap_country: 'IN',
    },
    {
      Pais: 'Australia',
      sf_country: 'Australia',
      sap_country: 'AU',
    },
    {
      Pais: 'Chile',
      sf_country: 'Chile',
      sap_country: 'CL',
    },
    {
      Pais: 'Colombia',
      sf_country: 'Colombia',
      sap_country: 'CO',
    },
    {
      Pais: 'Perú',
      sf_country: 'Peru',
      sap_country: 'PE',
    },
    {
      Pais: 'Uruguay',
      sf_country: 'Uruguay',
      sap_country: 'UY',
    },
    {
      Pais: 'Venezuela',
      sf_country: 'Venezuela',
      sap_country: 'VE',
    },
    {
      Pais: 'Sudáfrica',
      sf_country: 'South Africa',
      sap_country: 'ZA',
    },
    {
      Pais: 'Rusia',
      sf_country: 'Russia',
      sap_country: 'RU',
    },
    {
      Pais: 'Portugal',
      sf_country: 'Portugal',
      sap_country: 'PT',
    },
    {
      Pais: 'Suiza',
      sf_country: 'Switzerland',
      sap_country: 'CH',
    },
    {
      Pais: 'Bélgica',
      sf_country: 'Belgium',
      sap_country: 'BE',
    },
    {
      Pais: 'Países Bajos',
      sf_country: 'Netherlands',
      sap_country: 'NL',
    },
    {
      Pais: 'Noruega',
      sf_country: 'Norway',
      sap_country: 'NO',
    },
    {
      Pais: 'Suecia',
      sf_country: 'Sweden',
      sap_country: 'SE',
    },
    {
      Pais: 'Dinamarca',
      sf_country: 'Denmark',
      sap_country: 'DK',
    },
    {
      Pais: 'Finlandia',
      sf_country: 'Finland',
      sap_country: 'FI',
    },
    {
      Pais: 'Nueva Jersey',
      sf_country: 'New Jersey',
      sap_country: 'NJ',
    },
  ]
}
