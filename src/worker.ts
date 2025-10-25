import { parentPort } from "worker_threads";
import http from "http";

if (!parentPort) throw new Error("Must run as worker thread");

const PORT = 4000;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/log") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { message } = JSON.parse(body);
        const time = new Date().toISOString();
        parentPort!.postMessage({ type: "log", data: `[${time}] ${message}` });
        res.writeHead(200);
        res.end("Logged\n");
      } catch (err) {
        res.writeHead(400);
        res.end("Invalid JSON\n");
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => console.log(`Worker API running on port ${PORT}`));
