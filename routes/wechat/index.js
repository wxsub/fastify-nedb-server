import http from '#util/http.js'
export default async function (fastify, opts) {
  let tokenCache = {
    access_token: null,
    expires_at: 0,
    expires_in: 0
  }
  let pendingPromise = null

  const getEnv = () => ({
    appid: "wxfdc61af0780b966a",
    secret: "15799c313878d3c07e6bcf221aa726a3"
  })

  const fetchToken = async () => {
    const { appid, secret } = getEnv()
    if (!appid || !secret) {
      const msg = 'WX_APPID 或 WX_SECRET 未配置'
      const err = new Error(msg)
      err.code = 400
      throw err
    }
    const url = new URL('https://api.weixin.qq.com/cgi-bin/token')
    url.searchParams.set('grant_type', 'client_credential')
    url.searchParams.set('appid', appid)
    url.searchParams.set('secret', secret)
    const { data: json } = await http.get(url)
    // if (json.errcode) {
    //   const err = new Error(`微信接口错误: ${json.errcode} ${json.errmsg || ''}`)
    //   err.code = 500
    //   throw err
    // }
    // return { ...tokenCache, fromCache: false }
  }

  const getAccessToken = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const { appid, secret } = getEnv()
        if (!appid || !secret) {
          const msg = 'WX_APPID 或 WX_SECRET 未配置'
          const err = new Error(msg)
          err.code = 400
          throw err
        }
        const url = new URL('https://api.weixin.qq.com/cgi-bin/token')
        url.searchParams.set('grant_type', 'client_credential')
        url.searchParams.set('appid', appid)
        url.searchParams.set('secret', secret)
        const { data: response } = await http.get(url)
        console.log(response)
        if (response?.errcode) {
          const err = new Error(`微信接口错误: ${json.errcode} ${json.errmsg || ''}`)
          err.code = 500
          throw err
        }
        resolve(response)
      } catch (error) {
        reject(error)
      }
    })
  }

  fastify.get('/getwxacodeunlimit', async (request, reply) => {
    try {
      const { access_token } = await getAccessToken()
      const { data } = await http.post(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`, {
        scene: request.query?.scene,
        page: request.query?.page || 'pages/redirect/loading'
      })
      return reply.success(data, 'success')
    } catch (error) {
      const code = typeof error.code === 'number' ? error.code : 1
      return reply.error(code, error.message || 'error')
    }
  })
}
