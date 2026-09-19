export const promotionsSwaggerDocs = {
  '/promotions': {
    get: {
      tags: ['Promotions'],
      summary: 'List Active Discount Campaigns',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Promotions List Retrieved' },
      },
    },
    post: {
      tags: ['Promotions'],
      summary: 'Create Discount Promo Campaign',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code', 'name', 'type', 'discountValue', 'startDate', 'endDate'],
              properties: {
                code: { type: 'string', example: 'PROMO20' },
                name: { type: 'string', example: '20% Weekend Special' },
                type: { type: 'string', example: 'PERCENTAGE' },
                discountValue: { type: 'number', example: 20.00 },
                startDate: { type: 'string', example: '2026-08-01' },
                endDate: { type: 'string', example: '2026-08-31' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Promotion Coupon Created' },
        409: { description: 'Duplicate Promo Code Conflict' },
      },
    },
  },
  '/promotions/sms-campaigns': {
    post: {
      tags: ['Promotions'],
      summary: 'Dispatch Bulk Promotional SMS Campaign',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'SMS Campaign Dispatched' },
      },
    },
  },
};
