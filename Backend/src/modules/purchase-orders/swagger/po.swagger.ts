export const poSwaggerDocs = {
  '/purchase-orders': {
    get: {
      tags: ['Purchase Orders'],
      summary: 'List All Purchase Orders',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'PO List Retrieved' },
      },
    },
    post: {
      tags: ['Purchase Orders'],
      summary: 'Create Purchase Order Draft',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['supplierId', 'branchId', 'items'],
              properties: {
                supplierId: { type: 'number', example: 1 },
                branchId: { type: 'number', example: 1 },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rawMaterialId: { type: 'number', example: 1 },
                      quantity: { type: 'number', example: 20 },
                      unitCost: { type: 'number', example: 8500.00 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Purchase Order Created' },
      },
    },
  },
  '/purchase-orders/{id}/approve': {
    put: {
      tags: ['Purchase Orders'],
      summary: 'Approve High-Value PO (Requires Manager PIN)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'PO Approved' },
        403: { description: 'Manager Approval Required' },
      },
    },
  },
  '/purchase-orders/{id}/status': {
    patch: {
      tags: ['Purchase Orders'],
      summary: 'Transition PO status (APPROVE, REJECT, CANCEL, CLOSE)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'CANCELLED', 'CLOSED'] },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'PO status transitioned successfully' },
        422: { description: 'Invalid state machine transition' },
      },
    },
  },
};
