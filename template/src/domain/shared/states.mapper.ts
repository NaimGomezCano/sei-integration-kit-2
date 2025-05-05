import { DomainError } from '@/core/errors/domain.error'

type StateMapping = {
  Provincia: string
  sf_state: string
  sap_state: string | null
  sap_country: string
}
export class StatesMapper {
  public translateSfToSapCode(salesforceCode: string): string {
    const match = this.stateMappings.find((entry) => entry['sf_state'] === salesforceCode)
    if (!match || match['sap_state'] === null) {
      throw new DomainError(`El código de Salesforce "${salesforceCode}" no está mapeado a ningún código SAP válido.`)
    }
    return match['sap_state']
  }

  public translateSapToSfCode(sapStateCode: string): string {
    const match = this.stateMappings.find((entry) => entry['sap_state'] === sapStateCode)
    if (!match || match['sf_state'] === null) {
      throw new DomainError(`El código de sap_state "${sapStateCode}" no está mapeado a ningún código de estado de Salesforce válido.`)
    }
    return match['sf_state']
  }

  stateMappings: StateMapping[] = [
    {
      Provincia: 'Alicante',
      sf_state: 'A',
      sap_state: '03',
      sap_country: 'ES',
    },
    {
      Provincia: 'Albacete',
      sf_state: 'AB',
      sap_state: '02',
      sap_country: 'ES',
    },
    {
      Provincia: 'Almería',
      sf_state: 'AL',
      sap_state: '04',
      sap_country: 'ES',
    },
    {
      Provincia: 'Ávila',
      sf_state: 'AV',
      sap_state: '05',
      sap_country: 'ES',
    },
    {
      Provincia: 'Barcelona',
      sf_state: 'B',
      sap_state: '08',
      sap_country: 'ES',
    },
    {
      Provincia: 'Badajoz',
      sf_state: 'BA',
      sap_state: '06',
      sap_country: 'ES',
    },
    {
      Provincia: 'Bizkaia',
      sf_state: 'BI',
      sap_state: '48',
      sap_country: 'ES',
    },
    {
      Provincia: 'Burgos',
      sf_state: 'BU',
      sap_state: '09',
      sap_country: 'ES',
    },
    {
      Provincia: 'A Coruña',
      sf_state: 'C',
      sap_state: '15',
      sap_country: 'ES',
    },
    {
      Provincia: 'Cádiz',
      sf_state: 'CA',
      sap_state: '11',
      sap_country: 'ES',
    },
    {
      Provincia: 'Cáceres',
      sf_state: 'CC',
      sap_state: '10',
      sap_country: 'ES',
    },
    {
      Provincia: 'Córdoba',
      sf_state: 'CO',
      sap_state: '14',
      sap_country: 'ES',
    },
    {
      Provincia: 'Ciudad Real',
      sf_state: 'CR',
      sap_state: '13',
      sap_country: 'ES',
    },
    {
      Provincia: 'Castellón',
      sf_state: 'CS',
      sap_state: '12',
      sap_country: 'ES',
    },
    {
      Provincia: 'Cuenca',
      sf_state: 'CU',
      sap_state: '16',
      sap_country: 'ES',
    },
    {
      Provincia: 'Las Palmas',
      sf_state: 'GC',
      sap_state: '35',
      sap_country: 'ES',
    },
    {
      Provincia: 'Girona',
      sf_state: 'GI',
      sap_state: '17',
      sap_country: 'ES',
    },
    {
      Provincia: 'Granada',
      sf_state: 'GR',
      sap_state: '18',
      sap_country: 'ES',
    },
    {
      Provincia: 'Guadalajara',
      sf_state: 'GU',
      sap_state: '19',
      sap_country: 'ES',
    },
    {
      Provincia: 'Huelva',
      sf_state: 'H',
      sap_state: '21',
      sap_country: 'ES',
    },
    {
      Provincia: 'Huesca',
      sf_state: 'HU',
      sap_state: '22',
      sap_country: 'ES',
    },
    {
      Provincia: 'Jaén',
      sf_state: 'J',
      sap_state: '23',
      sap_country: 'ES',
    },
    {
      Provincia: 'Lleida',
      sf_state: 'L',
      sap_state: '25',
      sap_country: 'ES',
    },
    {
      Provincia: 'León',
      sf_state: 'LE',
      sap_state: '24',
      sap_country: 'ES',
    },
    {
      Provincia: 'La Rioja',
      sf_state: 'LO',
      sap_state: '26',
      sap_country: 'ES',
    },
    {
      Provincia: 'Lugo',
      sf_state: 'LU',
      sap_state: '27',
      sap_country: 'ES',
    },
    {
      Provincia: 'Madrid',
      sf_state: 'M',
      sap_state: '28',
      sap_country: 'ES',
    },
    {
      Provincia: 'Málaga',
      sf_state: 'MA',
      sap_state: '29',
      sap_country: 'ES',
    },
    {
      Provincia: 'Murcia',
      sf_state: 'MU',
      sap_state: '30',
      sap_country: 'ES',
    },
    {
      Provincia: 'Navarra',
      sf_state: 'NA',
      sap_state: '31',
      sap_country: 'ES',
    },
    {
      Provincia: 'Asturias',
      sf_state: 'O',
      sap_state: '33',
      sap_country: 'ES',
    },
    {
      Provincia: 'Ourense',
      sf_state: 'OR',
      sap_state: '32',
      sap_country: 'ES',
    },
    {
      Provincia: 'Palencia',
      sf_state: 'P',
      sap_state: '34',
      sap_country: 'ES',
    },
    {
      Provincia: 'Baleares',
      sf_state: 'PM',
      sap_state: '07',
      sap_country: 'ES',
    },
    {
      Provincia: 'Pontevedra',
      sf_state: 'PO',
      sap_state: '36',
      sap_country: 'ES',
    },
    {
      Provincia: 'Cantabria',
      sf_state: 'S',
      sap_state: '39',
      sap_country: 'ES',
    },
    {
      Provincia: 'Salamanca',
      sf_state: 'SA',
      sap_state: '37',
      sap_country: 'ES',
    },
    {
      Provincia: 'Sevilla',
      sf_state: 'SE',
      sap_state: '41',
      sap_country: 'ES',
    },
    {
      Provincia: 'Segovia',
      sf_state: 'SG',
      sap_state: '40',
      sap_country: 'ES',
    },
    {
      Provincia: 'Soria',
      sf_state: 'SO',
      sap_state: '42',
      sap_country: 'ES',
    },
    {
      Provincia: 'Gipuzkoa',
      sf_state: 'SS',
      sap_state: '20',
      sap_country: 'ES',
    },
    {
      Provincia: 'Tarragona',
      sf_state: 'T',
      sap_state: '43',
      sap_country: 'ES',
    },
    {
      Provincia: 'Teruel',
      sf_state: 'TE',
      sap_state: '44',
      sap_country: 'ES',
    },
    {
      Provincia: 'Santa Cruz de Tenerife',
      sf_state: 'TF',
      sap_state: '38',
      sap_country: 'ES',
    },
    {
      Provincia: 'Toledo',
      sf_state: 'TO',
      sap_state: '45',
      sap_country: 'ES',
    },
    {
      Provincia: 'Valencia',
      sf_state: 'V',
      sap_state: '46',
      sap_country: 'ES',
    },
    {
      Provincia: 'Valladolid',
      sf_state: 'VA',
      sap_state: '47',
      sap_country: 'ES',
    },
    {
      Provincia: 'Álava',
      sf_state: 'VI',
      sap_state: '01',
      sap_country: 'ES',
    },
    {
      Provincia: 'Zaragoza',
      sf_state: 'Z',
      sap_state: '50',
      sap_country: 'ES',
    },
    {
      Provincia: 'Zamora',
      sf_state: 'ZA',
      sap_state: '49',
      sap_country: 'ES',
    },
    {
      Provincia: 'Ceuta',
      sf_state: 'CE',
      sap_state: '51',
      sap_country: 'ES',
    },
    {
      Provincia: 'Melilla',
      sf_state: 'ML',
      sap_state: '52',
      sap_country: 'ES',
    },
  ]
}
