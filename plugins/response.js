import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  const successCode = (opts && opts.successCode) ?? 0
  const defaultSuccessMessage = (opts && opts.defaultSuccessMessage) ?? 'OK'

  fastify.decorateReply('success', function (data, message = defaultSuccessMessage) {
    const payload = {
      code: successCode,
      message,
      success: true,
      data: data ?? null,
      timestamp: new Date().toISOString(),
      requestId: this.request?.id
    }
    return this.send(payload)
  })

  fastify.decorateReply('error', function (code, message, details) {
    const payload = {
      code: typeof code === 'number' ? code : 1,
      message: message || 'Error',
      success: false,
      data: details ?? null,
      timestamp: new Date().toISOString(),
      requestId: this.request?.id
    }
    return this.send(payload)
  })
})
