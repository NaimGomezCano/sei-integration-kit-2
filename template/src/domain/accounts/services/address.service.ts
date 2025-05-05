// services/address.service.ts
import { DomainError } from '@/core/errors/domain.error'
import { SapBPAddresses } from '@/domain/shared/schemas/sap-business-partner.schema'
import { StatesMapper } from '../../shared/states.mapper'
import { SfCreateClient, SfUpdateClient } from '../schemas/salesforce-client.schema'

export class AddressService {
  private readonly statesMapper = new StatesMapper()

  public getBillToAddress(addressName: string, existing: (typeof SapBPAddresses.Type)[] | null | undefined): typeof SapBPAddresses.Type | undefined {
    return existing?.find((a) => a.AddressType === 'bo_BillTo' && a.AddressName === addressName)
  }

  public getShipToAddress(addressName: string, existing: (typeof SapBPAddresses.Type)[] | null | undefined): typeof SapBPAddresses.Type | undefined {
    return existing?.find((a) => a.AddressType === 'bo_ShipTo' && a.AddressName === addressName)
  }

  public getRowNumForUpdate(addressName: string | null | undefined, existing: (typeof SapBPAddresses.Type)[] | null | undefined, type: 'bo_BillTo' | 'bo_ShipTo'): number | undefined {
    const found = existing?.find((a) => a.AddressType === type && a.AddressName === addressName)

    if (!found) {
      return undefined
    }

    if (found.RowNum === null || found.RowNum === undefined) {
      return undefined
    }

    return found.RowNum
  }

  public buildBillToAddress(input: typeof SfUpdateClient.Draft, addressName: string, cardCode: string, rowNum?: number | undefined): typeof SapBPAddresses.Type {
    const updated = {
      Street: input.BillToStreet,
      ZipCode: input.BillToZipCode,
      City: input.BillToCity,
      Country: input.BillToCountry,
      State: this.statesMapper.translateSfToSapCode(input.BillToState!),
    }

    const address: typeof SapBPAddresses.Draft = {
      AddressType: 'bo_BillTo',
      BPCode: cardCode,
      ...updated,
      AddressName: addressName,
    }

    if (rowNum != null) {
      address.RowNum = rowNum
    }

    const billTo: typeof SapBPAddresses.Type = SapBPAddresses.validateDraft(address)

    return billTo
  }

  public buildShipToAddress(input: typeof SfUpdateClient.Draft | typeof SfCreateClient.Type, addressName: string, cardCode: string, rowNum?: number | undefined): typeof SapBPAddresses.Type {
    const updated = {
      Street: input.ShipToStreet,
      ZipCode: input.ShipToZipCode,
      City: input.ShipToCity,
      Country: input.ShipToCountry,
      State: this.statesMapper.translateSfToSapCode(input.ShipToState!),
    }

    const address: typeof SapBPAddresses.Draft = {
      AddressType: 'bo_ShipTo',
      BPCode: cardCode,
      ...updated,
      AddressName: addressName,
    }

    if (rowNum != null) {
      address.RowNum = rowNum
    }

    const shipTo: typeof SapBPAddresses.Type = SapBPAddresses.validateDraft(address)

    return shipTo
  }

  public isAddressProvided(address: Record<string, any>): boolean {
    return Object.values(address).some((val) => val != null)
  }

  public validateBillToAddress(input: any) {
    const { BillToStreet, BillToZipCode, BillToCity, BillToCountry, BillToState } = input

    const isAnyFilled = BillToStreet || BillToZipCode || BillToCity || BillToCountry || BillToState

    if (isAnyFilled) {
      if (!BillToStreet || !BillToZipCode || !BillToCity || !BillToCountry || !BillToState) {
        throw new DomainError('La dirección de facturación (BillTo) está incompleta')
      }
    }
  }

  public validateShipToAddress(input: any) {
    const { ShipToStreet, ShipToZipCode, ShipToCity, ShipToCountry, ShipToState } = input

    const isAnyFilled = ShipToStreet || ShipToZipCode || ShipToCity || ShipToCountry || ShipToState 

    if (isAnyFilled) {
      if (!ShipToStreet || !ShipToZipCode || !ShipToCity || !ShipToCountry || !ShipToState ) {
        throw new DomainError('La dirección de envío (ShipTo) está incompleta')
      }
    }
  }
}
