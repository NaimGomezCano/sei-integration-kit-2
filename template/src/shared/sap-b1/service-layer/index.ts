import axios, { type AxiosInstance } from 'axios'

import { appEnv } from '@/appEnv'
import { internalLogger } from '@/core/logger/internal'
import axiosRetry from 'axios-retry'
import { ServiceLayerEntity } from './enums/entities'
import { ServiceLayerHttpHeaderEnum } from './enums/headers'
import type { ServiceLayerConfig } from './types/config'
import type { ServiceLayerLoginReq, ServiceLayerLoginRes } from './types/login'

export default class ServiceLayer {
  private baseUrl: string
  private user: string
  private password: string
  private dbName: string
  private readonly apiPreffix: string = '/b1s/v1/' //TODO: Parametrizar en entorno
  private static instance: ServiceLayer
  private readonly client: AxiosInstance

  private sessionID: string = ''

  static getInstance(slConfig?: ServiceLayerConfig): ServiceLayer {
    // if (slConfig) {
    //   if (ServiceLayer.instance) {
    //     ServiceLayer.instance = new ServiceLayer(slConfig)
    //   }
    // }

    if (!ServiceLayer.instance) {
      ServiceLayer.instance = new ServiceLayer(slConfig)
    }

    return ServiceLayer.instance
  }

