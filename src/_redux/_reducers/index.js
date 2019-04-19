import REDUX_ACTIONS from '_redux/_constants';
const initialState = {
  emailList: []
};
const rootReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch(type){
    case REDUX_ACTIONS.UPDATE_EMAIL_LIST:{
      if(payload){
        state.emailList = payload;
      }
      return state;
    }
    default: return state;
  }
};

export default rootReducer;