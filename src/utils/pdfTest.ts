import { extractTextFromPDF } from "./pdfParser.util";

async function test() {
    const text = await extractTextFromPDF('./test.pdf');
    console.log("Résultat final :", text);
}

test();