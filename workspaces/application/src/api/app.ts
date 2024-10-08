import express from "express";
import { BrokerAsPromised } from "rascal";
import { AppDataSource } from "../shared/db/data-source";
import { ComputeValueJobResult } from "../shared/db/entity/ComputeValueJobResult";

export function createApp(broker: BrokerAsPromised) {
  const app = express();

  const resultRepo = AppDataSource.getRepository(ComputeValueJobResult);

  app.use(express.json({limit: "50mb"}));

  app.post("/add", async (req, res) => {
    try {
      const input = req.body.input;

      const newJob = resultRepo.create({
        input: input
      });

      const job = await resultRepo.save(newJob);

      await broker.publish(
        "determine-puffs",
        JSON.stringify({
          id: job.id,
        }),
      );


      return res.status(201).json({
        success: true,
        jobId: job.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  app.get("/results/:resultId", async (req, res) => {
    try {
      const result = await resultRepo.findOneBy({
        id: parseInt(req.params.resultId, 10),
      });

      if (result) {
        res.status(200).json({result: result.result});
      } else {
        res.status(404).json({
          success: false,
          message: "Result not found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  app.get("/results", async (_req, res) => {
    try {
      const results = await resultRepo.find();
      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  return app;
}
