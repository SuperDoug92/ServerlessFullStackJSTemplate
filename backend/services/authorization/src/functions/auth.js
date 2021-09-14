'use strict';
const jwt = require('jsonwebtoken');
// Set in `environment` of serverless.yml
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY;

// Policy helper function
const generatePolicy = (principalId, effect, resource, scopes=null, audience) => {
  console.log('genpolicyscopes: ', scopes)
  console.log('genpolicyaud: ', audience)
  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  var context = {};
  if (scopes){
    context.scopes = scopes
  }
  context.audience = audience;
  authResponse.context = context;

  console.log(authResponse);

  return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, callback) => {
  console.log('event ', event);
  console.log('context ', context);
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized');
  }

  try {
    jwt.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`);
        return callback('Unauthorized');
      }
        // is custom authorizer function
        console.log('valid from customAuthorizer', decoded);
        const permissions = decoded.permissions
        const scopes = permissions.join("|");
        console.log('tutorialscopes '+ scopes)
        const audience = decoded.aud.join("|")
        return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn, scopes, audience));
    });
  } catch (err) {
    console.log('catch error. Invalid token', err);
    return callback('Unauthorized');
  }
};
