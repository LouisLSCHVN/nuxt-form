<template>
  <h1>Nuxt Form</h1>

  <br>

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
    <input
      type="file"
      @change="form.avatar = $event.target.files[0]"
    >
    <progress
      v-if="form.progress"
      :value="form.progress"
      max="100"
    >
      {{ form.progress.percentage }}%
    </progress>

    <button
      type="submit"
      :disabled="form.processing"
    >
      Submit
    </button>
  </form>
  <p v-if="form.success">
    Success!
  </p>
</template>

<script setup>
const form = useForm({
  email: '',
  password: '',
  avatar: null | File,
})

const submit = async () => {
  form.post('/api/endpoint', {
    onError: (err) => {
      form.reset('password')
      console.warn(err)
    },
    onSuccess: (res) => {
      form.reset()
      console.log(res)
    },
    onFinish: () => {
      console.log('END')
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
