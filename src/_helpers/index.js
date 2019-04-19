export function validateEmail(email) {

  let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
}

export function parseFormattedEmailAddress(email,allowSpaces=false){

  // Returns Object {raw:full string, displayname: address: {value: email address, valid: if value is a valid email or not }}
  // remove any spaces in the display name before the <

  let raw = email;
  if(!allowSpaces){
    raw = raw.replace(/ {0,}</g,'<');
  }

  const emailInBrackets = email.substring(email.lastIndexOf("<")+1,email.lastIndexOf(">"));
  const formattedEmail = emailInBrackets !== '';
  let displayName,emailAddress;

  if(formattedEmail){
    emailAddress = {value:emailInBrackets, valid: validateEmail(emailInBrackets)};
    displayName = raw.split('<')[0]==='' ? undefined : raw.split('<')[0];
    if(displayName === ''){
      raw = emailInBrackets;
    }
  } else {
    emailAddress = {value:raw, valid: validateEmail(raw)};
  }

  return {
    raw:raw,
    displayName: displayName,
    address: emailAddress
  };
}

// Takes array of indexes and returns next highest number
export const calculateNextIndex = (array)=>{
  if(!array || array.length === 0){
    return 0
  }
  return (Math.max(...array)) + 1;
};


