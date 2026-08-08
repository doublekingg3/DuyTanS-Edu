const fs = require('fs');
const file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf8');

const settingsInterface = `
export interface AppSettings {
  pageTitle: string;
  pageIcon: string;
  portalBackground: string;
  portalLogo: string;
  loginLogo: string;
  appName: string;
}

export const defaultSettings: AppSettings = {
  pageTitle: "EduManage Pro",
  pageIcon: "",
  portalBackground: "",
  portalLogo: "",
  loginLogo: "",
  appName: "EduManage Pro"
};
`;

content = content.replace("export interface GamificationData {", settingsInterface + "\nexport interface GamificationData {");
fs.writeFileSync(file, content);
