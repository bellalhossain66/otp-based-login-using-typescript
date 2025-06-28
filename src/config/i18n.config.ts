import i18n from 'i18n';
import path from 'path';
import fs from 'fs';

const sourceLangDir = path.join(__dirname, '../lang');
const tempLangDir = path.join(__dirname, '../.tmp_lang');

if (!fs.existsSync(tempLangDir)) {
  fs.mkdirSync(tempLangDir);
}

const locales: string[] = fs
  .readdirSync(sourceLangDir)
  .filter((lang) =>
    fs.statSync(path.join(sourceLangDir, lang)).isDirectory()
  );

locales.forEach((locale: string) => {
  const langPath = path.join(sourceLangDir, locale);
  const files = fs
    .readdirSync(langPath)
    .filter((file) => file.endsWith('.json'));

  const merged: Record<string, any> = {};

  files.forEach((file: string) => {
    const fileName = path.basename(file, '.json');
    const content = JSON.parse(
      fs.readFileSync(path.join(langPath, file), 'utf8')
    );
    merged[fileName] = content;
  });

  fs.writeFileSync(
    path.join(tempLangDir, `${locale}.json`),
    JSON.stringify(merged, null, 2)
  );
});

i18n.configure({
  locales,
  defaultLocale: 'ar',
  directory: tempLangDir,
  extension: '.json',
  autoReload: false,
  objectNotation: true,
  updateFiles: false,
  register: global,
  api: {
    '__': '__',
    '__n': 'langN',
  },
});

export default i18n;