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
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
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
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./app/Controllers/Http/**/*.ts', './start/routes.ts'],
}

export default swaggerJsdoc(options)
