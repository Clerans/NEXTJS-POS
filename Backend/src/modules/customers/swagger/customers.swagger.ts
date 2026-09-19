export const customersSwaggerDocs = {
  '/customers': {
    get: {
      tags: ['Customers'],
      summary: 'List Registered CRM Customers',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Customers List Retrieved' },
      },
    },
    post: {
      tags: ['Customers'],
      summary: 'Register New CRM Customer Account',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'mobile'],
              properties: {
                name: { type: 'string', example: 'Dilshan Silva' },
                mobile: { type: 'string', example: '+94 77 888 9999' },
                email: { type: 'string', example: 'dilshan@gmail.com' },
                groupId: { type: 'number', example: 1 },
                creditLimit: { type: 'number', example: 50000.00 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Customer Account Created' },
        409: { description: 'Duplicate Mobile Phone Conflict' },
      },
    },
  },
  '/customers/groups': {
    get: {
      tags: ['Customer Groups'],
      summary: 'List All Customer Groups',
      responses: { 200: { description: 'Customer groups list retrieved' } },
    },
    post: {
      tags: ['Customer Groups'],
      summary: 'Create Customer Group (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'VIP Corporate' },
                discountRate: { type: 'number', example: 10.0 },
              },
            },
          },
        },
      },
      responses: { 201: { description: 'Customer group created' }, 409: { description: 'Duplicate name' } },
    },
  },
  '/customers/groups/{id}': {
    get: {
      tags: ['Customer Groups'],
      summary: 'Get Customer Group Details by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Customer group details' }, 404: { description: 'Not found' } },
    },
    put: {
      tags: ['Customer Groups'],
      summary: 'Update Customer Group (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Customer group updated' } },
    },
    delete: {
      tags: ['Customer Groups'],
      summary: 'Delete Customer Group (Admin/Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Customer group deleted' } },
    },
  },
};
