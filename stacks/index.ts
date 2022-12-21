import { MainStack } from "./MainStack";
import { App } from "@serverless-stack/resources";
import * as dotenv from 'dotenv'

export default function (app: App) {
  dotenv.config();

  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
  });
  app.stack(MainStack);
}
