import type { HTTPMethod } from 'h3'
import { reactive, ref, toRefs } from 'vue'

interface FormOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
  onFinish?: () => void
}

interface ValidationError {
  field: (string | number)[]
  message: string
}

export const useForm = <T extends Record<string, unknown>>(_data: T) => {
  const data = ref({ ..._data })
  const originalData = { ..._data }
  const errors = reactive<Record<string, string>>({})
  const processing = ref(false)

  const setError = (field: keyof T, message: string) => {
    errors[field as string] = message
  }

  const resetErrors = () => {
    Object.keys(errors).forEach((key) => {
      errors[key] = ''
    })
  }

  const reset = (...fields: (keyof T)[]) => {
    if (fields.length === 0) {
      Object.assign(data.value, originalData)
    }
    else {
      fields.forEach((field) => {
        data.value[field] = originalData[field]
      })
    }
  }

  const handleValidationErrors = (validationErrors: ValidationError[]) => {
    resetErrors()
    validationErrors.forEach((error) => {
      const field = error.field as unknown as string
      setError(field, error.message)
    })
  }

  const submit = async (method: HTTPMethod, url: string, options: FormOptions<T>) => {
    try {
      resetErrors()
      processing.value = true
      const res = await $fetch(url, {
        method,
        body: method !== 'GET' ? data.value : undefined,
        params: method === 'GET' ? data.value : undefined,
      })
      processing.value = false
      options.onSuccess?.(res as T)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      const validationErrors = err.data?.data?.errors
      processing.value = false
      if (err.statusCode === 422 && Array.isArray(validationErrors)) {
        handleValidationErrors(validationErrors)
      }
      options.onError?.(err)
    }
    finally {
      options.onFinish?.()
      processing.value = false
    }
  }

  const get = (url: string, options?: FormOptions<T> | null | undefined) => submit('GET', url, options || {})
  const post = (url: string, options?: FormOptions<T>) => submit('POST', url, options || {})
  const put = (url: string, options?: FormOptions<T>) => submit('PUT', url, options || {})
  const patch = (url: string, options?: FormOptions<T>) => submit('PATCH', url, options || {})
  const destroy = (url: string, options?: FormOptions<T>) => submit('DELETE', url, options || {})

  const transform = (transformer: (data: T) => Partial<T>) => {
    const transformedData = transformer(data.value)
    Object.assign(data.value, transformedData)
    return {
      post,
      put,
      patch,
      destroy,
    }
  }

  const form = reactive({
    ...toRefs(data.value),
    value: data,
    errors,
    processing,
    reset,
    resetErrors,
    setError,
    submit,
    get,
    post,
    put,
    patch,
    destroy,
    transform,
  })

  return form
}
