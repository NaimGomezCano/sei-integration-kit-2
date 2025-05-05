import { appEnv } from '@/appEnv'
import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import http from 'http'
import https from 'https'

/**
 * Estructura de datos de un token OAuth de Salesforce
 */
interface SalesforceOAuthToken {
  accessToken: string
  instanceUrl: string
  expiresAt: number
}

interface OAuthResponse {
  access_token: string
  instance_url: string
  issued_at: string
  refresh_token?: string
}

interface SalesforceClientOptions {
  clientId: string
  clientSecret: string
  username: string
  password: string
  loginUrl?: string // default: https://login.salesforce.com
}

/**
 * Singleton para gestionar tokens de Salesforce por configuración única
 */
class SalesforceTokenManager {
  private static tokens: Map<string, SalesforceOAuthToken> = new Map()

  /**
   * Genera clave única según configuración de Salesforce
   */
  private static buildKey(opts: SalesforceClientOptions): string {
    return [opts.loginUrl ?? 'https://login.salesforce.com', opts.clientId, opts.username].join('|')
  }

  /**
   * Obtiene o refresca un token para Salesforce según la configuración
   */
  static async getToken(opts: SalesforceClientOptions): Promise<SalesforceOAuthToken> {
    const key = this.buildKey(opts)
    const existing = this.tokens.get(key)

    if (!existing || Date.now() > existing.expiresAt) {
      const fresh = await this.fetchToken(opts)
      this.tokens.set(key, fresh)
      return fresh
    }

    return existing
  }

  /**
   * Realiza la autenticación OAuth2 con Salesforce para obtener un nuevo token
   */
  private static async fetchToken(opts: SalesforceClientOptions): Promise<SalesforceOAuthToken> {
    const loginUrl = opts.loginUrl ?? 'https://login.salesforce.com'
    const url = `${loginUrl}/services/oauth2/token`
    const params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('client_id', opts.clientId)
    params.append('client_secret', opts.clientSecret)
    params.append('username', opts.username)
    params.append('password', opts.password)

    const resp: AxiosResponse<OAuthResponse> = await axios.post(url, params)
    const data = resp.data
    const issuedAt = Number(data.issued_at)

    return {
      accessToken: data.access_token,
      instanceUrl: data.instance_url,
      expiresAt: issuedAt + 7200 * 1000, // Expira en 2 horas
    }
  }
}

/**
 * Cliente genérico para llamadas a la API de Salesforce
 */
export class SalesforceClient {
  private axios!: AxiosInstance

  constructor(
    private opts: SalesforceClientOptions = {
      clientId: appEnv.SF_CLIENT_ID,
      clientSecret: appEnv.SF_CLIENT_SECRET,
      username: appEnv.SF_USERNAME,
      password: appEnv.SF_PASSWORD,
      loginUrl: 'https://login.salesforce.com',
    }
  ) {}

  /**
   * Inicializa Axios con baseURL e interceptor de token
   */
  private async init(): Promise<void> {
    const token = await SalesforceTokenManager.getToken(this.opts)
    this.axios = axios.create({
      baseURL: token.instanceUrl,
      timeout: 60000, // además agrego un timeout largo
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    })

    // Interceptor para inyectar token actualizado en cada petición
    this.axios.interceptors.request.use(async (config) => {
      const fresh = await SalesforceTokenManager.getToken(this.opts)
      config.baseURL = fresh.instanceUrl

      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers)
      }

      config.headers.set('Authorization', `Bearer ${fresh.accessToken}`)
      return config
    })
  }

  /**
   * Realiza una petición genérica a Salesforce
   */
  public async request<T = any>(method: 'get' | 'post' | 'patch' | 'delete', path: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (!this.axios) {
      await this.init()
    }
    const ret = await this.axios.request<T>({ method, url: path, data, ...config })
    return ret
  }

  // Atajos para métodos HTTP
  public get<T = any>(path: string, config?: AxiosRequestConfig) {
    return this.request<T>('get', path, undefined, config)
  }

  public post<T = any>(path: string, data: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('post', path, data, config)
  }

  public patch<T = any>(path: string, data: unknown, config?: AxiosRequestConfig) {
    return this.request<T>('patch', path, data, config)
  }

  public delete<T = any>(path: string, config?: AxiosRequestConfig) {
    return this.request<T>('delete', path, undefined, config)
  }
}
