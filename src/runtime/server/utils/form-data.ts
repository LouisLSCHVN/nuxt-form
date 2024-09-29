/**
 * TODO: need to keep the filename somewhere, like avatar:
 *            { filename 'louis.png', content: Buffer or String }
 */

export async function readValidatedFormData<
  T,
  Event extends H3Event = H3Event,
  _T = InferEventInput<'formData', Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T> {
  // Read the data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createValidationError('No form data received')
  }
  // Convert form data in object
  const formDataObj: Record<string, never> = {}
  formData.forEach((field) => {
    if (field.name) {
      formDataObj[field.name] = field.type === 'file' ? field : field.data.toString()
    }
  })

  // Validate the data
  const validated = validate(formDataObj)

  return validated.success
    ? { success: true, data: formData }
    : { success: false, error: validated.error }
}
