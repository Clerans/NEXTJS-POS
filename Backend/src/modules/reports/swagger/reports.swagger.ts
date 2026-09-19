export const reportsSwaggerDocs = {
  '/reports/sales-summary': {
    get: {
      tags: ['Reports'],
      summary: 'Get Executive Sales Summary & COGS Report',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', example: '2026-08-01' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', example: '2026-08-04' } },
      ],
      responses: {
        200: { description: 'Sales Summary Retrieved' },
      },
    },
  },
  '/reports/cogs-margin': {
    get: {
      tags: ['Reports'],
      summary: 'Get Product Margin & COGS Breakdown Report',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Product Margins Retrieved' },
      },
    },
  },
};
