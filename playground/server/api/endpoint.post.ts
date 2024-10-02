import { createUserValidator } from '../validators'

export default defineEventHandler(async (event) => {
  const result = await readValidatedFormData(event, createUserValidator.safeParse)
  console.log('Received form data', result)

  if (!result.success) {
    return createValidationError(result.error)
  }

  // Store in database..

  return { statusCode: 201, message: 'success' }
})
