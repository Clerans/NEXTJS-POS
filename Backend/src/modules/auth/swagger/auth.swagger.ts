export const authSwaggerDocs = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate User & Issue Tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', example: 'admin' },
                password: { type: 'string', example: 'password' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Login Successful' },
        401: { description: 'Invalid Credentials' },
      },
    },
  },
  '/auth/verify-pin': {
    post: {
      tags: ['Auth'],
      summary: 'Verify Manager PIN Code',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['pinCode'],
              properties: {
                pinCode: { type: 'string', example: '1234' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'PIN Verified' },
        403: { description: 'Invalid PIN Code' },
      },
    },
  },
};
