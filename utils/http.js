class HttpClient {
  static #instance
  constructor(defaults = {}) {
    this.defaults = {
      headers: {},
      timeout: 10000,
      ...defaults
    }
  }
  static getInstance() {
    if (!HttpClient.#instance) {
      HttpClient.#instance = new HttpClient()
    }
    return HttpClient.#instance
  }
  async request(method, url, options = {}) {
    const { params, headers, body, timeout } = options
    let finalUrl = typeof url === 'string' ? url : url.toString()
    if (params && typeof params === 'object') {
      const qs = new URLSearchParams(params).toString()
      if (qs) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
    }
    const mergedHeaders = { ...(this.defaults.headers || {}), ...(headers || {}) }
    let payload = body
    if (payload !== undefined && typeof payload === 'object' && !(payload instanceof Buffer)) {
      if (!mergedHeaders['Content-Type']) mergedHeaders['Content-Type'] = 'application/json'
      if (mergedHeaders['Content-Type'].includes('application/json')) {
        payload = JSON.stringify(payload)
      }
    }
    const controller = new AbortController()
    const to = typeof timeout === 'number' ? timeout : this.defaults.timeout
    const timer = to ? setTimeout(() => controller.abort(), to) : null
    const res = await fetch(finalUrl, {
      method,
      headers: mergedHeaders,
      body: payload,
      signal: controller.signal
    })
    if (timer) clearTimeout(timer)
    const ct = res.headers.get('content-type') || ''
    const data = ct.includes('application/json') ? await res.json() : await res.text()
    const response = {
      data,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries())
    }
    return response
  }
  get(url, options = {}) {
    return this.request('GET', url, options)
  }
  post(url, body, options = {}) {
    return this.request('POST', url, { ...options, body })
  }
  put(url, body, options = {}) {
    return this.request('PUT', url, { ...options, body })
  }
  delete(url, options = {}) {
    return this.request('DELETE', url, options)
  }
}
const http = HttpClient.getInstance()
export default http
export { HttpClient }
