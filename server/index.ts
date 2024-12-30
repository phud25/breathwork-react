import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { exec } from "child_process";
import { promisify } from "util";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`);
  res.status(status).json({ message });
});

const execAsync = promisify(exec);

async function killProcessOnPort(port: number) {
  try {
    // Find and kill the process using the port
    if (process.platform === 'win32') {
      await execAsync(`netstat -ano | findstr :${port}`);
    } else {
      await execAsync(`lsof -i :${port} -t | xargs kill -9`);
    }
    log(`Killed process on port ${port}`);
  } catch (error) {
    // Ignore errors as the process might not exist
    log(`No process found on port ${port}`);
  }
}

(async () => {
  try {
    const PORT = 5000;

    // Kill any existing process on our port
    await killProcessOnPort(PORT);

    const server = registerRoutes(app);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });

    // Cleanup handler
    const cleanup = () => {
      log('Shutting down server...');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    };

    // Handle termination signals
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('uncaughtException', (err) => {
      log(`Uncaught Exception: ${err.message}`);
      cleanup();
    });

  } catch (error: any) {
    log(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
})();