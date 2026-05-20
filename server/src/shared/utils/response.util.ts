export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const createSuccessResponse = <T>(
  message: string = "Success",
  data?: T,
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const createErrorResponse = (
  message: string = "Error occured",
  errors?: any,
): ApiResponse => ({
  success: false,
  message,
  errors,
});