  constructor(slConfig?: ServiceLayerConfig) {
    if (slConfig) {
      this.baseUrl = slConfig.baseUrl + this.apiPreffix
      this.user = slConfig.user
      this.password = slConfig.password
      this.dbName = slConfig.dbName
    } else {
      //Using Environment Variables
      this.baseUrl = appEnv.SBO_SL_URL + this.apiPreffix
      this.user = appEnv.SBO_SL_USER!!
      this.password = appEnv.SBO_SL_PASSWD!!
      this.dbName = appEnv.SBO_SL_DB_NAME!!
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      /*  httpAgent: new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000, // 30s
        maxSockets: 100, // máximo conexiones abiertas
        maxFreeSockets: 10, // máximo conexiones "libres"
        timeout: 60000, // 60s de timeout en socket
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000, // 30s
        maxSockets: 100, // máximo conexiones abiertas
        maxFreeSockets: 10, // máximo conexiones "libres"
        timeout: 60000, // 60s de timeout en socket
      }),*/
    })

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: async (error) => {
        if (error.response?.status === 401) {
          await this.login()
          return true
        }

        // Retry si es 502 o si es un error de conexión reset
        return error.response?.status === 502 || error.code === 'ECONNRESET'
      },
      onRetry(retryCount, error, requestConfig) {
        internalLogger.network.warn(`Service Layer request failed, retry attempt: ${retryCount} - URL -> ${requestConfig.url} | Last Error -> ${error.message}`)
      },
    })
  }

  private async login(customSL?: ServiceLayerLoginReq): Promise<ServiceLayerLoginRes | null> {
    const slInfo = customSL || {
      CompanyDB: this.dbName,
      UserName: this.user,
      Password: this.password,
    }

    internalLogger.network.info('Logging in to Service Layer...')

    const result = await axios.post<ServiceLayerLoginRes>(this.baseUrl + ServiceLayerEntity.Login, slInfo)

    this.dbName = slInfo.CompanyDB
    this.user = slInfo.UserName
    this.password = slInfo.Password
    this.sessionID = result.data.SessionId
    this.client.defaults.headers.common['Cookie'] = `B1SESSION=${this.sessionID}`

    internalLogger.network.info('Successfully logged in to Service Layer')

    return result.data
  }

  private async slRequest<T>(url: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', customHeaders?: object, body?: object, nullable: boolean = false): Promise<T> {
    const start = Date.now()

    try {
      const response = await this.client.request<T>({
        url,
        method,
        data: body ? JSON.stringify(body) : undefined,
        headers: {
          ...customHeaders,
        },
      })
      const end = Date.now()
      const elapsed = end - start

      internalLogger.network.info(`${method} | Service Layer -> ${url} -> ${response.status} - ${response.statusText} - ${elapsed} ms`)

      return response.data
    } catch (error) {
      internalLogger.network.error(`Service Layer Error -> ${error}`)
      throw error
    }
  }

  public async customRequest<T>(
    customEntity: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    body: object | undefined = undefined,
    headers: object | undefined = undefined,
    limit: number = 20
  ): Promise<T> {
    const url = `${this.baseUrl}${customEntity}`

    const customHeaders = {
      Prefer: `${ServiceLayerHttpHeaderEnum.LIMIT}=${limit}`,
      ...headers,
    }

    const data: T = await this.slRequest(url, method, customHeaders, body)

    return data
  }

  public async get<T>(entity: ServiceLayerEntity, query: string = '', limit: number = 20): Promise<T[]> {
    const url = `${this.baseUrl}${entity}${query}`
    const customHeaders = {
      Prefer: `${ServiceLayerHttpHeaderEnum.LIMIT}=${limit}`,
    }
    const data: { value: T[] } = await this.slRequest(url, 'GET', customHeaders)

    return data.value
  }

  public async getById<T>(entity: ServiceLayerEntity, id: string | number, query: string = ''): Promise<T | null> {
    let entityId = ''

    if (typeof id === 'string') {
      entityId = `'${id}'`
    } else if (typeof id === 'number') {
      entityId = `${id}`
    }

    const url = `${this.baseUrl}${entity}(${entityId})${query}`
    const data = await this.slRequest<T | null>(url, 'GET', undefined, undefined, true)

    return data
  }

  public async postNoContent(entity: ServiceLayerEntity, body: object) {
    const url = `${this.baseUrl}${entity}`

    const customHeaders = {
      Prefer: 'return-no-content',
    }

    await this.slRequest(url, 'POST', customHeaders, body)
  }

  public async post<T>(entity: ServiceLayerEntity, body?: object): Promise<T> {
    const url = `${this.baseUrl}${entity}`

    const data = await this.slRequest<T>(url, 'POST', undefined, body)

    return data
  }

  public async patch(entity: ServiceLayerEntity, id: string | number, body: object) {
    let entityId = ''

    if (typeof id === 'string') {
      entityId = `'${id}'`
    } else if (typeof id === 'number') {
      entityId = `${id}`
    }

    const url = `${this.baseUrl}${entity}(${entityId})`
    const res = await this.slRequest(url, 'PATCH', undefined, body)
    await res
  }

  public async patchReplace(entity: ServiceLayerEntity, id: string | number, body: object) {
    let entityId = ''

    if (typeof id === 'string') {
      entityId = `'${id}'`
    } else if (typeof id === 'number') {
      entityId = `${id}`
    }

    const url = `${this.baseUrl}${entity}(${entityId})`
    const header = { 'B1S-ReplaceCollectionsOnPatch': 'true' }
    await this.slRequest(url, 'PATCH', header, body)
  }

  public async delete(entity: ServiceLayerEntity, id: string | number) {
    let entityId = ''

    if (typeof id === 'string') {
      entityId = `'${id}'`
    } else if (typeof id === 'number') {
      entityId = `${id}`
    }

    const url = `${this.baseUrl}${entity}(${entityId})`

    await this.slRequest(url, 'DELETE')
  }

  public async cancel(entity: ServiceLayerEntity, id: string | number) {
    let entityId = ''

    if (typeof id === 'string') {
      entityId = `'${id}'`
    } else if (typeof id === 'number') {
      entityId = `${id}`
    }

    const url = `${this.baseUrl}${entity}(${entityId})/Cancel`
    await this.slRequest(url, 'POST')
  }

  public async close(entity: ServiceLayerEntity, id: string | number) {
    let entityId = ''

    if (typeof id === 'string') {
      entityId = `'${id}'`
    } else if (typeof id === 'number') {
      entityId = `${id}`
    }

    const url = `${this.baseUrl}${entity}(${entityId})/Close`
    await this.slRequest(url, 'POST')
  }

  public async getAllPaginated<T>(entity: ServiceLayerEntity, processFn: (batch: T[]) => Promise<void>, pageSize: number = 100, query: string = ''): Promise<void> {
    let page = 1
    let hasMore = true

    while (hasMore) {
      const skip = (page - 1) * pageSize

      let pagedQuery = ''
      if (query) {
        const initialQuery = query.startsWith('?') ? query : `?${query}`
        pagedQuery = `${initialQuery}${initialQuery.includes('?') ? '&' : '?'}$skip=${skip}&$top=${pageSize}`
      } else {
        pagedQuery = `?$skip=${skip}&$top=${pageSize}`
      }

      const url = `${this.baseUrl}${entity}${pagedQuery}`
      const customHeaders = {
        Prefer: `${ServiceLayerHttpHeaderEnum.LIMIT}=${pageSize}`,
      }

      const result: { value: T[] } = await this.slRequest(url, 'GET', customHeaders)

      if (result.value.length === 0) {
        hasMore = false
      } else {
        await processFn(result.value)
        page++
      }
    }
  }
}
