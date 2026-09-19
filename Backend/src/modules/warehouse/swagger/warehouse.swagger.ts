export const warehouseSwaggerDocs = {
  '/warehouse/transfers': {
    get: {
      tags: ['Warehouse'],
      summary: 'List All Inter-Warehouse Stock Transfers',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Stock Transfers Retrieved' },
      },
    },
    post: {
      tags: ['Warehouse'],
      summary: 'Create Stock Transfer Request',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['sourceWarehouseId', 'destinationWarehouseId', 'items'],
              properties: {
                sourceWarehouseId: { type: 'number', example: 1 },
                destinationWarehouseId: { type: 'number', example: 2 },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: { type: 'number', example: 1 },
                      quantity: { type: 'number', example: 10 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Transfer Created' },
        400: { description: 'Same Warehouse Error' },
      },
    },
  },
  '/warehouse/transfer/{id}/complete': {
    post: {
      tags: ['Warehouse'],
      summary: 'Complete Stock Transfer (Credit destination warehouse inventory)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Transfer marked completed and credited' },
        422: { description: 'Invalid transfer state' },
      },
    },
  },
  '/warehouse/transfer/{id}/cancel': {
    post: {
      tags: ['Warehouse'],
      summary: 'Cancel Stock Transfer (Return stock to source warehouse)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Transfer cancelled and stock returned' },
        422: { description: 'Invalid transfer state' },
      },
    },
  },
};
