import { Api, StackContext } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {
  // Create the HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        timeout: 20,
        environment: { 
          url: process.env.DRIVEWEALTH_URL as string,
          appKey: process.env.APP_KEY as string,
          clientId: process.env.CLIENT_ID as string,
          clientSecret: process.env.CLIENT_SECRET as string,
        },
      },
    },
    routes: {
      "GET /notes": "functions/list.main",
      "GET /notes/{id}": "functions/get.main",
      "PUT /notes/{id}": "functions/update.main",
      "POST /authenticate": "functions/authenticate.main",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
