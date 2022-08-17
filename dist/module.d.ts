import * as _nuxt_schema from '@nuxt/schema';
import { AnimationBuilder, SpinnerTypes, PlatformConfig } from '@ionic/vue';

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
    config?: {
        actionSheetEnter?: AnimationBuilder;
        actionSheetLeave?: AnimationBuilder;
        alertEnter?: AnimationBuilder;
        alertLeave?: AnimationBuilder;
        animated?: boolean;
        backButtonIcon?: string;
        backButtonText?: string;
        hardwareBackButton?: boolean;
        infiniteLoadingSpinner?: SpinnerTypes;
        loadingEnter?: AnimationBuilder;
        loadingLeave?: AnimationBuilder;
        loadingSpinner?: SpinnerTypes;
        menuIcon?: string;
        menuType?: string;
        modalEnter?: AnimationBuilder;
        modalLeave?: AnimationBuilder;
        mode?: 'ios' | 'md';
        navAnimation?: AnimationBuilder;
        pickerEnter?: AnimationBuilder;
        pickerLeave?: AnimationBuilder;
        platform?: PlatformConfig;
        popoverEnter?: AnimationBuilder;
        popoverLeave?: AnimationBuilder;
        refreshingIcon?: string;
        refreshingSpinner?: SpinnerTypes;
        sanitizerEnabled?: boolean;
        spinner?: SpinnerTypes;
        statusTap?: boolean;
        swipeBackEnabled?: boolean;
        tabButtonLayout?: 'icon-top' | 'icon-start' | 'icon-end' | 'icon-bottom' | 'icon-hide' | 'label-hide';
        toastEnter?: AnimationBuilder;
        toastLeave?: AnimationBuilder;
    };
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { ModuleOptions, _default as default };
