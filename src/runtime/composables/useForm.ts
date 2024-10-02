import type { HTTPMethod } from 'h3'
import { reactive, ref, toRefs, watch } from 'vue'

interface FormOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
  onFinish?: () => void
  headers?: Record<string, string>
  requestOptions?: {
    withCredentials?: boolean
    timeout?: number
    [key: string]: unknown
  }
  fetchOptions?: {
    [key: string]: unknown
  }
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
  const success = ref(false)
  const progress = ref<number | null>(null)

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
      Object.keys(originalData).forEach((key) => {
        if (data.value[key] instanceof File || data.value[key] instanceof Blob) {
          data.value[key] = null
        }
        else {
          data.value[key] = originalData[key]
        }
      })
    }
    else {
      fields.forEach((field) => {
        if (data.value[field] instanceof File || data.value[field] instanceof Blob) {
          data.value[field] = null
        }
        else {
          data.value[field] = originalData[field]
        }
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

  function hasFiles(data: T): boolean {
    if (data instanceof File || data instanceof Blob) {
      return true
    }

    if (Array.isArray(data)) {
      return data.some(value => hasFiles(value))
    }

    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(value => hasFiles(value as unknown as T))
    }

    return false
  }
  const hasFile = ref(hasFiles(data.value))

  watch(
    data.value,
    (newValue: T) => { hasFile.value = hasFiles(newValue) },
    { deep: true },
  )

  const appendFormData = (formData: FormData) => {
    objectToFormData(formData, data.value)
  }

  function objectToFormData(formData: FormData, data: T, parentKey?: string) {
    if (data instanceof File || data instanceof Blob) {
      if (parentKey) {
        formData.append(parentKey, data)
      }
    }
    else if (Array.isArray(data)) {
      data.forEach((value, index) => {
        const key = parentKey ? `${parentKey}[${index}]` : `${index}`
        objectToFormData(formData, value, key)
      })
    }
    else if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach((key) => {
        const value = data[key]
        const formKey = parentKey ? `${parentKey}[${key}]` : key
        objectToFormData(formData, value as unknown as T, formKey)
      })
    }
    else if (data !== null && data !== undefined) {
      if (parentKey) {
        formData.append(parentKey, String(data))
      }
    }
  }

  const submitFetch = async (method: HTTPMethod, url: string, options: FormOptions<T>) => {
    try {
      const requestData = data.value
      resetErrors()
      processing.value = true
      const res = await $fetch(url, {
        method,
        body: method !== 'GET' ? requestData : undefined,
        params: method === 'GET' ? requestData : undefined,
        ...options.fetchOptions,
      })
      processing.value = false
      options.onSuccess?.(res as T)
      success.value = true
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

  const submitXhr = (method: HTTPMethod, url: string, options: FormOptions<T>) => {
    try {
      resetErrors()
      processing.value = true
      progress.value = 0

      const requestData = new FormData()
      appendFormData(requestData)

      let requestUrl = url
      if (method === 'GET' || method === 'DELETE') {
        const queryParams = new URLSearchParams()
        requestData.forEach((value, key) => {
          queryParams.append(key, value.toString())
        })
        requestUrl += '?' + queryParams.toString()
      }

      const xhr = new XMLHttpRequest()

      xhr.open(method, requestUrl, true)

      if (options.requestOptions) {
        for (const [key, value] of Object.entries(options.requestOptions)) {
          if (key in xhr && typeof xhr[key as keyof XMLHttpRequest] !== 'function') {
            xhr[key as keyof XMLHttpRequest] = value
          }
        }
      }

      if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
          xhr.setRequestHeader(key, value)
        }
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          progress.value = Math.round((event.loaded / event.total) * 100)
        }
      }

      xhr.onload = () => {
        progress.value = null

        let responseData
        try {
          responseData = JSON.parse(xhr.responseText)
        }
        catch (e) {
          console.error(e)
          responseData = xhr.responseText
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          options.onSuccess?.(responseData as T)
          success.value = true
        }
        else {
          if (xhr.status === 422 && responseData?.data?.errors) {
            handleValidationErrors(responseData.data.errors)
          }
          options.onError?.(responseData)
        }
      }

      xhr.onloadend = () => {
        processing.value = false
        options.onFinish?.()
      }

      xhr.onerror = () => {
        processing.value = false
        progress.value = null

        let responseData
        try {
          responseData = JSON.parse(xhr.responseText)
        }
        catch (e) {
          console.error(e)
          responseData = xhr.responseText
        }

        options.onError?.(responseData)
        options.onFinish?.()
      }

      xhr.onabort = () => {
        processing.value = false
        progress.value = null
        options.onFinish?.()
      }

      xhr.ontimeout = () => {
        processing.value = false
        progress.value = null
        options.onError?.(new Error('Request timed out'))
        options.onFinish?.()
      }

      if (method === 'GET' || method === 'DELETE') {
        xhr.send()
      }
      else {
        xhr.send(requestData)
      }
    }
    catch (err: unknown) {
      processing.value = false
      progress.value = null
      options.onError?.(err)
      options.onFinish?.()
    }
  }

  const submit = (method: HTTPMethod, url: string, options: FormOptions<T>) => {
    const requestHandler = hasFile.value ? submitXhr : submitFetch
    return requestHandler(method, url, options)
  }

  const get = (url: string, options?: FormOptions<T>) => submit('GET', url, options || {})
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

  return reactive({
    ...toRefs(data.value),
    value: data,
    errors,
    processing,
    success,
    progress,
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
}
