/**
 * Sanitizes a status message to ensure it is safe for use in a response.
 *
 * @param {string} [statusMessage] - The status message to sanitize.
 * @returns {string} The sanitized status message.
 */
export function sanitizeStatusMessage(statusMessage = ''): string {
  return statusMessage
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Validates and sanitizes a status code, ensuring it is a valid HTTP status code.
 *
 * @param {string | number} [statusCode] - The status code to validate.
 * @param {number} [defaultStatusCode] - The default status code to return if validation fails.
 * @returns {number} A valid HTTP status code.
 */
export function sanitizeStatusCode(
  statusCode?: string | number,
  defaultStatusCode = 200,
): number {
  if (!statusCode) {
    return defaultStatusCode
  }
  if (typeof statusCode === 'string') {
    statusCode = Number.parseInt(statusCode, 10)
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode
  }
  return statusCode
}

/**
 * Checks if an object has a specified property.
 *
 * @param {any} obj - The object to check.
 * @param {string | symbol} prop - The property name to check for.
 * @returns {boolean} True if the object has the specified property; otherwise, false.
 */
export function hasProp(obj: any, prop: string | symbol): boolean {
  try {
    return prop in obj
  }
  catch {
    return false
  }
}

/**
 * Custom error class extending the built-in Error class.
 * This class is used to represent runtime errors with additional properties.
 *
 * @class
 * @extends {Error}
 * @template DataT - The type of extra data included with the error.
 */
class _Error<DataT = unknown> extends Error {
  statusCode = 500
  fatal = false
  unhandled = false
  statusMessage?: string
  data?: DataT
  cause?: unknown

  /**
   * Creates an instance of _Error.
   *
   * @constructor
   * @param {string} message - The error message.
   * @param {{ cause?: unknown }} [opts] - Optional parameters including the cause of the error.
   */
  constructor(message: string, opts: { cause?: unknown } = {}) {
    super(message, opts)

    // Polyfill cause for other runtimes
    if (opts.cause && !this.cause) {
      this.cause = opts.cause
    }
  }

  /**
   * Converts the error instance to a JSON representation.
   *
   * @returns {Pick<_Error<DataT>, 'message' | 'statusCode' | 'statusMessage' | 'data'>} The JSON representation of the error.
   */
  toJSON(): Pick<
    _Error<DataT>,
    'message' | 'statusCode' | 'statusMessage' | 'data'
  > {
    const obj: Pick<
      _Error<DataT>,
      'message' | 'statusCode' | 'statusMessage' | 'data'
    > = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500),
    }

    if (this.message) {
      obj.message = sanitizeStatusMessage(this.message)
    }

    if (this.data !== undefined) {
      obj.data = this.data
    }

    return obj
  }
}

/**
 * Creates a new instance of _Error to handle both internal and runtime errors.
 *
 * @param {string | (Partial<_Error> & { status?: number, statusText?: string })} input - The error message or an object containing error properties.
 * @returns {_Error} An instance of _Error.
 *
 * @example
 * // String error where `statusCode` defaults to `500`
 * throw createError('An error occurred')
 * // Object error
 * throw createError({
 *   statusCode: 400,
 *   statusMessage: 'Bad Request',
 *   message: 'Invalid input',
 *   data: { field: 'email' }
 * })
 *
 * @remarks
 * - `message` contains a brief, human-readable description of the error.
 * - `statusMessage` is specific to HTTP responses, describing the status text related to the status code.
 * - Avoid including dynamic user input in `message` to prevent potential security issues.
 */
export function createError<DataT = unknown>(
  input:
    | string
    | (Partial<_Error<DataT>> & { status?: number, statusText?: string }),
): _Error {
  if (typeof input === 'string') {
    return new _Error<DataT>(input)
  }

  // Inherit _Error properties from cause as fallback
  const cause: unknown = input.cause

  const err = new _Error<DataT>(input.message ?? input.statusMessage ?? '', {
    cause: cause || input,
  })

  if (input.data) {
    err.data = input.data
  }

  const statusCode = input.statusCode
    ?? input.status
    ?? (cause as _Error)?.statusCode
    ?? (cause as { status?: number })?.status

  if (typeof statusCode === 'number') {
    err.statusCode = sanitizeStatusCode(statusCode)
  }

  const statusMessage = input.statusMessage
    ?? input.statusText
    ?? (cause as _Error)?.statusMessage
    ?? (cause as { statusText?: string })?.statusText

  if (statusMessage) {
    err.message = sanitizeStatusMessage(statusMessage)
  }

  const fatal = input.fatal ?? (cause as _Error)?.fatal
  if (fatal !== undefined) {
    err.fatal = fatal
  }

  const unhandled = input.unhandled ?? (cause as _Error)?.unhandled
  if (unhandled !== undefined) {
    err.unhandled = unhandled
  }

  return err
}

/**
 * Interface representing a message with optional properties for status and data.
 *
 * @export
 * @interface IMessage
 * @template T - The type of the data included in the message.
 */
export interface IMessage<T = unknown> {
  data?: T
  status?: number
  statusCode?: number
  statusMessage?: string
  message?: string
}

/**
 * Creates a new success message to indicate a successful operation.
 *
 * @param {string | (Partial<DataT> & { status?: number, statusText?: string })} input - The success message or an object containing properties.
 * @returns {IMessage} An instance of success message.
 *
 * @example
 * // String success where `status` defaults to `200`
 * createSuccess('A success message')
 * // Object success
 * createSuccess({
 *   status: 200,
 *   message: 'Operation completed successfully',
 *   data: { field: 'email' }
 * })
 *
 * @remarks
 * - The `message` contains a brief, human-readable description of the success.
 * - The `statusMessage` is specific to HTTP responses and describes the status of the request.
 */
export function createSuccess<DataT extends IMessage>(
  input:
    | string
    | (Partial<DataT> & { status?: number, statusText?: string }),
): IMessage {
  const succ: Omit<IMessage, 'status' | 'statusMessage'> = {}

  if (typeof input === 'string') {
    succ.statusCode = 200
    succ.message = input
  }
  else {
    succ.data = input.data
    succ.statusCode = sanitizeStatusCode(input.statusCode ?? input.status)
    succ.message = sanitizeStatusMessage(
      input.statusMessage ?? input.statusText ?? input.message
      ?? 'Request successful',
    )
  }

  return succ
}
