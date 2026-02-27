import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Découpage Administratif du Sénégal',
      version: '1.0.0',
      description:
        'API REST pour accéder aux données du découpage administratif du Sénégal. Cette API permet de récupérer les informations sur les 14 régions, les départements et les communes du Sénégal.',
      contact: {
        name: 'Support API',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        Region: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique de la région',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom de la région',
              example: 'Dakar',
            },
            code: {
              type: 'string',
              description: 'Code court de la région',
              example: 'DK',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        RegionWithDepartements: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique de la région',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom de la région',
              example: 'Dakar',
            },
            code: {
              type: 'string',
              description: 'Code court de la région',
              example: 'DK',
            },
            departements: {
              type: 'array',
              description: 'Liste des départements de la région',
              items: {
                $ref: '#/components/schemas/Departement',
              },
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        Departement: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique du département',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom du département',
              example: 'Dakar',
            },
            region_id: {
              type: 'integer',
              description: 'Identifiant de la région parent',
              example: 1,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        DepartementWithCommunes: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique du département',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom du département',
              example: 'Dakar',
            },
            region_id: {
              type: 'integer',
              description: 'Identifiant de la région parent',
              example: 1,
            },
            communes: {
              type: 'array',
              description: 'Liste des communes du département',
              items: {
                $ref: '#/components/schemas/Commune',
              },
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        Commune: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique de la commune',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom de la commune',
              example: 'Dakar Plateau',
            },
            departement_id: {
              type: 'integer',
              description: 'Identifiant du département parent',
              example: 1,
            },
            lat: {
              type: 'number',
              format: 'double',
              description: 'Latitude GPS',
              example: 14.6928,
            },
            lon: {
              type: 'number',
              format: 'double',
              description: 'Longitude GPS',
              example: -17.4467,
            },
            elevation: {
              type: 'integer',
              nullable: true,
              description: "Altitude en mètres (peut être nulle)",
              example: 25,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        CommuneWithHierarchy: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique de la commune',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom de la commune',
              example: 'Dakar Plateau',
            },
            departement_id: {
              type: 'integer',
              description: 'Identifiant du département parent',
              example: 1,
            },
            lat: {
              type: 'number',
              format: 'double',
              description: 'Latitude GPS',
              example: 14.6928,
            },
            lon: {
              type: 'number',
              format: 'double',
              description: 'Longitude GPS',
              example: -17.4467,
            },
            elevation: {
              type: 'integer',
              nullable: true,
              description: "Altitude en mètres (peut être nulle)",
              example: 25,
            },
            departement: {
              type: 'object',
              description: 'Département parent',
              properties: {
                id: {
                  type: 'integer',
                  example: 1,
                },
                name: {
                  type: 'string',
                  example: 'Dakar',
                },
                region_id: {
                  type: 'integer',
                  example: 1,
                },
                region: {
                  $ref: '#/components/schemas/Region',
                },
              },
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de modification',
            },
          },
        },
        SearchResults: {
          type: 'object',
          properties: {
            query: { type: 'string', example: 'dakar' },
            total: { type: 'integer', example: 12 },
            results: {
              type: 'object',
              properties: {
                regions: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Region' },
                },
                departements: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Departement' },
                },
                communes: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Commune' },
                },
              },
            },
          },
        },
        Stats: {
          type: 'object',
          properties: {
            regions: { type: 'integer', example: 14 },
            departements: { type: 'integer', example: 46 },
            communes: { type: 'integer', example: 549 },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Succès',
            },
            data: {
              type: 'object',
              description: 'Données de la réponse',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Ressource non trouvée.',
            },
            errors: {
              nullable: true,
              example: null,
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        BadRequest: {
          description: 'Paramètre invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  apis: ['./app/Controllers/Http/**/*.ts', './start/routes.ts'],
}

export default swaggerJsdoc(options)
