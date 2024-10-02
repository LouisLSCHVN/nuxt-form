# Nuxt Form

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-form?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- ⛰ &nbsp;Form handling similar to Inertia/Vue's useForm
- 🚠 &nbsp;Backend validation with Zod
- 🌲 &nbsp;Frontend form state management
- 🏔 &nbsp;Easy error handling and validation

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-form
```

That's it! You can now use Nuxt Form in your Nuxt app ✨

## Documentation

### Backend Usage

Nuxt Form provides a utility function `createValidationError` for easy backend validation:

```javascript
import { createUserValidator } from '../validators'

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, createUserValidator.safeParse)
  if (!result.success) {
    return createValidationError(result.error)
  }
  // Store in database..
  return { statusCode: 201, message: 'success' }
})
```

### Frontend Usage

On the frontend, you can use the `useForm` composable to handle form state and submission:

```vue
<template>
  <form @submit.prevent="submit">
    <input v-model="form.email" type="text" placeholder="Enter your email">
    <p v-if="form.errors.email">{{ form.errors.email }}</p>

    <input v-model="form.password" type="password" placeholder="Enter your password">
    <p v-if="form.errors.password">{{ form.errors.password }}</p>

    <button type="submit" :disabled="form.processing">Submit</button>
  </form>
  <p v-if="success.state">Success!</p>
</template>

<script setup>
const form = useForm({
  email: '',
  password: '',
})

const success = ref({ state: false, message: '' })

const submit = async () => {
  form.post('/api/endpoint', {
    onError: (err) => {
      form.reset('password')
      console.warn(err)
    },
    onSuccess: (res) => {
      success.value.state = true
      success.value.message = res.message
      form.reset()
    },
  })
}
</script>
```

### Handling Files



This setup provides a seamless integration between frontend form handling and backend validation, similar to the functionality offered by Inertia.js and Vue's useForm, but tailored for Nuxt applications.

## Todo

- [X] Handle file uploads
- [X] Make success state natively available in the composable

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  npm install

  # Generate type stubs
  npm run dev:prepare

  # Develop with the playground
  npm run dev

  # Build the playground
  npm run dev:build

  # Run ESLint
  npm run lint

  # Run Vitest
  npm run test
  npm run test:watch

  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-form/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-form

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-form.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-form

[license-src]: https://img.shields.io/npm/l/nuxt-form.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-form

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
