const { execSync } = require('child_process');
try {
  console.log(execSync('git log -n 5 --oneline src/components/settings/whatsapp-config.tsx').toString());
  console.log("---");
  console.log(execSync('git status src/components/settings/whatsapp-config.tsx').toString());
} catch (e) {
  console.error(e.message);
}
