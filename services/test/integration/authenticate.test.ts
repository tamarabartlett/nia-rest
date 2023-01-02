import { describe, it, expect } from "vitest";
import * as authenticate from '../../functions/authenticate';

describe("authenticate integration test", () => {
  it("should error on bad app key", async () => {
    const response = await authenticate.postAuthenticate("https://bo-api.drivewealth.io", "clientId", "clientSecret", "appKey")
      expect(response.statusCode).toEqual(400)
      expect(response.body.response.data).toBe("Client App Key header invalid. Contact tech support.")
  });

  it("should error on bad client id", async () => {
    const appKey = import.meta.env.VITE_APP_KEY  as string;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET  as string;

    const response = await authenticate.postAuthenticate("https://bo-api.drivewealth.io", "clientId", clientSecret, appKey)
      expect(response.statusCode).toEqual(400)
      expect(response.body.response.data.message).toBe("Invalid clientID or clientSecret.")
  });

  it("should error on bad client secret", async () => {
    const appKey = import.meta.env.VITE_APP_KEY  as string;
    const clientId = import.meta.env.VITE_CLIENT_ID  as string;

    const response = await authenticate.postAuthenticate("https://bo-api.drivewealth.io", clientId, "clientSecret", appKey)
      expect(response.statusCode).toEqual(400)
      expect(response.body.response.data.message).toBe("Invalid clientID or clientSecret.")
  });

  it("should successfully return auth key", async () => {
    const appKey = import.meta.env.VITE_APP_KEY  as string;
    const clientId = import.meta.env.VITE_CLIENT_ID  as string;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET  as string;

    const response = await authenticate.postAuthenticate("https://bo-api.drivewealth.io", clientId, clientSecret, appKey)
      expect(response.statusCode).toEqual(200)
      console.log(response.body)
      expect(response.body.token_type).toBe("Bearer");
      expect(response.body.expires_in).toBeTruthy();
      expect(response.body.access_token).toBeTruthy();
      expect(response.body.scope).toBe("all_trading");
  });
});
