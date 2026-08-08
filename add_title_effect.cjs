const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const effectBlock = `
  useEffect(() => {
    if (settings.pageTitle) {
      document.title = settings.pageTitle;
    }
    if (settings.pageIcon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.pageIcon;
    }
  }, [settings.pageTitle, settings.pageIcon]);
`;

content = content.replace("  const handleAddComment = async", effectBlock + "\n  const handleAddComment = async");

fs.writeFileSync(file, content);
