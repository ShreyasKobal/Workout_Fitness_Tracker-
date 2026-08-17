import { createWorker } from "tesseract.js";

function extractWorkout(text) {
  const clean = text.replace(/\n+/g, " ").trim();

  return {
    date:
      clean.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4}/i
      )?.[0] || null,

    workout:
      clean.match(/Walking|Running/i)?.[0] || null,

    distanceKm:
      Number(clean.match(/(\d+\.\d+)\s?km/i)?.[1]) || null,

    time:
      clean.match(/\b\d+:\d{2}:\d{2}\b/)?.[0] || null,

    pace:
      clean.match(/(\d+:\d{2})\s?pace/i)?.[1] || null,

    calories:
      Number(clean.match(/(\d+)\s?calories/i)?.[1]) || null,

    pushups: null,
  };
}


export async function POST(request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return Response.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }


    const worker = await createWorker({
      logger: m => console.log(m),
    });


    await worker.loadLanguage("eng");
    await worker.initialize("eng");


    const { data } = await worker.recognize(
      Buffer.from(imageBase64, "base64")
    );


    await worker.terminate();


    return Response.json({
      extracted: extractWorkout(data.text),
      rawText: data.text,
    });


  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: error.message
      },
      {
        status: 500
      }
    );
  }
}