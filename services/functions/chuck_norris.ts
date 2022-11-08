import https from 'https';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const main: APIGatewayProxyHandlerV2 = async () => {
  try {
    const result = await getRequest()

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(result.value),
    }
  } finally {
    console.log("Party on finally")
  }
};

function getRequest() {
  const url = 'https://api.chucknorris.io/jokes/random';

  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
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
  });
}