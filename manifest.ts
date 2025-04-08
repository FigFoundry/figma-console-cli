export default {
  name: "Console CLI",
  id: "1491170387210430289",
  api: "1.0.0",
  editorType: ["figma"],
  main: "./canvas.js",
  ui: "./plugin.html",
  documentAccess: "dynamic-page",
  networkAccess: {
    allowedDomains: ["none"],
  },
  permissions: ["currentuser"]
};