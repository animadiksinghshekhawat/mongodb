const request = require("supertest");
const app = require("../src/app");

describe("health endpoint", () => {
  it("returns a healthy response", async () => {
    const response = await request(app).get("/api/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("EventHub API");
  });

  it("returns a useful 404 for unknown endpoints", async () => {
    const response = await request(app).get("/api/not-a-route");
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Route not found");
  });
});
