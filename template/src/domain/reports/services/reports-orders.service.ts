import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/schemas/operation-result.schema'
import SBOApiGateway from '@/libs/api-gateway'
import fs from 'fs'

export default class SapReportsOrders {
  private readonly apiGateway = SBOApiGateway.getInstance()

  async getOrderReportBySalesforceID(orderSalesforceId: string): Promise<typeof OperationResult.Type> {
    const docEntry = '10190' // Reemplaza con el DocEntry real de tu factura
    const objType = '13' // Código SAP para factura de cliente
    const reportCode = 'INV20014' // Nombre exacto del layout Crystal
    let base64PDF = ''

    const exportParams = [
      {
        name: 'DocKey@',
        type: 'xsd:string',
        value: [[docEntry]],
      },
      {
        name: 'ObjectId@',
        type: 'xsd:string',
        value: [[objType]],
      },
    ]

    try {
      base64PDF = await this.apiGateway.getPDF(reportCode, exportParams)

      // Limpia el prefix si lo trae
      const cleanBase64 = base64PDF.replace(/^data:application\/pdf;base64,/, '')

      // Guarda el PDF en disco
      fs.writeFileSync('FacturaCliente.pdf', Buffer.from(cleanBase64, 'base64'))

      console.log('✅ PDF generado correctamente: FacturaCliente.pdf')
    } catch (error) {
      console.error('❌ Error al generar el PDF:', error)
    }
    return OperationResultBuilder.success(base64PDF).build()
  }
}
