import axios from 'axios';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

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

export function postAuthenticate(url: string, clientId: string, clientSecret: string, appKey: string): Promise<any> {
  let statusCode: number;
  return new Promise((resolve) => {
    axios.post(url + '/back-office/auth/tokens', {
      "clientID": clientId,
      "clientSecret": clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json',
        'dw-client-app-key': appKey,
      }
    }).then(async (response) => {
      const params = {
        TableName: process.env.AUTH_TOKEN_TABLE_NAME,
        Item: {
          id: 1,
          authToken: response.data.access_token,
          createdAt: Date.now()
        },
      };

      await dynamoDb.put(params).promise().then((response) => {
        statusCode = 201;
        //TODO handle a good response of saving auth token to auth token table
      }).catch((error) => {
        statusCode = 202;
        console.log("NiaError: Error saving auth token to DynamoDB. " + error)
        //TODO Handle gracefully
      });

      resolve({
        statusCode: statusCode,
        body: response.data,
        headers: { 'Content-Type': 'application/json' },
      })
    }).catch((error) => {
      resolve({
        statusCode: 400,
        body: error,
        headers: { 'Content-Type': 'application/json' },
      })
    });
  });
}