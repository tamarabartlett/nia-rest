import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as authenticate from '../../functions/authenticate';

describe("authenticate unit test", () => {
  const OLD_ENV = process.env;

  let mock;
  const url = "https://bo-api.drivewealth.io"

  beforeEach(() => {
    mock = new MockAdapter(axios);
    process.env.AUTH_TOKEN_TABLE_NAME = "TestAuthTableName"
  })

  afterEach(() => {
    mock.reset();
    process.env = OLD_ENV;
  })

  it("should post to Drive Wealth and return 200 and access code on success", async () => {
    const driveWealthResponse = {
      access_token: "1234567890asdfgjkl;"
    }

    const expectedTableParams = {
      TableName: process.env.AUTH_TOKEN_TABLE_NAME,
        Item: {
          id: 1,
          authToken: "1234567890asdfgjkl",
          createdAt: Date.now()
        },
    }

    mock.onPost(`${url}/back-office/auth/tokens`).reply(200, driveWealthResponse);


    const response = await authenticate.postAuthenticate(url, "clientId", "clientSecret", "appKey")

    expect(mock.history.post[0].url).toEqual(`${url}/back-office/auth/tokens`);
    expect(response.statusCode).toEqual(201)
    expect(response.body.access_token).toBe("1234567890asdfgjkl;")
  });


  it("should post to Drive Wealth and return 400 and the error on error", async () => {
    //TODO What does an error look like?
    const driveWealthResponse = {
      access_token: "1234567890asdfgjkl;"
    }

    mock.onPost(`${url}/back-office/auth/tokens`).reply(200, driveWealthResponse);


    const response = await authenticate.postAuthenticate(url, "clientId", "clientSecret", "appKey")

    expect(mock.history.post[0].url).toEqual(`${url}/back-office/auth/tokens`);

    expect(response.statusCode).toEqual(202)
    expect(response.body.access_token).toBe("1234567890asdfgjkl;")
  });
});
