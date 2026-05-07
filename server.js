import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_, response) => {
  response.json({
    service: "zennexus-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/discipline/preview", (request, response) => {
  const consistency = Number(request.body?.consistency || 0);
  const completion = Number(request.body?.completion || 0);
  const integrity = Number(request.body?.integrity || 0);

  const score = consistency * 0.4 + completion * 0.4 + integrity * 0.2;
  response.json({
    consistency,
    completion,
    integrity,
    score: Number(score.toFixed(1))
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Zennexus API running on http://localhost:${PORT}`);
});
