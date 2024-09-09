import type { ZodError, ZodIssue } from 'zod'
import { createError } from '#imports'

export interface ValidationError {
  field: string
  message: string
}

export function createValidationError(err: ZodError): Error {
  const errors: ValidationError[] = err.errors.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  const error: Error = createError({
    statusCode: 422,
    statusMessage: 'Unprocessable Entity',
    data: {
      errors: errors,
    },
  })

  return error
}
