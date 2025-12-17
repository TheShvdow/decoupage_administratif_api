import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import swaggerSpec from 'Config/swagger'

export default class DocsController {
  /**
   * Retourne la spécification OpenAPI au format JSON
   */
  public async spec({ response }: HttpContextContract) {
    return response.json(swaggerSpec)
  }

  /**
   * Affiche la documentation Redoc
   */
  public async redoc({ response }: HttpContextContract) {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Découpage Administratif du Sénégal - Documentation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <redoc spec-url="/api/openapi.json"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
    `
    return response.header('Content-Type', 'text/html').send(html)
  }
}
