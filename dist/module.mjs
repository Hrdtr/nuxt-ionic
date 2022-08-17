import { existsSync, promises } from 'node:fs';
import { useNuxt, installModule, addPlugin, defineNuxtModule, addComponent } from '@nuxt/kit';
import { resolve, join } from 'pathe';
import { readPackageJSON } from 'pkg-types';
import { defineUnimportPreset } from 'unimport';
import { fileURLToPath } from 'url';
import * as icons from 'ionicons/icons/index.mjs';
import { joinURL } from 'ufo';

const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

const useCSSSetup = () => {
  const nuxt = useNuxt();
  const setupCore = () => {
    nuxt.options.css.push("@ionic/vue/css/core.css");
  };
  const setupBasic = () => {
    nuxt.options.css.push(
      "@ionic/vue/css/normalize.css",
      "@ionic/vue/css/structure.css",
      "@ionic/vue/css/typography.css"
    );
  };
  const setupUtilities = () => {
    nuxt.options.css.push(
      "@ionic/vue/css/padding.css",
      "@ionic/vue/css/float-elements.css",
      "@ionic/vue/css/text-alignment.css",
      "@ionic/vue/css/text-transformation.css",
      "@ionic/vue/css/flex-utils.css",
      "@ionic/vue/css/display.css"
    );
  };
  return { setupCore, setupBasic, setupUtilities };
};

const iconsPreset = defineUnimportPreset({
  from: "ionicons/icons",
  imports: Object.keys(icons).map((name) => ({
    name,
    as: "ionicons" + name[0].toUpperCase() + name.slice(1)
  }))
});
const setupIcons = () => {
  const nuxt = useNuxt();
  nuxt.hook("autoImports:sources", (presets) => {
    presets.push(iconsPreset);
  });
};

const setupMeta = () => {
  const nuxt = useNuxt();
  const metaDefaults = [
    { name: "color-scheme", content: "light dark" },
    { name: "format-detection", content: "telephone: no" },
    { name: "msapplication-tap-highlight", content: "no" }
  ];
  nuxt.options.app.head.meta = nuxt.options.app.head.meta || [];
  for (const meta of metaDefaults) {
    if (!nuxt.options.app.head.meta.some((i) => i.name === meta.name)) {
      nuxt.options.app.head.meta.unshift(meta);
    }
  }
  nuxt.options.app.head.viewport = "viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no";
};

const setupPWA = async () => {
  const nuxt = useNuxt();
  nuxt.options.pwa = nuxt.options.pwa || {};
  const pwaOptions = nuxt.options.pwa;
  pwaOptions.meta = pwaOptions.meta || {};
  pwaOptions.meta.mobileAppIOS = pwaOptions.meta.mobileAppIOS ?? true;
  await installModule("@kevinmarrec/nuxt-pwa");
};

const setupRouter = () => {
  const nuxt = useNuxt();
  const pagesDirs = nuxt.options._layers.map(
    (layer) => resolve(layer.config.srcDir || layer.cwd, layer.config.dir?.pages || "pages")
  );
  if (nuxt.options.pages === false || nuxt.options.pages !== true && !pagesDirs.some((dir) => existsSync(dir))) {
    console.warn("Disabling Ionic Router integration as pages dir does not exist.");
    return;
  }
  addPlugin(resolve(runtimeDir, "router"));
  nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {};
  nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || [];
  nuxt.options.vite.optimizeDeps.include.push("@ionic/vue-router");
  nuxt.hook("app:resolve", (app) => {
    app.plugins = app.plugins.filter(
      (p) => !p.src.match(/nuxt3?\/dist\/(app\/plugins|pages\/runtime)\/router/)
    );
  });
  const routes = [];
  nuxt.hook("pages:extend", (pages) => {
    routes.length = 0;
    routes.push("/", ...nuxt.options.nitro.prerender?.routes || []);
    function processPages(pages2, currentPath = "") {
      for (const page of pages2) {
        if (page.path.includes(":"))
          continue;
        const path = joinURL(currentPath, page.path);
        routes.push(path);
        if (page.children)
          processPages(page.children, path);
      }
    }
    processPages(pages);
  });
  nuxt.hook("nitro:build:before", (nitro) => {
    nitro.options.prerender.routes = routes;
  });
  nuxt.hook("prepare:types", ({ references }) => {
    const index = references.findIndex((i) => "types" in i && i.types === "vue-router");
    if (index !== -1) {
      references.splice(index, 1);
    }
  });
  nuxt.hook("app:resolve", (app) => {
    if (!app.mainComponent || app.mainComponent.includes("@nuxt/ui-templates") || app.mainComponent.match(/nuxt3?\/dist/)) {
      app.mainComponent = join(runtimeDir, "app.vue");
    }
  });
};

