/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: NodeJS.ErrnoException & { code?: string; status?: number }, ctx: HttpContextContract) {
    const { response } = ctx

    if (error.code === 'E_ROW_NOT_FOUND') {
      return response.status(404).send({
        success: false,
        message: 'Ressource non trouvée.',
        errors: null,
      })
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return response.status(404).send({
        success: false,
        message: 'Route non trouvée.',
        errors: null,
      })
    }

    return response.status(error.status || 500).send({
      success: false,
      message: 'Une erreur interne est survenue.',
      errors: null,
    })
  }
}
