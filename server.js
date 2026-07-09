const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ORDERS_FILE = path.join(ROOT, "orders.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

let orders = [];
try {
  orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
} catch (e) {
  orders = [];
}
function saveOrders() {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index (3).html";
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404 Not Found</h1>");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(function (req, res) {
  const parsed = new URL(req.url, "http://localhost");
  const pathname = parsed.pathname;
  const method = req.method;

  if (pathname === "/api/orders" && method === "GET") {
    return send(res, 200, orders);
  }

  if (pathname === "/api/orders" && method === "POST") {
    return readBody(req).then((body) => {
      const order = Object.assign({}, body, {
        id: body.id || "UB-" + Math.floor(1000 + Math.random() * 9000),
        status: typeof body.status === "number" ? body.status : 0,
        createdAt: body.createdAt || Date.now()
      });
      const idx = orders.findIndex((o) => o.id === order.id);
      if (idx > -1) orders[idx] = order;
      else orders.push(order);
      saveOrders();
      return send(res, 201, order);
    });
  }

  const statusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (statusMatch && method === "PATCH") {
    return readBody(req).then(({ status }) => {
      const order = orders.find((o) => o.id === statusMatch[1]);
      if (!order) return send(res, 404, { error: "Order not found" });
      order.status = status;
      saveOrders();
      return send(res, 200, order);
    });
  }

  if (pathname.startsWith("/api/")) return send(res, 404, { error: "Not found" });

  serveStatic(req, res);
});

server.listen(PORT, function () {
  console.log("Uni-Bite server running at http://localhost:" + PORT);
});
