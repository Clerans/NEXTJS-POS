export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
}

export class ApiResponse {
  static success<T>(data: T, message: string = 'Operation successful', statusCode: number = 200, pagination?: PaginationMeta): ApiResponseEnvelope<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      meta: {
        ...(pagination ? { pagination } : {}),
        timestamp: new Date().toISOString(),
      },
    };
  }

  static error(message: string = 'An error occurred', statusCode: number = 500): ApiResponseEnvelope<null> {
    return {
      success: false,
      statusCode,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
