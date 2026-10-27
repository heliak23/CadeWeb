; Instalador do CadêWeb (Inno Setup 6)
;
; Pré-requisito: o bundle do PyInstaller já buildado em backend\dist\CadeWeb
; (rode antes: cd backend && py -m PyInstaller cadeweb.spec --noconfirm)
;
; Compilar:
;   iscc instalador\cadeweb.iss
; Saída: instalador\saida\CadeWeb-Setup-<versao>.exe
;
; Decisões:
; - instala por usuário (PrivilegesRequired=lowest, {autopf} => AppData\Local\Programs):
;   não pede admin, igual VSCode/Discord - e essencial pro auto-update conseguir trocar os arquivos sem elevação.
; - os DADOS do usuário (leads.db, backups...) ficam em %APPDATA%\CadeWeb,
;   criados pelo próprio app - o desinstalador NÃO os apaga de propósito.

#define NomeApp "CadêWeb"
#define VersaoApp "1.0.0"
#define Editor "CadêWeb"
#define URLApp "https://github.com/cadeweb/cadeweb"
#define ExeApp "CadeWeb.exe"

[Setup]
AppId={{8C4F1B63-5D2E-4F9A-8B7C-3E6D9F8A2B41}
AppName={#NomeApp}
AppVersion={#VersaoApp}
AppPublisher={#Editor}
AppPublisherURL={#URLApp}
DefaultDirName={autopf}\{#NomeApp}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=saida
OutputBaseFilename=CadeWeb-Setup-{#VersaoApp}
SetupIconFile=..\backend\cadeweb.ico
UninstallDisplayIcon={app}\{#ExeApp}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ExtraDiskSpaceRequired=52428800

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\backend\dist\CadeWeb\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#NomeApp}"; Filename: "{app}\{#ExeApp}"
Name: "{autodesktop}\{#NomeApp}"; Filename: "{app}\{#ExeApp}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#ExeApp}"; Description: "{cm:LaunchProgram,{#NomeApp}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{cmd}"; Parameters: "/C taskkill /IM {#ExeApp} /F"; Flags: runhidden; RunOnceId: "MatarApp"
