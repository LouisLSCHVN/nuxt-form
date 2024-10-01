import type { H3Event, InferEventInput, MultiPartData, ValidateFunction, ValidateResult } from 'h3'
import { readValidatedBody, readMultipartFormData, getHeader } from 'h3'

import { createValidationError } from './validation'

export async function readValidatedFormData<
  T,
  Event extends H3Event = H3Event,
  _T = InferEventInput<'body', Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<boolean | _T | ValidateResult<_T>> {
  const contentType = getHeader(event, 'content-type')

  if (!contentType?.includes('multipart/form-data')) {
    return await readValidatedBody(event, validate)
  }
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createValidationError('No form data received')
  }

  const formDataObj = formatFormData(formData)
  return validate(formDataObj)
}

const formatFormData = (formData: MultiPartData[]) => {
  const formDataObj: Record<string, unknown> = {}
  formData.forEach((field) => {
    if (field.name) {
      formDataObj[field.name] = field.type === 'file' ? field : field.data.toString()
    }
  })
  return formDataObj
}
