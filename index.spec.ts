import { StartedTestContainer, GenericContainer } from "testcontainers";
import Redis from "ioredis";

let container: StartedTestContainer;
let client: Redis.Redis;

beforeAll(async (done) => {
  container = await new GenericContainer("redis", "5-alpine")
    .withExposedPorts(6379)
    .withNetworkMode("bridge")
    .start();

  const [host, port] = [
    container.getContainerIpAddress(),
    container.getMappedPort(6379),
  ];

  client = new Redis({ host, port });

  done();
});

afterAll(async (done) => {
  client.disconnect();
  await container.stop();

  done();
});

beforeEach(async (done) => {
  await client.set("home:click", 0);
  done();
});

afterEach(async (done) => {
  await client.del("home:click");
  done();
});

test("Reading and updating value", async () => {
  const clicks = await client.get("home:click");
  expect(clicks).toStrictEqual("0");

  await client.incr("home:click");
  const clicksUpdated = await client.get("home:click");
  expect(clicksUpdated).toStrictEqual("1");
});

test("Reading unknown key throws error", async () => {
  const clicks = await client.get("carrers:click");

  expect(clicks).toBeNull();
});
