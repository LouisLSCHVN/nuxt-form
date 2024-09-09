<template>
  <h1>Nuxt Form</h1>
  <ul>
    <li>
      Aim to add useForm composable in Nuxt <em>(inspired by Inertia)</em>
    </li>
    <li>
      Find a demo in the <code>playground/app.vue</code> file
    </li>
    <li>
      The form will be submitted to <code>/api/endpoint</code>
    </li>
    <li>
      The validation file is in <code>playground/server/validators/index</code>
    </li>
  </ul>
  <form @submit.prevent="submit">
    <input
      v-model="form.email"
      type="text"
      placeholder="Enter your email"
      autocomplete="email"
    >
    <p v-if="form.errors.email">
      {{ form.errors.email }}
    </p>

    <input
      v-model="form.password"
      type="password"
      placeholder="Enter your password"
      autocomplete="current-password"
    >
    <p v-if="form.errors.password">
      {{ form.errors.password }}
    </p>
    <button
      type="submit"
      :disabled="form.proccessing"
    >
      Submit
    </button>
  </form>
  <p v-if="success.state">
    Success!
  </p>
</template>

<script setup>
const form = useForm({
  email: '',
  password: '',
})

const success = ref({
  state: false,
  message: '',
})

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

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
}
</style>
