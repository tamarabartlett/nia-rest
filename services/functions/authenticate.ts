import https from 'https';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const url = process.env.url
  const clientId = process.env.clientId
  const clientSecret = process.env.clientSecret
  const appKey = process.env.appKey

  console.log(event)
  try {
    const result = await postRequest(url, clientId, clientSecret, appKey);

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(result),
    }
  } finally {
    console.log("Party on finally")
  }
};

function postRequest(url: string , clientId: string , clientSecret: string , appKey: string) {
  const options = {
    hostname: url,
    path: '/back-office/auth/tokens',
    method: 'POST',
    port: 443, // 👈️ replace with 80 for HTTP requests
    headers: {
      'Content-Type': 'application/json',
      'dw-client-app-key': appKey,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', err => {
      reject(new Error(err));
    });

    // 👇️ write the body to the Request object
    req.write(JSON.stringify({
      "clientID": clientId,
      "clientSecret": clientSecret
    }));
    req.end();
  });
}