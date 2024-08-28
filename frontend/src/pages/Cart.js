import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CartItem from '../components/Cart/CartItem';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const userData =useSelector(state=>state.userReducer);
    const {cart}=userData;
  
    // after refresh the in /cart it mauy not be fetching the user data
    
    let totalprice=0;
    cart.forEach(item => {
        totalprice +=item.food.price * item.quantity;
    });

    const buynowhandler =()=>{

    }

  return (
    <div className='cart'>
        <div className='cartItems'>
            {  cart?.length == 0 && <div>Cart Empty</div>}
            {  cart?.length > 0 && cart.map((cartItem,index)=><CartItem data={cartItem} key={index}/> )}
        </div>
        <div className='cartTotal'>
            Total Price: {totalprice}
        </div>
        <button className='Buynow' onClick={buynowhandler}>Bye Now</button>
    </div>
  )
}

export default Cart