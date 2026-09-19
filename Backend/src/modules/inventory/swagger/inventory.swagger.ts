export const inventorySwaggerDocs = {
  '/inventory/stock-levels': {
    get: {
      tags: ['Inventory'],
      summary: 'Get Current Stock Level Balances across branches',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', required: false, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Stock Balances Retrieved' },
      },
    },
  },
  '/inventory/stock': {
    get: {
      tags: ['Inventory'],
      summary: 'Get Current Stock Level Balances',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Stock Balances Retrieved' },
      },
    },
  },
  '/inventory/ledger': {
    get: {
      tags: ['Inventory'],
      summary: 'Get Double-Entry Inventory Movement Ledger',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Inventory Ledger Retrieved' },
      },
    },
  },
  '/inventory/adjust': {
    post: {
      tags: ['Inventory'],
      summary: 'Submit Manual Stock Adjustment',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['branchId', 'transactionType', 'quantityChange', 'unitCost', 'referenceId'],
              properties: {
                branchId: { type: 'number', example: 1 },
                productId: { type: 'number', example: 1 },
                transactionType: { type: 'string', example: 'SPOILAGE' },
                quantityChange: { type: 'number', example: -2 },
                unitCost: { type: 'number', example: 120.00 },
                referenceId: { type: 'string', example: 'ADJ-MANUAL-001' },
                reason: { type: 'string', example: 'Spilled during espresso prep' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Stock Balance Adjusted' },
        422: { description: 'Negative Stock Prevention Error' },
      },
    },
  },
};
