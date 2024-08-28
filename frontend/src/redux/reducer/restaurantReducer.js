const initialState = [];

function restaurantReducer(state = { initialState }, action) {
    // console.log(action.payload);
    switch (action.type) {
        case 'SET_RESTAURANTS':
            return action.payload; //set the data coming in payload
        case 'GET_RESTAURANTS':
            return state;
        default:
            return state;
    }
}

export default restaurantReducer;