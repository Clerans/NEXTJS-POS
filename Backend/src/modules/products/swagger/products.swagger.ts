export const productsSwaggerDocs = {
  '/products/categories': {
    get: {
      tags: ['Products & Categories'],
      summary: 'List All Product Categories',
      description: 'Returns product categories with associated item count summaries.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Categories list retrieved successfully' },
      },
    },
    post: {
      tags: ['Products & Categories'],
      summary: 'Create New Category',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Beverages' },
                status: { type: 'string', example: 'Active' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Category created' },
        409: { description: 'Duplicate Category name' },
      },
    },
  },
  '/products/categories/{id}': {
    put: {
      tags: ['Products & Categories'],
      summary: 'Update Category Details',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Warm Beverages' },
                status: { type: 'string', example: 'Active' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Category updated successfully' },
        404: { description: 'Category not found' },
      },
    },
    delete: {
      tags: ['Products & Categories'],
      summary: 'Delete Category',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Category deleted successfully' },
      },
    },
  },
  '/products/units': {
    get: {
      tags: ['Units of Measurement'],
      summary: 'List Units of Measurement',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Units retrieved successfully' },
      },
    },
    post: {
      tags: ['Units of Measurement'],
      summary: 'Create New Unit of Measurement',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'abbr'],
              properties: {
                name: { type: 'string', example: 'Kilograms' },
                abbr: { type: 'string', example: 'kg' },
                type: { type: 'string', example: 'Weight' },
                status: { type: 'string', example: 'Active' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Unit created successfully' },
        409: { description: 'Duplicate abbreviation' },
      },
    },
  },
  '/products/units/{id}': {
    put: {
      tags: ['Units of Measurement'],
      summary: 'Update Unit of Measurement',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Unit updated successfully' },
      },
    },
    delete: {
      tags: ['Units of Measurement'],
      summary: 'Delete Unit of Measurement',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Unit deleted successfully' },
      },
    },
  },
  '/products': {
    get: {
      tags: ['Products & Categories'],
      summary: 'List Master Product Catalog',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Products Catalog Retrieved' },
      },
    },
    post: {
      tags: ['Products & Categories'],
      summary: 'Create New Product Master Record',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'sku', 'categoryId', 'unitId', 'retailPrice', 'costPrice'],
              properties: {
                name: { type: 'string', example: 'Iced Latte Double' },
                sku: { type: 'string', example: 'SKU-LAT-003' },
                categoryId: { type: 'number', example: 1 },
                unitId: { type: 'number', example: 1 },
                retailPrice: { type: 'number', example: 550.00 },
                costPrice: { type: 'number', example: 150.00 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Product Created' },
        409: { description: 'Product SKU Conflict' },
      },
    },
  },
  '/products/{id}': {
    get: {
      tags: ['Products & Categories'],
      summary: 'Get Product Details by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Product details retrieved' } },
    },
    put: {
      tags: ['Products & Categories'],
      summary: 'Update Master Product Record',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Product updated successfully' } },
    },
    delete: {
      tags: ['Products & Categories'],
      summary: 'Delete Product Record',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Product deleted successfully' } },
    },
  },
};
