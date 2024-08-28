
const initialState = {
    name: '',
    email: '',
    username: "",
    image: '',
    orderHistory: [],
    cart: [],
    isLoggedIn: false
};
// Jo actions define kare gaye, vo actions kaise kaam krenge yeh define
// karta hai reducer

function userReducer(state = { initialState }, action) { //if we want to update the state
    // then which action must be called of the cases
    switch (action.type) {//whatever the action calls here , the state is set according to it
        //action ke through state update is done
        case 'SET_USER':
            return {
              // state is immutable we never write s
                ...state,// old information in the state will be there
                // and new inforamtion will be set
                name: action.payload.name, 
                email: action.payload.email,
                username: action.payload.username,
                image: action.payload.image,
                orderHistory: action.payload.orderHistory,
                cart: action.payload.cart,
                isLoggedIn: true
            }
        case 'GET_USER':
            return state;
        default:
            return state;
    }

}

export default userReducer;