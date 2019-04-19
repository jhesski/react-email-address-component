import constats from '_redux/_constants';

export const actions = {
  sendEmail,
  getEmails,
  addEmail,
  removeEmails
};

function sendEmail(emailObj){
  return dispatch=>{
    return true
  }
}

function getEmails(){
  return dispatch => {
    const emailList = JSON.parse(localStorage.getItem('emails')) || {};
    dispatch({type:constats.UPDATE_EMAIL_LIST, payload: emailList});
    return Promise.resolve(emailList);
  }
}
function addEmail(email){
  return dispatch => {
    let currentEmailList = JSON.parse(localStorage.getItem('emails')) || {};

    if(currentEmailList.hasOwnProperty(email.id) || email.id === undefined){
      email.id = email.id === undefined ? Date.now() : email.id;
      email.email = email.fullAddress;
      delete email.fullAddress;
      currentEmailList[email.id] = email;
    }

    localStorage.setItem('emails', JSON.stringify(currentEmailList));
    dispatch({type:constats.UPDATE_EMAIL_LIST, payload: currentEmailList});
    return Promise.resolve(email);
  }
}

function removeEmails(emailList){
  return dispatch => {
    let currentEmailList = JSON.parse(localStorage.getItem('emails'));
    emailList.forEach(email=>{
      if(currentEmailList.hasOwnProperty(email.id)){
        delete currentEmailList[email.id];
      }
    });
    localStorage.setItem('emails', JSON.stringify(currentEmailList));
    dispatch({type:constats.UPDATE_EMAIL_LIST, payload: currentEmailList});
    return currentEmailList;
  }
}