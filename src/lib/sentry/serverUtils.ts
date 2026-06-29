export function captureServerError(error: unknown, context?: Record<string, unknown>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';

  const logData = {
    timestamp: new Date().toISOString(),
    message: errorMessage,
    stack: errorStack,
    context,
  };

  console.error('[API Error]', JSON.stringify(logData));
}

export function captureServerEvent(event: string, data?: Record<string, unknown>) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    data,
  };

  console.log('[API Event]', JSON.stringify(logData));
}
