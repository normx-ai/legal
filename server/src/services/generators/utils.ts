import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";

/**
 * Génère un fichier DOCX à partir d'un template et de données.
 * Retourne le Buffer du document généré.
 */
export function generateDocx(templateName: string, data: Record<string, any>): Buffer {
  const templatePath = path.join(__dirname, "../../../templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template non trouvé : ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
  });

  doc.render(data);

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

export const UNITS = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
export const TEENS = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
export const TENS = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

export function numberToWords(n: number): string {
  if (n === 0) return "zéro";
  if (n < 0) return "moins " + numberToWords(-n);

  let result = "";

  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    result += (millions === 1 ? "un million" : numberToWords(millions) + " millions");
    n %= 1000000;
    if (n > 0) result += " ";
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    result += (thousands === 1 ? "mille" : numberToWords(thousands) + " mille");
    n %= 1000;
    if (n > 0) result += " ";
  }

  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    result += (hundreds === 1 ? "cent" : UNITS[hundreds] + " cent");
    n %= 100;
    if (n > 0) result += " ";
    else if (hundreds > 1) result += "s";
  }

  if (n >= 10) {
    if (n < 20) {
      result += TEENS[n - 10];
      n = 0;
    } else {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (ten === 7 || ten === 9) {
        result += TENS[ten];
        if (unit + (ten === 7 ? 10 : 10) < 20) {
          result += (unit === 1 && ten === 7 ? " et " : "-") + TEENS[unit + (ten === 7 ? 0 : 0)];
        } else {
          result += "-" + TEENS[unit];
        }
        n = 0;
      } else {
        result += TENS[ten];
        if (unit === 1 && ten !== 8) result += " et ";
        else if (unit > 0) result += "-";
        n = unit;
      }
    }
  }

  if (n > 0) {
    result += UNITS[n];
  }

  return result.trim();
}
