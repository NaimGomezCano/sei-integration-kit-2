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
  ]
}
