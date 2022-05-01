import axios from "axios"
import type { AxiosInstance } from "axios"
import type { RyRequestInterceptors, RyRequestConfig } from "./types"

class RyRequest {
  instance: AxiosInstance
  interceptors?: RyRequestInterceptors
  showLoading: boolean

  constructor(config: RyRequestConfig) {
    this.instance = axios.create(config)
    this.showLoading = config.showLoading ?? true
    this.interceptors = config.interceptors
    this.interceptor()
  }

  interceptor(): void {
    // 单个实例的请求和响应拦截
    this.instance.interceptors.request.use(
      this.interceptors?.requestInterceptor,
      this.interceptors?.requestInterceptorCatch
    )

    this.instance.interceptors.response.use(
      this.interceptors?.responseInterceptor,
      this.interceptors?.responseInterceptorCatch
    )

    // 所有实例的请求和响应拦截
    this.instance.interceptors.request.use(
      (config) => {
        if (this.showLoading) {
          // 显示Loading组件
        }

        // 添加token等

        return config
      },
      (err) => {
        return err
      }
    )

    this.instance.interceptors.response.use(
      (res) => {
        return res
      },
      (err) => {
        return err
      }
    )
  }

  request<T = any>(config: RyRequestConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // 单个请求的请求和响应拦截
      if (config.interceptors?.requestInterceptor) {
        config = config.interceptors.requestInterceptor(config)
      }

      const DEFAULT_LOADING = this.showLoading
      this.showLoading = config.showLoading ?? DEFAULT_LOADING

      this.instance
        .request<any, T>(config)
        .then((res) => {
          if (config.interceptors?.responseInterceptor) {
            res = config.interceptors.responseInterceptor(res)
          }
          if (this.showLoading !== DEFAULT_LOADING) {
            this.showLoading = DEFAULT_LOADING
          }
          resolve(res)
        })
        .catch((err) => {
          if (this.showLoading !== DEFAULT_LOADING) {
            this.showLoading = DEFAULT_LOADING
          }
          reject(err)
        })
    })
  }

  get<T = any>(config: RyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "GET" })
  }

  post<T = any>(config: RyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "POST" })
  }

  delete<T = any>(config: RyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE" })
  }

  patch<T = any>(config: RyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH" })
  }
}

export default RyRequest
