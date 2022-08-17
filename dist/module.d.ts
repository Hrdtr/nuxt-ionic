import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    integrations?: {
        router?: boolean;
        pwa?: boolean;
        meta?: boolean;
        icons?: boolean;
    };
    css?: {
        core?: boolean;
        basic?: boolean;
        utilities?: boolean;
    };
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { ModuleOptions, _default as default };
