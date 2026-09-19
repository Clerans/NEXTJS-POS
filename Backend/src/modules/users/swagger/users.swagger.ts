export const usersSwaggerDocs = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'List All System Users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Users List Retrieved' },
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Create New User Account',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password', 'name', 'roleId'],
              properties: {
                username: { type: 'string', example: 'cashier1' },
                password: { type: 'string', example: 'securePass123' },
                name: { type: 'string', example: 'John Cashier' },
                roleId: { type: 'number', example: 3 },
                pinCode: { type: 'string', example: '1234' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'User Created' },
        409: { description: 'Username Already Exists' },
      },
    },
  },
};
