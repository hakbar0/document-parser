import OpenAI from "openai-api";
import dotenv from "dotenv";
import fs from "fs";
import PDFParser from "pdf-parse";
import path from "path";

dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
const filePath = path.join(__dirname, "cv.pdf");
const model = "davinci-codex";

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
    const prompt = `Parse the following document and return a JSON output. If you can't find any answer, please return null. The Json returned should be in the format of. Where jobHist is the different companies the worker has worked
    {
      "firstName", "lastname", "address", "postcode", contact", jobHist:[{companyName, startdate, enddate, summary}]
    }
    :\n${cleanedDocument}`;

    const response = await openai.complete({
      engine: model,
      prompt: prompt,
      maxTokens: 1024,
      n: 1,
      temperature: 0.7,
    });

    const parsedResponse = response.data.choices;
    console.log(parsedResponse);
  } catch (error) {
    console.error(error);
  }
})();
