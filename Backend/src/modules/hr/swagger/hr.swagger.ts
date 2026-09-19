export const hrSwaggerDocs = {
  '/hr/employees': {
    get: {
      tags: ['HR'],
      summary: 'List Employee Roster',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Employee Roster Retrieved' },
      },
    },
  },
  '/hr/attendance/clock-in': {
    post: {
      tags: ['HR'],
      summary: 'Employee Shift Clock-In',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['employeeId'],
              properties: {
                employeeId: { type: 'number', example: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Clock-in Recorded' },
      },
    },
  },
  '/hr/payroll/calculate': {
    post: {
      tags: ['HR'],
      summary: 'Calculate Monthly Staff Payroll',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['employeeId', 'monthYear', 'baseSalary'],
              properties: {
                employeeId: { type: 'number', example: 1 },
                monthYear: { type: 'string', example: '2026-08' },
                baseSalary: { type: 'number', example: 75000.00 },
                overtimeHours: { type: 'number', example: 12 },
                transportClaims: { type: 'number', example: 3500.00 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Payroll Calculated' },
      },
    },
  },
};
