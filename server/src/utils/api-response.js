/**
 * Standard API Success Response
 */
export class ApiResponse {
  static success(res, data = {}, meta = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      meta,
    });
  }

  static created(res, data = {}, meta = {}) {
    return ApiResponse.success(res, data, meta, 201);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}
