export const branchesSwaggerDocs = {
  '/branches': {
    get: {
      tags: ['Branches'],
      summary: 'List All Registered Branches',
      responses: {
        200: { description: 'Branches List Retrieved' },
      },
    },
    post: {
      tags: ['Branches'],
      summary: 'Create New Branch Outlet (Administrator Only)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code', 'name'],
              properties: {
                code: { type: 'string', example: 'GALLE' },
                name: { type: 'string', example: 'Galle Fort Outlet' },
                address: { type: 'string', example: 'Main Street, Galle Fort' },
                phone: { type: 'string', example: '0912000004' },
                isActive: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Branch Created' },
        409: { description: 'Duplicate Branch Code' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Requires ADMINISTRATOR Role' },
      },
    },
  },
  '/branches/{id}': {
    get: {
      tags: ['Branches'],
      summary: 'Get Branch Details by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Branch Details Retrieved' },
        404: { description: 'Branch Not Found' },
      },
    },
    put: {
      tags: ['Branches'],
      summary: 'Update Existing Branch (Administrator Only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'GALLE-EXPRESS' },
                name: { type: 'string', example: 'Galle Central Express' },
                address: { type: 'string' },
                phone: { type: 'string' },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Branch Updated' },
        404: { description: 'Branch Not Found' },
        409: { description: 'Duplicate Branch Code' },
      },
    },
    delete: {
      tags: ['Branches'],
      summary: 'Delete Branch (Administrator Only)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Branch Deleted' },
        404: { description: 'Branch Not Found' },
      },
    },
  },
};
