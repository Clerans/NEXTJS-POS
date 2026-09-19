export const settingsSwaggerDocs = {
  '/settings': {
    get: {
      tags: ['Settings'],
      summary: 'Get Store Configurations',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Settings Retrieved' },
      },
    },
    put: {
      tags: ['Settings'],
      summary: 'Update System Settings & Tax Rates',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                storeName: { type: 'string', example: 'NEXUSPOS Colombo' },
                taxPercentage: { type: 'number', example: 12.0 },
                currencySymbol: { type: 'string', example: 'Rs.' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Settings Updated' },
      },
    },
  },
  '/audit-logs': {
    get: {
      tags: ['Settings'],
      summary: 'List System Audit Trail Logs (Admin Only)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Audit Logs Retrieved' },
      },
    },
  },
};
