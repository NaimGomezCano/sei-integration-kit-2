import ServiceLayer from '@/shared/sap-b1/service-layer'
import { SapSalesOrder, SapSalesOrderLine } from '../../schemas/sap-orders.schema'

export class SapOrderLineRepository {
  private readonly sl = ServiceLayer.getInstance()

  async getBySfId(order: typeof SapSalesOrder.Type, sfLineId: string): Promise<typeof SapSalesOrderLine.Type | null> {
    const res = order.DocumentLines?.find((line) => line.U_SEI_SFID === sfLineId)
    //res?.U_SEI_SFID
    return res ?? null
  }
}
