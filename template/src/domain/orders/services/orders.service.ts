import { DomainError } from '@/core/errors/domain.error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/schemas/operation-result.schema'
import { SapOrderLineRepository } from '@/domain/shared/repositories/sap/sap-order-lines.repository'
import { SapOrderRepository } from '@/domain/shared/repositories/sap/sap-order.repository'
import { SapSalesOrder, SapSalesOrderLine } from '@/domain/shared/schemas/sap-orders.schema'
import ServiceLayer from '@/shared/sap-b1/service-layer'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { SfUpdateOrderItem } from '../schemas/salesforce-order-item.schema'
import { SfCreateOrder, SfUpdateOrder } from '../schemas/salesforce-order.schema'

export default class OrderService {
  protected readonly sl: ServiceLayer = ServiceLayer.getInstance()
  private readonly orderRepo = new SapOrderRepository()
  private readonly orderLineRepo = new SapOrderLineRepository()

  async createOrder(input: typeof SfCreateOrder.Type): Promise<typeof OperationResult.Type> {
    logger.info('Iniciando creación de orden', { salesforceId: input.SalesforceId })

    const exists = await this.orderRepo.existsBySfId(input.SalesforceId!)
    if (exists) {
      logger.error('Orden ya existe', { salesforceId: input.SalesforceId })

      throw new DomainError(`Order with SalesforceId '${input.SalesforceId}' already exists`)
    }

    if (!input.OrderItems) {
      logger.error('Intento de crear orden sin líneas', { salesforceId: input.SalesforceId })
      throw new DomainError(' Cannot create an order without lines')
    }

    let orderDraft: typeof SapSalesOrder.Draft = {}

    orderDraft.U_SEI_SFID = input.SalesforceId
    orderDraft.CardCode = input.CardCode
    //bpDraft.CreateDate = input.CreateDate
    orderDraft.DocTotal = input.DocTotal
    orderDraft.DocDate = input.DocDate
    orderDraft.DocDueDate = input.DocDueDate
    //bpDraft.CntctCode = input.CntctCode /// Esto sera la id del contacto en salesforce

    orderDraft.DocumentLines = []

    input.OrderItems.forEach((item) => {
      orderDraft.DocumentLines?.push({
        U_SEI_SFID: item.SalesforceId,
        ItemDescription: item.ItemDescription,
        STPGExpiration: item.STPGExpiration,
        ItemCode: item.ItemCode,
        Quantity: item.Quantity,
        LineTotal: item.LineTotal,
      })
    })

    logger.info('Orden construida, validando', { draft: orderDraft })
    const bp = SapSalesOrder.validateDraft(orderDraft)

    logger.info('Creando orden en SAP', { salesforceId: input.SalesforceId })
    const created = await this.orderRepo.create(bp)

    logger.info('Orden creada correctamente', { docEntry: created.DocEntry })
    return OperationResultBuilder.success(created).build()
  }

  private async updateLine(existingOrder: any, input: typeof SfUpdateOrderItem.Type): Promise<typeof SapSalesOrderLine.Type> {
    logger.info('Actualizando línea de orden', { salesforceId: input.SalesforceId })

    const orderLine: typeof SapSalesOrderLine.Type = await requireEntity(this.orderLineRepo.getBySfId(existingOrder, input.SalesforceId!))

    orderLine.ItemDescription = input.ItemDescription
    orderLine.STPGExpiration = input.STPGExpiration
    orderLine.ItemCode = input.ItemCode
    orderLine.Quantity = input.Quantity
    orderLine.LineTotal = input.LineTotal

    logger.info('Línea actualizada', { line: orderLine })

    return orderLine
  }

  async updateOrder(salesforceId: string, input: typeof SfUpdateOrder.Draft): Promise<typeof OperationResult.Type> {
    logger.info('Iniciando actualización de orden', { salesforceId })

    const existingOrder: typeof SapSalesOrder.Type = await requireEntity(this.orderRepo.findBySfIdOrNull(salesforceId), {
      notFoundMessage: `No Order found with SalesforceId '${salesforceId}'`,
    })

    existingOrder.CardCode = input.CardCode
    //existingOrder.CreateDate = input.CreateDate
    existingOrder.DocTotal = input.DocTotal
    existingOrder.DocDate = input.DocDate
    existingOrder.DocDueDate = input.DocDueDate
    //existingOrder.CntctCode = input.CntctCode /// Esto sera la id del contacto en salesforce

    const updatedLines: (typeof SapSalesOrderLine.Type)[] = []

    if (input.OrderItems) {
      for (const inputLine of input.OrderItems) {
        const line = await this.updateLine(existingOrder, inputLine)
        updatedLines.push(line)
      }
    }

    existingOrder.DocumentLines = updatedLines

    logger.info('Validando orden antes de enviar', { draft: existingOrder })
    const order = SapSalesOrder.validateDraft(existingOrder)

    logger.info('Actualizando orden en SAP', { docEntry: existingOrder.DocEntry })
    await this.orderRepo.update(existingOrder.DocEntry!, order)
    const confirmation = await requireEntity(this.orderRepo.getByIdOrNull(existingOrder.DocEntry!))

    logger.info('Orden actualizada correctamente', { docEntry: confirmation.DocEntry })
    return OperationResultBuilder.success(confirmation).build()
  }

  async getBySalesforceId(salesforceId: string): Promise<typeof OperationResult.Type> {
    const order = await requireEntity(this.orderRepo.findBySfIdOrNull(salesforceId), {
      notFoundMessage: `No Order found with SalesforceId '${salesforceId}'`,
    })

    return OperationResultBuilder.success(order).build()
  }
}
