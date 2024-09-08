import "dotenv/config";
import { makeRascalConfig } from "../shared/config";
import { BrokerAsPromised as Broker } from "rascal";
import { AppDataSource } from "../shared/db/data-source";
import { ComputeValueJobResult } from "../shared/db/entity/ComputeValueJobResult";
import os from "node:os";
import cluster from "node:cluster";
import fs from "fs";
import path from "path";
import cv from "@u4/opencv4nodejs";
import Jimp from "jimp";

// Configuration for image pattern paths (hardcoded)
const patternConfig = {
  patterns: [
    { name: "Pattern1", path: path.resolve(__dirname, "../patterns/pattern1.png") },
    { name: "Pattern2", path: path.resolve(__dirname, "../patterns/pattern2.png") },
  ],
};

// Function to decode base64 to image buffer
async function base64ToImage(base64Str: string, outputFilePath: string) {
  const buffer = Buffer.from(base64Str, "base64");
  fs.writeFileSync(outputFilePath, buffer);
}

// Function to load the image using Jimp and convert to OpenCV Mat
async function loadImageToMat(imagePath: string) {
  const image = await Jimp.read(imagePath);
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
  const pngMat = cv.imdecode(buffer); // Decode buffer into OpenCV Mat
  return pngMat;
}

// Function to perform template matching and return an array of matched pattern names
async function findTemplates(inputImagePath: string, scaleRange = [0.5, 2], angleRange = [-30, 30], matchThreshold = 0.8) {
  const inputImageMat = await loadImageToMat(inputImagePath);
  const matchedPatternNames = []; // Array to store the names of matched patterns

  for (const template of patternConfig.patterns) {
    const templateImageMat = await loadImageToMat(template.path);

    for (let scale = scaleRange[0]; scale <= scaleRange[1]; scale += 0.1) {
      const scaledTemplate = templateImageMat.resize(
          Math.round(templateImageMat.cols * scale),
          Math.round(templateImageMat.rows * scale)
      );

      for (let angle = angleRange[0]; angle <= angleRange[1]; angle += 5) {
        const rotatedTemplate = scaledTemplate.warpAffine(
            cv.getRotationMatrix2D(
                new cv.Point2(scaledTemplate.cols / 2, scaledTemplate.rows / 2),
                angle,
                1.0
            ),
            new cv.Size(scaledTemplate.cols, scaledTemplate.rows)
        );

        const matched = inputImageMat.matchTemplate(rotatedTemplate, cv.TM_CCOEFF_NORMED);
        const minMax = matched.minMaxLoc();

        // If match value exceeds threshold, add template name to the array
        if (minMax.maxVal > matchThreshold) {
          matchedPatternNames.push(template.name);
        }
      }
    }
  }

  // Return an array of matched pattern names, or null if no matches found
  return matchedPatternNames;
}

(async () => {
  const PARALLELISM = process.env["PARALLELISM"]
      ? parseInt(process.env["PARALLELISM"])
      : os.availableParallelism();

  if (cluster.isPrimary) {
    console.log("Starting primary", process.pid);

    if (Number.isNaN(PARALLELISM) || PARALLELISM < 1) {
      throw new Error("The PARALLELISM setting has to be set to at least 1");
    }

    // Fork workers
    for (let i = 0; i < PARALLELISM; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`, code, signal);
    });
  } else {
    console.debug("Starting up worker process", process.pid);

    console.log("Connecting to DB");
    await AppDataSource.initialize();
    console.log("Connected to DB");

    const config = makeRascalConfig(
        process.env.AMQP_URL ?? "amqp://localhost",
        "worker-process"
    );

    console.log("Connecting to broker");
    const broker = await Broker.create(config);
    console.log("Opened broker connection");

    const resultRepo = AppDataSource.getRepository(ComputeValueJobResult);

    // Start consuming jobs
    const subscription = await broker.subscribe("worker-add");

    subscription.on("message", async (msg, content, ackOrNack) => {
      try {
        const jobArgs = JSON.parse(content.toString());
        console.log("JOB Args", jobArgs);

        // Decode base64 input image to file
        const inputImagePath = path.resolve(__dirname, `../images/job_${jobArgs.id}_input.png`);
        await base64ToImage(jobArgs.base64Image, inputImagePath);

        // Perform image matching and get matched pattern names
        const matchedPatterns = await findTemplates(inputImagePath);

        const job = await resultRepo.findOneByOrFail({
          id: jobArgs.id,
        });

        // Save the array of matched pattern names or "No match found" if none were found
        job.result = matchedPatterns;

        await resultRepo.save(job);

        ackOrNack();
      } catch (err) {
        console.error("Failed to process the message", err);
        ackOrNack(err as Error);
      }
    });

    const shutdown = async () => {
      console.log("Cancelling subscription");
      await subscription.cancel();
      console.log("Subscription cancelled");

      console.log("Closing broker connection");
      await broker.shutdown();
      console.log("Closed the broker connection");

      console.log("Disconnecting from DB");
      await AppDataSource.destroy();
      console.log("Disconnected from DB");
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    console.log("Worker startup finished", process.pid);
  }
})().catch((err) => {
  console.error("Failed to run the WORKER process", err);
  process.exit(1);
});
