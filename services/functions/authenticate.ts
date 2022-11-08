import https from 'https';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const main: APIGatewayProxyHandlerV2 = async () => {
  try {
    const result = await postRequest({
      "clientID": process.env.CLIENT_ID,
      "clientSecret": process.env.CLIENT_SECRET
    });

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(result.value),
    }
  } finally {
    console.log("Party on finally")
  }
};

function postRequest(body) {
  const options = {
    hostname: process.env.DRIVEWEALTH_URL,
    path: '/back-office/auth/tokens',
    method: 'POST',
    port: 443, // 👈️ replace with 80 for HTTP requests
    headers: {
      'Content-Type': 'application/json',
      'dw-client-app-key': process.env.APP_KEY,
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
    req.write(JSON.stringify(body));
    req.end();
  });
}