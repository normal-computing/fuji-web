import packageJson from "./package.json" assert { type: "json" };

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  name: "Fuji",
  version: packageJson.version,
  description: packageJson.description,
  permissions: [
    "storage",
    "sidePanel",
    "tabs",
    "activeTab",
    "scripting",
    "clipboardWrite",
    "debugger",
    "management",
  ],
  host_permissions: ["<all_urls>"],
  side_panel: {
    default_path: "src/pages/sidepanel/index.html",
  },
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    // default_popup: 'src/pages/popup/index.html',
    default_title: "Click to open side panel",
    default_icon: "icon-34.png",
  },
  icons: {
    128: "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      css: ["assets/css/contentStyleGlobal.css"],
      run_at: "document_start", // load the js as soon as possible since it does not rely on the DOM
    },
  ],
  // devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "assets/fonts/*",
        "icon-128.png",
        "icon-34.png",
        "src/pages/permission/index.html",
        "src/pages/permission/requestPermissions.ts",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
