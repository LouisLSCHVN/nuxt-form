import { defineNuxtModule, addPlugin, createResolver, addImports, addServerImports, addServerImportsDir, addImportsDir } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-form',
    configKey: 'useForm',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
  },
})
