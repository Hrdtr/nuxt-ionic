
import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['ionic']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['ionic']?: ModuleOptions }
}


export { default } from './module'
