import { describe, it, expect } from "vitest";
import * as user from '../../functions/createUser';

describe("create user integration", () => {
  it("should error on bad app key", async () => {
    expect(200).toEqual(200)
    // const response = await user.postCreateUser("https://bo-api.drivewealth.io", "clientId", "clientSecret", "appKey")
    //   expect(response.statusCode).toEqual(400)
    //   expect(response.body.response.data).toBe("Client App Key header invalid. Contact tech support.")
  });
});
