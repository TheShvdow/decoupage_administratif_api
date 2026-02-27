export default class ApiResponse {
  public static success<T>(data: T, message = 'Succès') {
    return {
      success: true as const,
      message,
      data,
    }
  }

  public static error(message = 'Erreur', errors: unknown = null) {
    return {
      success: false as const,
      message,
      errors,
    }
  }
}
