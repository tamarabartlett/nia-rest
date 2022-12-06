import { describe, it, expect } from "vitest";
import * as authenticate from '../functions/authenticate';

describe("sample", () => {
  it("should work", () => {

    process.env.url = "url"
    process.env.clientId = "clientId"
    process.env.clientSecret = "clientSecret"
    process.env.appKey = "appKey"

    authenticate.main({}, {}, {}).then((response) => {
      expect(true).toBe(true);
      expect(response.statusCode).toBe(200)
    })
  });
});
