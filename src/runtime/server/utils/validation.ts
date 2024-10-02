import { createError } from 'h3'

export interface ValidationError {
  field: string
  message: string
}

export function createValidationError(err: unknown): Error {
  console.log(err)
  if (!err) {
    return createError({ statusCode: 500, message: 'Something went wrong' })
  }
  const errors: ValidationError[] = err.errors.map((err: ValidationError) => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  return createError({
    statusCode: 422,
    statusMessage: 'Unprocessable Entity',
    data: {
      errors: errors,
    },
  })
}
