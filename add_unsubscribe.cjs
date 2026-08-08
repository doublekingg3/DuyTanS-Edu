const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const settingsBlock = `
    const unsubscribeSettings = onSnapshot(settingsRef, async (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      } else {
        await setDoc(settingsRef, defaultSettings);
      }
      settingsLoaded = true;
      checkLoading();
    });
`;

content = content.replace("    return () => {", settingsBlock + "\n    return () => {");
content = content.replace("      unsubscribeUsers();", "      unsubscribeUsers();\n      unsubscribeSettings();");

fs.writeFileSync(file, content);
