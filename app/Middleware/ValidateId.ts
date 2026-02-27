import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ValidateId {
  public async handle(
    { params, response }: HttpContextContract,
    next: () => Promise<void>,
    paramNames: string[] = []
  ) {
    if (paramNames.length === 0) {
      paramNames = ['id']
    }
    for (const param of paramNames) {
      const value = params[param]
      if (value !== undefined && (!/^\d+$/.test(value) || Number(value) === 0)) {
        return response.badRequest({
          success: false,
          message: `Le paramètre '${param}' doit être un entier positif.`,
          errors: null,
        })
      }
    }
    await next()
  }
}
