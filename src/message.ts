/**
 * Make sure the status message is safe to use in a response.
 * @returns string
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
 * Make sure the status code is a valid HTTP status code.
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
 * Checks if a certain input has a given property.
 * @param obj - The input to check.
 * @param prop - The property to check for.
 * @returns A boolean indicating whether the input is an object and has the property.
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
 * Runtime Error
 * @class
 * @extends Error
 * @property {number} statusCode - An integer indicating the HTTP response status code.
 * @property {string} statusMessage - A string representing the HTTP status message.
 * @property {boolean} fatal - Indicates if the error is a fatal error.
 * @property {boolean} unhandled - Indicates if the error was unhandled and auto captured.
 * @property {DataT} data - An extra data that will be included in the response.
 *                         This can be used to pass additional information about the error.
 * @property {boolean} internal - Setting this property to `true` will mark the error as an internal error.
 */
class _Error<DataT = unknown> extends Error {
  /**
   * @type {number}
   */
  statusCode = 500
  /**
   * @type {boolean}
   */
  fatal = false
  /**
   * @type {boolean}
   */
  unhandled = false
  /**
   * @type {?string}
   */
  statusMessage?: string
  /**
   * @type {?DataT}
   */
  data?: DataT
  /**
   * @type {?unknown}
   */
  cause?: unknown

  /**
   * Creates an instance of _Error.
   *
   * @constructor
   * @param {string} message
   * @param {{ cause?: unknown }\} [opts]
   */
  constructor(message: string, opts: { cause?: unknown } = {}) {
    super(message, opts)

    // Polyfill cause for other runtimes
    if (opts.cause && !this.cause) {
      this.cause = opts.cause
    }
  }

  /**
   * @returns (Pick<_Error<DataT>, 'message' | 'statusCode' | 'statusMessage' | 'data'>)
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
 * Creates a new `Error` that can be used to handle both internal and runtime errors.
 *
 * @param input {string | (Partial<_Error> & { status?: number statusText?: string })} - The error message or an object containing error properties.
 * If a string is provided, it will be used as the error `message`.
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
 * @return {_Error} - An instance of _Error.
 *
 * @remarks
 * - Typically, `message` contains a brief, human-readable description of the error, while `statusMessage` is specific to HTTP responses and describes
 * the status text related to the response status code.
 * - In a client-server context, using a short `statusMessage` is recommended because it can be accessed on the client side. Otherwise, a `message`
 * passed to `createError` on the server will not propagate to the client.
 * - Consider avoiding putting dynamic user input in the `message` to prevent potential security issues.
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
 * @export
 * @interface IMessage
 * @typedef {IMessage}
 * @template [T=unknown]
 */
export interface IMessage<T = unknown> {
  /**
   * @type {?T}
   */
  data?: T
  /**
   * @type {?number}
   */
  status?: number
  /**
   * @type {?number}
   */
  statusCode?: number
  /**
   * @type {?string}
   */
  statusMessage?: string
  /**
   * @type {?string}
   */
  message?: string
}

/**
 * Creates a new `Success` that can be used to handle both internal and runtime.
 *
 * @param input {string | (Partial<DataT> & { status?: number statusText?: string })} - The message or an object containing properties.
 * If a string is provided, it will be used as the success `message`.
 *
 * @example
 * // String success where `status` defaults to `200`
 * createSuccess('An success message')
 * // Object success
 * createSuccess({
 *   status: 200,
 *   message: 'Invalid input',
 *   data: { field: 'email' }
 * })
 *
 * @return {IMessage} - An instance of success message.
 *
 * @remarks
 * - Typically, `message` contains a brief, human-readable description of the success, while `statusMessage` is specific to HTTP responses and describes
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
