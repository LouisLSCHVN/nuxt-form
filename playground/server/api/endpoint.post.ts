import { createUserValidator } from '../validators'

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, createUserValidator.safeParse)

  if (!result.success) {
    return createValidationError(result.error)
  }

  // Store in database..

  return { statusCode: 201, message: 'success' }
})
