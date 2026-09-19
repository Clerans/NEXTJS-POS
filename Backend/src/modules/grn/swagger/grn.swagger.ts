export const grnSwaggerDocs = {
  '/grn': {
    get: {
      tags: ['GRN'],
      summary: 'List Goods Received Notes (GRNs)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'GRN List Retrieved' },
      },
    },
    post: {
      tags: ['GRN'],
      summary: 'Log Received Goods & Increment Inventory Ledgers',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['supplierId', 'branchId', 'invoiceNumber', 'items'],
              properties: {
                purchaseOrderId: { type: 'number', example: 1 },
                supplierId: { type: 'number', example: 1 },
                branchId: { type: 'number', example: 1 },
                invoiceNumber: { type: 'string', example: 'INV-9901' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rawMaterialId: { type: 'number', example: 1 },
                      receivedQuantity: { type: 'number', example: 50 },
                      unitCost: { type: 'number', example: 2500.00 },
                      batchNumber: { type: 'string', example: 'BATCH-2026-AUG' },
                      expiryDate: { type: 'string', example: '2027-08-31' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'GRN Logged & Stock Incremented' },
      },
    },
  },
  '/grn/{id}/payment': {
    post: {
      tags: ['GRN'],
      summary: 'Record Payment Settlement against GRN (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', example: 5000.00 },
                paymentMethod: { type: 'string', example: 'BANK_TRANSFER' },
                referenceNo: { type: 'string', example: 'REF-883921' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Payment recorded and GRN status updated' },
        404: { description: 'GRN not found' },
      },
    },
  },
};
