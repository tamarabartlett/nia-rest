import axios from 'axios';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const url = process.env.url
  const appKey = process.env.appKey

  try {
    const result = await postCreateUser(url, appKey);

    return result
  } finally {
    console.log("Party on finally")
  }
};

async function postCreateUser(url: string, appKey: string) {
  const authTableParams = {
    TableName: process.env.AUTH_TOKEN_TABLE_NAME,
    Key: { "id": 1 }
  }

  const userTableParams = {
    TableName: process.env.USER_TABLE_NAME,
    Item: {
      firstName: "userName",
      createdAt: Date.now()
    },
  };

  dynamoDb.get(authTableParams).promise().then((response) => {
    const accessToken = response["Item"].authToken

    dynamoDb.put(userTableParams).promise().then((response) => {
      // TODO handle the success of the new user to our user dynamo table
      console.log("response from dynamoDB user table")
      console.log(response)
    }).catch((error) => {
      console.log("NiaError: Error retrieving auth token from DynamoDB. " + error)
      //TODO handle the error if saving/update the new user to our user dynamo table
    });

    return new Promise(resolve => {
      axios.post(url + '/back-office/users/', exampleUser, {
        headers: {
          'Content-Type': 'application/json',
          'dw-client-app-key': appKey,
          'Authorization': "Bearer " + accessToken
        }
      }).then((response) => {
        // TODO should we save all the info from the transaction

        resolve({
          statusCode: response.status,
          body: response.data,
          headers: { 'Content-Type': 'application/json' },
        })
      }).catch((error) => {
        // TODO handle bad response from braintree

        resolve({
          statusCode: 400,
          body: error,
          headers: {'Content-Type': 'application/json'},
        })
      })
    })
  }).catch((error) => {
    console.log("NiaError: Error retrieving auth token from DynamoDB. " + error)
  //TODO handle error from get response
  });
}

const exampleUser = {
  "username": "test.individual" + Date(),
  "password": "passw0rd",
  "userType": "INDIVIDUAL_TRADER",
  "documents": [
    {
      "type": "BASIC_INFO",
      "data": {
        "firstName": "Daryl",
        "lastName": "Hall",
        "country": "USA",
        "phone": "2912341122",
        "emailAddress": "b@b.com",
        "language": "en_US"
      }
    },
    {
      "type": "IDENTIFICATION_INFO",
      "data": {
        "value": "123456789",
        "type": "SSN",
        "citizenship": "USA"
      }
    },
    {
      "type": "PERSONAL_INFO",
      "data": {
        "birthDay": 3,
        "birthMonth": 12,
        "birthYear": 1990,
        "marital": "Single",
        "politicallyExposedNames": null
      }
    },
    {
      "type": "ADDRESS_INFO",
      "data": {
        "street1": "123 Main St",
        "city": "Chatham",
        "province": "NJ",
        "postalCode": "09812"
      }
    },
    {
      "type": "EMPLOYMENT_INFO",
      "data": {
        "status": "Employed",
        "broker": false,
        "company": "MyCo",
        "type": "PROFESSIONAL",
        "city": "Gotham",
        "country": "USA",
        "position": "Police"
      }
    },
    {
      "type": "INVESTOR_PROFILE_INFO",
      "data": {
        "investmentObjectives": "Active_DAIly",
        "investmentExperience": "None",
        "annualIncome": -1,
        "networthLiquid": 58932,
        "networthTotal": 485003,
        "riskTolerance": "Low",
        "fundingSources": [
          "EMP",
          "Gambling"
        ],
        "transferFrequencyPerMonth": 7,
        "transferTotalExpected": 45350,
        "investmentHistory12M": 12
      }
    },
    {
      "type": "DISCLOSURES",
      "data": {
        "termsOfUse": true,
        "customerAgreement": true,
        "marketDataAgreement": true,
        "rule14b": true,
        "findersFee": true,
        "privacyPolicy": true,
        "dataSharing": true,
        "signedBy": "Chris Turkelton"
      }
    }
  ]
}

// function postCreateUser(url: string , appKey: string) {
//   // const accessToken = "eyJraWQiOiJBYVc4U1h6UGo2cEpIMkRNdVhoMS1LaXROWXM2V2hTaEI0UWdYYm5Eaks4IiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULnNlMXhlWlg2VS1pcld1cm9BRHZsSVpvVklTbkRBOEFGLVVkWHZBelFvZjQiLCJpc3MiOiJodHRwczovL2FwMS1kcml2ZXdlYWx0aC5va3RhcHJldmlldy5jb20vb2F1dGgyL2F1czNzeTdydTEzV3BkUFNPMWQ3IiwiYXVkIjoiRFdBdXRoU2VydmVyVUFUIiwiaWF0IjoxNjcwMjY0NTY3LCJleHAiOjE2NzAyNjgxNjcsImNpZCI6IjBvYTU3MXBrM3VVOGVwdW9HMWQ3Iiwic2NwIjpbImFsbF90cmFkaW5nIl0sInN1YiI6IjBvYTU3MXBrM3VVOGVwdW9HMWQ3IiwicHJvZmlsZSI6eyJwZXJtaXNzaW9uSUQiOiIyODhhYTJjNi01MTBkLTY4MGYtN2IyZC0xMjc1YTY3MjZjMWEiLCJyb2xlIjoiQUxMX1RSQURFUiIsInBhcnRuZXJJRCI6Ijk2NjFlYjg2LTYzMzAtNDQ5OS05OTVhLTYzODU4NTdhZGNiYSIsInVzZXJJRCI6IjE3MmU2NTZlLWMyOGUtNDY0Mi05ODk0LWE5MWZjZGQxYmQ0NSJ9fQ.P3eVHEUYGzB_rzNlI0zQWhMbtZRu_Zz_C6JsjqUZCOoVCI5_2tjpLt1zBCeXPCs6XbCdbvnyPWseMOdEjWqUQsQHmrRisRubfU-nwMFhDUqgPJY9519n2ZdoM0Vllr0hHfaliVIKi8D4LVRpuwRXIG14ucpOzNL2Hb1ApRsNDGAyXm9UQ_XJj6DdfvQ2DRT2LURmjlaRR6cN2xAdxZ_wExrKlNy6tybudSCGeFGNIXasmgD3DZCyO8Th5_uPqHW6zxXwh7LYb8X2VyJxTXZDlkeHqWUFQJXcVOxCMuLoIGwPOO8i7V7x13UR56zImS_EbomO3fbClGoNWSqAXKXT3Q"
//   // const options = {
//     // hostname: url,
//     // path: '/back-office/users/',
//     // method: 'POST',
//     // port: 443, // 👈️ replace with 80 for HTTP requests
//     // headers: {
//     //   'Content-Type': 'application/json',
//     //   'dw-client-app-key': appKey,
//     //   'Authorization': "Bearer " + accessToken
//     // },
//   // };

//   return new Promise((resolve, reject) => {
//     // const req = https.request(options, res => {
//     //   let rawData = '';

//     //   res.on('data', chunk => {
//     //     rawData += chunk;
//     //   });

//     //   res.on('end', () => {
//     //     try {
//     //       resolve(JSON.parse(rawData));
//     //     } catch (err) {
//     //       reject(new Error(err));
//     //     }
//     //   });
//     // });

//     // req.on('error', err => {
//     //   reject(new Error(err));
//     // });

//     // 👇️ write the body to the Request object
//     const username = "test.individual" + Date()
//     req.write(JSON.stringify(

//     ));
//     req.end();
//   });
// }