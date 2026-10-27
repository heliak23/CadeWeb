/**
 * Hook afterPack do electron-builder: aplica ícone e metadata no executável
 * via rcedit.
 */

const path = require("path");
const fs = require("fs");
const { rcedit } = require("rcedit");

module.exports = async function aposEmpacotar(contexto) {
  let exe = path.join(contexto.appOutDir, "CadêWeb.exe");
  if (!fs.existsSync(exe)) {
    exe = path.join(contexto.appOutDir, "CadeWeb.exe");
  }
  const versao = contexto.packager.appInfo.version;

  const iconePath = path.join(__dirname, "cadeweb.ico");

  await rcedit(exe, {
    icon: iconePath,
    "version-string": {
      ProductName: "CadêWeb",
      FileDescription: "CadêWeb - Prospecção inteligente de clientes locais",
      CompanyName: "CadêWeb",
      LegalCopyright: "MIT License",
      OriginalFilename: path.basename(exe),
    },
    "file-version": versao,
    "product-version": versao,
  });
  console.log(`  • rcedit aplicado (icone + metadata) em ${exe}`);
};
