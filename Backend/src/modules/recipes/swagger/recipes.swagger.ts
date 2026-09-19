export const recipesSwaggerDocs = {
  '/recipes': {
    get: {
      tags: ['Recipes'],
      summary: 'List All Product Recipes',
      responses: { 200: { description: 'Recipes list retrieved' } },
    },
    post: {
      tags: ['Recipes'],
      summary: 'Create Product Recipe with Line Items (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId', 'name', 'items'],
              properties: {
                productId: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Espresso Recipe' },
                yieldQuantity: { type: 'number', example: 1.0 },
                instructions: { type: 'string', example: 'Extract 18g coffee' },
                isActive: { type: 'boolean', example: true },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['rawMaterialId', 'quantity'],
                    properties: {
                      rawMaterialId: { type: 'integer', example: 1 },
                      quantity: { type: 'number', example: 0.018 },
                      unitId: { type: 'integer', example: 3 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Recipe Created' },
        409: { description: 'Recipe already exists for product' },
      },
    },
  },
  '/recipes/product/{productId}': {
    get: {
      tags: ['Recipes'],
      summary: 'Get Recipe by Product ID',
      parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Recipe details retrieved' },
        404: { description: 'Not found' },
      },
    },
  },
  '/recipes/{id}': {
    get: {
      tags: ['Recipes'],
      summary: 'Get Recipe Details by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Recipe details retrieved' } },
    },
    put: {
      tags: ['Recipes'],
      summary: 'Update Recipe (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Recipe updated' } },
    },
    delete: {
      tags: ['Recipes'],
      summary: 'Delete Recipe (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Recipe deleted' } },
    },
  },
};
