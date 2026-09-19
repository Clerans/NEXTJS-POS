export const suppliersSwaggerDocs = {
  '/suppliers': {
    get: {
      tags: ['Suppliers'],
      summary: 'List All Registered Suppliers',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Suppliers List Retrieved' },
      },
    },
    post: {
      tags: ['Suppliers'],
      summary: 'Register New Vendor Supplier',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code', 'name', 'phone'],
              properties: {
                code: { type: 'string', example: 'SUP-003' },
                name: { type: 'string', example: 'Lanka Spices & Flavors Ltd' },
                contactPerson: { type: 'string', example: 'Mahesh Perera' },
                phone: { type: 'string', example: '+94 77 555 1234' },
                email: { type: 'string', example: 'contact@lankaspices.lk' },
                paymentTerms: { type: 'string', example: 'NET 30' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Supplier Created' },
        409: { description: 'Duplicate Supplier Code' },
      },
    },
  },
};
