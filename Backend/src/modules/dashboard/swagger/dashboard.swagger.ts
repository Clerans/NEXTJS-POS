export const dashboardSwaggerDocs = {
  paths: {
    '/api/v1/dashboard/metrics': {
      get: {
        summary: 'Get top dashboard KPIs',
        description: 'Returns real-time aggregated total sales, active customer count, monthly growth percentage, and order counts.',
        tags: ['Dashboard'],
        parameters: [
          {
            name: 'branchId',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Optional branch filter ID',
          },
        ],
        responses: {
          200: {
            description: 'Successful metrics response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalSales: { type: 'number', example: 186400 },
                        activeCustomers: { type: 'integer', example: 2140 },
                        monthlyGrowth: { type: 'number', example: 14.2 },
                        totalOrders: { type: 'integer', example: 1482 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/dashboard/sales-trend': {
      get: {
        summary: 'Get sales trend line chart data',
        tags: ['Dashboard'],
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['This Week', 'This Month', 'This Year'] },
            description: 'Aggregation window period',
          },
        ],
        responses: {
          200: { description: 'Sales trend data points array' },
        },
      },
    },
    '/api/v1/dashboard/orders-by-type': {
      get: {
        summary: 'Get order breakdown percentages by order type',
        tags: ['Dashboard'],
        responses: {
          200: { description: 'Orders distribution details' },
        },
      },
    },
    '/api/v1/dashboard/recent-sales': {
      get: {
        summary: 'Get recent sales feed',
        tags: ['Dashboard'],
        responses: {
          200: { description: 'Recent sales items array' },
        },
      },
    },
    '/api/v1/dashboard/low-stock-alerts': {
      get: {
        summary: 'Get low stock warning items',
        tags: ['Dashboard'],
        responses: {
          200: { description: 'Low stock items list' },
        },
      },
    },
  },
};
