export default class ApiResponse {
  public static success(data: any, message = 'Succès', status = 200) {
    return {
      success: true,
      status,
      message,
      data,
    }
  }

  public static error(message = 'Erreur', errors: any = null, status = 400) {
    return {
      success: false,
      status,
      message,
      errors,
    }
  }
}
