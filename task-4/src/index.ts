import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import documentRoutes from "./routes/documentRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;

app.use("/documents", documentRoutes);

app.use("/", (req: Request, res: Response, next: NextFunction): void => {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    res.status(405).send("Method Not Allowed");
    return;
  }
  next();
});

app.use((req: Request, res: Response) => {
  console.log("404 Not Found:", req.originalUrl);
  res.status(404).send("Page not found");
});

app.listen(PORT, () => console.log(`Task 4 server running on port ${PORT}`));
