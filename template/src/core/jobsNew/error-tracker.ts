export class ErrorTracker {
  private static errors = new Map<string, any>();

  /** Guarda el error original asociado a un jobId. */
  static track(jobId: string, error: any) {
    this.errors.set(jobId, error);
  }

  /** Obtiene y opcionalmente elimina el error asociado a un jobId. */
  static getError(jobId: string, remove: boolean = true): any | undefined {
    const err = this.errors.get(jobId);
    if (remove) {
      this.errors.delete(jobId);
    }
    return err;
  }
}
