export const rawMaterialsSwaggerDocs = {
  '/raw-materials': {
    get: {
      tags: ['Raw Materials'],
      summary: 'List All Raw Materials',
      responses: { 200: { description: 'Raw materials list retrieved' } },
    },
    post: {
      tags: ['Raw Materials'],
      summary: 'Create Raw Material Item (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code', 'name', 'costPerUnit'],
              properties: {
                code: { type: 'string', example: 'RM-COF-002' },
                name: { type: 'string', example: 'Robusta Coffee Beans (kg)' },
                unitId: { type: 'integer', example: 3 },
                costPerUnit: { type: 'number', example: 2800.0 },
                reorderLevel: { type: 'number', example: 15.0 },
                isActive: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Raw Material Created' },
        409: { description: 'Duplicate Code' },
      },
    },
  },
  '/raw-materials/batches': {
    get: {
      tags: ['Raw Materials'],
      summary: 'List Raw Material Batches',
      parameters: [
        { name: 'rawMaterialId', in: 'query', schema: { type: 'integer' } },
        { name: 'warehouseId', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: { description: 'Batches list retrieved' } },
    },
    post: {
      tags: ['Raw Materials'],
      summary: 'Record New Raw Material Batch (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['rawMaterialId', 'warehouseId', 'batchNumber', 'quantity', 'unitCost'],
              properties: {
                rawMaterialId: { type: 'integer', example: 1 },
                warehouseId: { type: 'integer', example: 1 },
                batchNumber: { type: 'string', example: 'BATCH-COF-2026-02' },
                quantity: { type: 'number', example: 50.0 },
                unitCost: { type: 'number', example: 3500.0 },
                expiryDate: { type: 'string', example: '2026-12-31' },
              },
            },
          },
        },
      },
      responses: { 201: { description: 'Batch recorded' } },
    },
  },
  '/raw-materials/inventory': {
    get: {
      tags: ['Raw Materials'],
      summary: 'Get Raw Material Inventory Levels',
      parameters: [
        { name: 'rawMaterialId', in: 'query', schema: { type: 'integer' } },
        { name: 'warehouseId', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: { description: 'Inventory levels retrieved' } },
    },
  },
  '/raw-materials/inventory/adjust': {
    post: {
      tags: ['Raw Materials'],
      summary: 'Adjust Raw Material Stock Level (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['rawMaterialId', 'warehouseId', 'newQuantity'],
              properties: {
                rawMaterialId: { type: 'integer', example: 1 },
                warehouseId: { type: 'integer', example: 1 },
                newQuantity: { type: 'number', example: 75.0 },
                reason: { type: 'string', example: 'Physical stock count correction' },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Stock adjusted' } },
    },
  },
  '/raw-materials/{id}': {
    get: {
      tags: ['Raw Materials'],
      summary: 'Get Raw Material Details by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Raw material details retrieved' } },
    },
    put: {
      tags: ['Raw Materials'],
      summary: 'Update Raw Material Item (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Raw material updated' } },
    },
    delete: {
      tags: ['Raw Materials'],
      summary: 'Delete Raw Material Item (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Raw material deleted' } },
    },
  },
};
