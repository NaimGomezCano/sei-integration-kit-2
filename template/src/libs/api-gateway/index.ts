import axios, { isAxiosError, type AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { ReportListSchema, ReportParamsSchema, type ExportPDFBody, type ReportList, type ReportParams } from './schemas'
import type { SBOApiGatewayConfig, SBOApiGatewayError, SBOApiGatewayLoginReq, SBOApiGatewayLoginRes } from './types'
import { appEnv } from '@/appEnv'
import { logger } from '@/core/logger'

export default class SBOApiGateway {
  private readonly baseUrl: string
  private readonly user: string
  private readonly password: string
  private readonly dbName: string
  private readonly dbInstance: string

  private readonly apiPreffix: string = '/rs/v1'
  private static instance: SBOApiGateway
  public client: AxiosInstance

  private sessionID: string = ''

  static getInstance(config?: SBOApiGatewayConfig): SBOApiGateway {
    if (!SBOApiGateway.instance) {
      SBOApiGateway.instance = new SBOApiGateway(config)
    }
    return SBOApiGateway.instance
  }

  constructor(slConfig?: SBOApiGatewayConfig) {
    if (slConfig) {
      this.baseUrl = slConfig.baseUrl + this.apiPreffix
      this.user = slConfig.user
      this.password = slConfig.password
      this.dbName = slConfig.dbName
      this.dbInstance = slConfig.dbInstace
    } else {
      //Using Environment Variables
      this.baseUrl = appEnv.SBO_API_GATEWAY_BASE_URL + this.apiPreffix
      this.user = appEnv.SBO_API_GATEWAY_USER!!
      this.password = appEnv.SBO_API_GATEWAY_PASSWD!!
      this.dbName = appEnv.SBO_API_GATEWAY_DB_NAME!!
      this.dbInstance = appEnv.SBO_API_GATEWAY_DB_INSTANCE!!
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
    })

    axiosRetry(this.client, {
      retries: 5,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: async (error) => {
        if (error.response?.status === 401) {
          await this.login()
          return true
        }

        return error.status === 502
      },
    })
  }

  private async login(config?: SBOApiGatewayLoginReq): Promise<SBOApiGatewayLoginRes | null> {
    const validConfig = config || {
      CompanyDB: this.dbName,
      UserName: this.user,
      Password: this.password,
      DBInstance: this.dbInstance,
    }

    logger.info('Logging in to SBO API Gateway...')

    //Retry 3 times
    let count = 1
    let success = false

    while (count <= 3 || !success) {
      try {
        const result = await axios.post<SBOApiGatewayLoginRes>(`${this.baseUrl.replace(this.apiPreffix, '')}/login`, validConfig)

        if (!result.data.SessionTimeout) {
          const error = result.data as any as SBOApiGatewayError
          throw new Error(`Failed to login to SB0 API Gateway : ${error.message.value || 'Unknown Error'}`)
        }

        const cookies = result.headers['set-cookie']

        if (cookies) {
          const sessionID = cookies[0].split(';')[0].split('=')[1]

          if (!sessionID) {
            throw new Error('Session ID not found in Set-Cookie header')
          }

          this.sessionID = sessionID
        } else {
          throw new Error('Set-Cookie header not found')
        }

        this.client.defaults.headers.common['Cookie'] = `SESSION=${this.sessionID}`

        logger.info('Successfully logged in to API Gateway')

        success = true

        return result.data
      } catch (error: any) {
        if (isAxiosError(error)) {
          const errorResponse = error.response?.data as SBOApiGatewayError
          logger.error(`SBO API Gateway Logging error: ${errorResponse.message.value || 'Unknown Error'}`)

          if (error.status === 502) {
            logger.error('Bad Gateway Error, retrying...')
            continue
          } else {
            throw new Error(`Failed to login to SB0 API Gateway : ${errorResponse.message.value || 'Unknown Error'}`)
          }
        }
      } finally {
        count++
      }
    }

    throw new Error('Failed to login to SB0 API Gateway after 3 retries')
  }

  async getReportList(): Promise<ReportList> {
    try {
      const result = await this.client.get('/LoadAuthorizedCRList')
      return ReportListSchema.parse(result.data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const errorResponse = error.response?.data as SBOApiGatewayError
        logger.error(`Failed to get report list from API Gateway: ${errorResponse.message.value || error.status?.toString() + ' - Unknown Error'}`)
      }

      throw new Error(`Failed to get report list from API Gateway: ${error.message || 'Unknown error'}`)
    }
  }

  async getReportParameters(reportId: string): Promise<ReportParams> {
    try {
      const result = await this.client.get(`/LoadCR?DocCode=${reportId}`)
      return ReportParamsSchema.parse(result.data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const errorResponse = error.response?.data as SBOApiGatewayError
        logger.error(`Failed to get report parameters from API Gateway: ${errorResponse.message.value || error.status?.toString() + ' - Unknown Error'}`)
      }

      throw new Error(`Failed to get report parameters from API Gateway: ${error.message || 'Unknown error'}`)
    }
  }

  async getPDF(reportId: string, parameters: ExportPDFBody): Promise<string> {
    try {
      const result = await this.client.post(`/ExportPDFData?DocCode=${reportId}`, parameters)

      if (result.data == '(---)') {
        throw new Error('Invalid parameters')
      }

      return result.data
    } catch (error: any) {
      logger.error(JSON.stringify(error))

      if (isAxiosError(error)) {
        const errorResponse = error.response?.data as SBOApiGatewayError
        logger.error(`Failed to get Base64 PDF from API Gateway: ${errorResponse.message.value || error.status?.toString() + ' - Unknown Error'}`)
      }

      throw new Error(`Failed to get Base64 PDF from API Gateway: ${error.message || 'Unknown error'}`)
    }
  }
}
