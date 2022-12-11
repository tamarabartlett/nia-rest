// import https from 'https';
import axios from 'axios';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const url = process.env.url
  const clientId = process.env.clientId
  const clientSecret = process.env.clientSecret
  const appKey = process.env.appKey

  try {
    const result = await postAuthenticate(url, clientId, clientSecret, appKey);

    return result
  } finally {
    console.log("Party on finally")
  }
};

export function postAuthenticate(url: string , clientId: string , clientSecret: string , appKey: string): Promise<any> {
  return new Promise((resolve) => {
    axios.post(url + '/back-office/auth/tokens', {
      "clientID": clientId,
      "clientSecret": clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json',
        'dw-client-app-key': appKey,
      }
    }).then(function (response) {
      console.log("response in then: " + response )
      resolve({
        statusCode: 200,
        body: response,
        headers: {'Content-Type': 'application/json'},
      })
    }).catch(function (error) {
      resolve({
        statusCode: 400,
        body: error,
        headers: {'Content-Type': 'application/json'},
      })
    });
  });
}