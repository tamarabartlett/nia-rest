import axios from 'axios';
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  const url = process.env.url
  const appKey = process.env.appKey
  const userObject = buildUserObject(event)

  try {
    return await postCreateUser(userObject, url, appKey);
  } finally {
    console.log("Party on finally")
  }
};

function buildUserObject(body: Object){
  // REQUIRED
  // username, password, firstname, lastname, phone, email

  // ASSUMPTIONS
  // from the USA, languague english

  //TODO - add API gateway validation for this endpoint when we determine what we need for validation
  //validate
  // usernamename: length.. duplicate? What happens @ braintree if you try to suggest a username that's already used
    // Should the braintree username == the nia username? I think yes
  // password : complexity

  let newUser = {
    "username": body.username + "" + Date.now(),
    "password": body.password,
    "userType": "INDIVIDUAL_TRADER",
    "documents": [{
      "type": "BASIC_INFO",
      "data": {
        "firstName": body.firstName,
        "lastName": body.lastName,
        "country": "USA",
        "phone": body.phone,
        "emailAddress": body.email,
        "language": "en_US"
      }
    }, {
      "type": "IDENTIFICATION_INFO",
      "data": {
        "value": body.ssn,
        "usTaxPayer": true,
        "type": "SSN",
        "citizenship": "USA"
      }
    }]
  }

  return newUser
}

async function postCreateUser(userObject: Object, url: string, appKey: string) {
  const authTableParams = {
    TableName: process.env.AUTH_TOKEN_TABLE_NAME,
    Key: { "id": 1 }
  }

  // const userTableParams = {
  //   TableName: process.env.USER_TABLE_NAME,
  //   Item: {
  //     firstName: "userName",
  //     createdAt: Date.now()
  //   },
  // };

  dynamoDb.get(authTableParams).promise().then((response) => {
    const accessToken = response["Item"].authToken

      // Comment out to minimize dynamo calls while testing drivewealth
    // dynamoDb.put(userTableParams).promise().then((response) => {
    //   // TODO handle the success of the new user to our user dynamo table
    // }).catch((error) => {
    //   console.log("NiaError: Error retrieving auth token from DynamoDB. " + error)
    //   //TODO handle the error if saving/update the new user to our user dynamo table
    // });

    return new Promise(resolve => {
      axios.post(url + '/back-office/users/', userObject, {
        headers: {
          'Content-Type': 'application/json',
          'dw-client-app-key': appKey,
          'Authorization': "Bearer " + accessToken
        }
      }).then((response) => {
        // TODO should we save all the info from the transaction
        if (response.status === 200){
          console.log(response.status)
          console.log(response.data)
          console.log(response.data.userType.name) // === INDIVIDUAL_TRADER
          console.log(response.data.status.name) // === PENDING
        }

        resolve({
          statusCode: response.status,
          body: response.data,
          headers: { 'Content-Type': 'application/json' },
        })
      }).catch((error) => {
        if (error.response.status === 400){
          console.log("Status: " + error.response.status)
          console.log(error.response.data)
          console.log(error.code)
        }

        //TODO handle error from get response
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

//TODO Pass in more data from user and validate data
    // },
    // {
    //   "type": "PERSONAL_INFO",
    //   "data": {
    //     "birthDay": 3,
    //     "birthMonth": 12,
    //    "birthYear": 1990,
    //     "marital": "Single",
    //     "politicallyExposedNames": null
    //   }
    // },
    //   {
    //     "type": "ADDRESS_INFO",
    //     "data": {
    //       "street1": "123 Main St",
    //       "city": "Chatham",
    //       "province": "NJ",
    //       "postalCode": "09812"
    //     }
    //   },
    //   {
    //     "type": "EMPLOYMENT_INFO",
    //     "data": {
    //       "status": "Employed",
    //       "broker": false,
    //       "company": "MyCo",
    //       "type": "PROFESSIONAL",
    //       "city": "Gotham",
    //       "country": "USA",
    //       "position": "Police"
    //     }
    //   },
    //   {
    //     "type": "INVESTOR_PROFILE_INFO",
    //     "data": {
    //       "investmentObjectives": "Active_DAIly",
    //       "investmentExperience": "None",
    //       "annualIncome": -1,
    //       "networthLiquid": 58932,
    //       "networthTotal": 485003,
    //       "riskTolerance": "Low",
    //       "fundingSources": [
    //         "EMP",
    //         "Gambling"
    //       ],
    //       "transferFrequencyPerMonth": 7,
    //       "transferTotalExpected": 45350,
    //       "investmentHistory12M": 12
    //     }
    //   },
    //   {
    //     "type": "DISCLOSURES",
    //     "data": {
    //       "termsOfUse": true,
    //       "customerAgreement": true,
    //       "marketDataAgreement": true,
    //       "rule14b": true,
    //       "findersFee": true,
    //       "privacyPolicy": true,
    //       "dataSharing": true,
    //       "signedBy": "Chris Turkelton"
    //     }
// }]