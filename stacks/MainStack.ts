import { Api, StackContext, Table } from "@serverless-stack/resources";

export function MainStack({ stack }: StackContext) {
  // const DRIVEWEALTH_ACCESS_KEY = new Config.Secret(stack, "STRIPE_KEY");

  const authTokenTable = new Table(stack, "AuthTokenFields", {
    fields: {
      id: "number",
      authToken: "string",
      createdAt: "number",
    },
    primaryIndex: { partitionKey: "id" },
  });

  const userTable = new Table(stack, "UserFields", {
    fields: {
      // uid: "" We probably need a user_id of some sort
      firstName: "string",
      createdAt: "number",
    },
    primaryIndex: { partitionKey: "firstName" },
  });

  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        timeout: 20,
        environment: {
          url: process.env.DRIVEWEALTH_URL as string,
          appKey: process.env.APP_KEY as string,
          clientId: process.env.CLIENT_ID as string,
          clientSecret: process.env.CLIENT_SECRET as string,
          AUTH_TOKEN_TABLE_NAME: authTokenTable.tableName,
          USER_TABLE_NAME: userTable.tableName,
        },
        permissions: [authTokenTable, userTable]
        // bind: [accessTokenTable]
      },
    },
    routes: {
      "GET /authenticate": "functions/authenticate.main",
      "POST /createUser": "functions/createUser.main",
    },
  });

  // blogApi.attachPermissions([blogTable]); maybe need this?

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