const module = defineNuxtModule({
  meta: {
    name: "nuxt-ionic",
    configKey: "ionic"
  },
  defaults: {
    integrations: {
      meta: true,
      pwa: true,
      router: true,
      icons: true
    },
    css: {
      core: true,
      basic: true,
      utilities: false
    },
    config: {}
  },
  async setup(options, nuxt) {
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.build.transpile.push(/@ionic/, /@stencil/);
    nuxt.options.runtimeConfig.public.ionic = options.config;
    const ionicConfigPath = join(nuxt.options.rootDir, "ionic.config.json");
    if (!existsSync(ionicConfigPath)) {
      await promises.writeFile(
        ionicConfigPath,
        JSON.stringify(
          {
            name: await readPackageJSON(nuxt.options.rootDir).then(
              ({ name }) => name || "nuxt-ionic-project"
            ),
            integrations: {},
            type: "vue"
          },
          null,
          2
        )
      );
    }
    addPlugin(resolve(runtimeDir, "ionic"));
    IonicBuiltInComponents.map(
      (name) => addComponent({
        name,
        export: name,
        filePath: "@ionic/vue"
      })
    );
    nuxt.hook("autoImports:sources", (presets) => {
      presets.push(
        defineUnimportPreset({
          from: "@ionic/vue",
          imports: [...IonicHooks]
        })
      );
    });
    const { setupBasic, setupCore, setupUtilities } = useCSSSetup();
    if (options.css?.core) {
      await setupCore();
    }
    if (options.css?.basic) {
      await setupBasic();
    }
    if (options.css?.utilities) {
      await setupUtilities();
    }
    if (options.integrations?.icons) {
      await setupIcons();
    }
    if (options.integrations?.meta) {
      await setupMeta();
    }
    if (options.integrations?.pwa) {
      await setupPWA();
    }
    if (options.integrations?.router) {
      await setupRouter();
    }
  }
});
const IonicHooks = [
  "useBackButton",
  "useKeyboard",
  "createAnimation",
  "createGesture",
  "iosTransitionAnimation",
  "mdTransitionAnimation",
  "getPlatforms",
  "isPlatform",
  "menuController",
  "getTimeGivenProgression",
  "onIonViewWillEnter",
  "onIonViewDidEnter",
  "onIonViewWillLeave",
  "onIonViewDidLeave",
  "useIonRouter"
];
const IonicBuiltInComponents = [
  "IonAccordion",
  "IonAccordionGroup",
  "IonAvatar",
  "IonBackdrop",
  "IonBadge",
  "IonBreadcrumb",
  "IonBreadcrumbs",
  "IonButton",
  "IonButtons",
  "IonCard",
  "IonCardContent",
  "IonCardHeader",
  "IonCardSubtitle",
  "IonCardTitle",
  "IonCheckbox",
  "IonChip",
  "IonCol",
  "IonContent",
  "IonDatetime",
  "IonDatetimeButton",
  "IonFab",
  "IonFabButton",
  "IonFabList",
  "IonFooter",
  "IonGrid",
  "IonHeader",
  "IonImg",
  "IonInfiniteScroll",
  "IonInfiniteScrollContent",
  "IonInput",
  "IonItem",
  "IonItemDivider",
  "IonItemGroup",
  "IonItemOption",
  "IonItemOptions",
  "IonItemSliding",
  "IonLabel",
  "IonList",
  "IonListHeader",
  "IonMenu",
  "IonMenuButton",
  "IonMenuToggle",
  "IonNav",
  "IonNavLink",
  "IonNote",
  "IonProgressBar",
  "IonRadio",
  "IonRadioGroup",
  "IonRange",
  "IonRefresher",
  "IonRefresherContent",
  "IonReorder",
  "IonReorderGroup",
  "IonRippleEffect",
  "IonRow",
  "IonSearchbar",
  "IonSegment",
  "IonSegmentButton",
  "IonSelect",
  "IonSelectOption",
  "IonSkeletonText",
  "IonSlide",
  "IonSlides",
  "IonSpinner",
  "IonSplitPane",
  "IonText",
  "IonTextarea",
  "IonThumbnail",
  "IonTitle",
  "IonToggle",
  "IonToolbar",
  "IonVirtualScroll",
  "IonBackButton",
  "IonPage",
  "IonRouterOutlet",
  "IonTabButton",
  "IonTabs",
  "IonTabBar",
  "IonIcon",
  "IonApp",
  "IonActionSheet",
  "IonAlert",
  "IonLoading",
  "IonPicker",
  "IonToast",
  "IonModal",
  "IonPopover"
];

export { module as default };
