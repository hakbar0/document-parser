import OpenAI from "openai-api";
import dotenv from "dotenv";
import fs from "fs";
import PDFParser from "pdf-parse";
import path from "path";

dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
const filePath = path.join(__dirname, "cv.pdf");
const model = "text-davinci-003";

const parsePDF = async (filePath: string) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const { text } = await PDFParser(pdfBuffer);
  return text;
};

function removeSpecialChars(text: string): string {
  return text.replace(/[^\w\s]/gi, "");
}

(async () => {
  try {
    const document = await parsePDF(filePath);
    const cleanedDocument = removeSpecialChars(document);
    console.log(cleanedDocument);
    const prompt = `Parse the following document and return a JSON output with the following fields: firstName, lastName, address, postcode, email, mobile number, and job history. The job history should be an array with the format: [{companyName, startDate, endDate}]. If you can't find any answer, please return null. The document is as follows:\n${cleanedDocument}`;

    const response = await openai.complete({
      engine: model,
      prompt: prompt,
      maxTokens: 1024,
      n: 1,
      temperature: 0,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    const parsedResponse = JSON.parse(response.data.choices[0].text);
    console.log(parsedResponse);
  } catch (error) {
    console.error(error);
  }
})();
