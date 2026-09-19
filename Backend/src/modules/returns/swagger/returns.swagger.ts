export const returnsSwaggerDocs = {
  '/returns': {
    get: {
      tags: ['Returns'],
      summary: 'List All Customer & Supplier Return Transactions',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Returns List Retrieved' },
      },
    },
  },
  '/returns/customer': {
    post: {
      tags: ['Returns'],
      summary: 'Process Customer Product Return & Refund',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['orderId', 'branchId', 'items', 'refundMethod'],
              properties: {
                orderId: { type: 'number', example: 8820 },
                branchId: { type: 'number', example: 1 },
                refundMethod: { type: 'string', example: 'CASH' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: { type: 'number', example: 1 },
                      quantity: { type: 'number', example: 1 },
                      unitPrice: { type: 'number', example: 450.00 },
                      reason: { type: 'string', example: 'Wrong coffee order size served' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Customer Return Processed & Stock Restored' },
      },
    },
  },
  '/returns/supplier': {
    post: {
      tags: ['Returns'],
      summary: 'Process Supplier Debit Note & Raw Material Return',
      security: [{ bearerAuth: [] }],
      responses: {
        201: { description: 'Supplier Return Processed' },
      },
    },
  },
};
