'use strict';
const scopeCheck = (event, required_scopes) => {
  console.log('scopeCheckEvent: ', event);
  
  var returnobj = {
    authorized: false,
    message: undefined
  }

  if (!required_scopes){
    returnobj.message = 'Unauthorized'
    return returnobj
  }
  if (!event['requestContext']['authorizer']['scopes']){
    returnobj.message = 'No scopes provided'
    return returnobj
  }
  const provided_scopes = event['requestContext']['authorizer']['scopes'] 
  console.log('providedscopes: ', provided_scopes)
  console.log('requiredscopes: ', required_scopes)
  console.log('includes? ', provided_scopes.includes(required_scopes))
  console.log('instanceof? ', required_scopes instanceof String)
  if (typeof required_scopes === 'string'){
    //There is only one required_scopes scope to check
      if  (provided_scopes.includes(required_scopes)){
        console.log('Scope check passed for: ' + required_scopes)
        returnobj.authorized = true
        return returnobj
      }else{
        returnobj.message = 'Scope check failed for: ' + required_scopes
        return returnobj
      }
  }
      
  if (Array.isArray(required_scopes)){
    // # There are one or more scopes to check in an array
      // # If there is more than one provided scope it should 
      // # be separated with a pipe character.
      provided_scopes = provided_scopes.split('|')
      if (required_scopes.every(val => provided_scopes.includes(val))){
        // # If the required scopes are all included in the provided scopes
          console.log('Scope check passed for: ' + required_scopes)
          returnobj.authorized = true
          return returnobj
      }else{
        returnobj.message = 'Scope check failed for: ' + required_scopes
        return returnobj
      }      
  }
}

module.exports.trialfunction = async (event, context) => {
  console.log('TrialFunctionEvent: ',event);
  console.log('Trialfunction authorizer: ', event.requestContext.authorizer)
  // console.log('TrialFunctionContext: ',context);

  const authObj = await scopeCheck(event, 'read:response')
  const audience = event.requestContext.authorizer.audience.split('|')
  const audienceCheck = (audience.includes('https://p8ybzhtnn1.execute-api.us-east-1.amazonaws.com/dev/v1/trialfunction') ? true : false);
  console.log('authObj: ', authObj)
  console.log('audienceCheck: ', audienceCheck)
  if (authObj.authorized && audienceCheck){
    return {
      statusCode: 200,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        },
      body: JSON.stringify({
        message: 'Trial function executed successfully!',
        input: event
      })
    }
  }else {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: authObj.message,
        input: event
      })
    }
  }
}

