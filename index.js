const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const data = require ("./db.json");
const { moveMessagePortToContext } = require('worker_threads');

const compile = async function(templateName, data) {
  const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
  const html = await fs.readFile(filePath, 'utf-8');

  return hbs.compile(html)(data);
}

hbs.registerHelper('dateFormat', function(value, format) {
  return moment(value).format(format);
});

(async function() {
  try {
    // On ouvre une page (navigateur par défaut : Chromium) sans le mode headless
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage(); // Nouvel onglet

    //// Générer une image à partir d'objets/ de tableaux d'objets en les compilant via handlebars :
    const content = await compile('shot-list', data); // On "compile" data (db.json) avec le template nommé 'shot-list'
    await page.setContent(content); // On assigne le résultat au contenu de la page
    await page.emulateMediaType('screen') // Paramétre à préciser pour le CSS
    await page.pdf({  
      path: 'my-pdf.pdf',
      format: 'A4',
      printBackground: true
    });

    //// Générer un pdf (et une image) à partir d'un site web
    console.log("Go sur handlebar !");
    await page.goto("https://handlebarsjs.com/", { waitUntil: 'networkidle2'}); // Attends la fin du chargement de la page
    await page.screenshot({path: 'handlebarsjs.png'});
    await page.pdf({
      path: 'handlebar-pdf.pdf',
      format: 'A4'
    })

    console.log("done");
    await browser.close()
    process.exit();
  } catch(e) {
    console.log(e);
  }
})();