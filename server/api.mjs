import { createRouter } from "@whatwg-node/router";
import { service } from "./service.mjs";
import { routeTable } from "./routes.mjs";
import { guarded } from "./transport.mjs";
export function createApi(db, clock) {
  const router = createRouter();
  for (const [method, path, handler] of routeTable(db, service, clock))
    router[method.toLowerCase()](path, (request) =>
      handler(request, request.params ?? {}),
    );
  return guarded((req) => router.fetch(req));
}
