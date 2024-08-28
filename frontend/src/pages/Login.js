import { useDispatch } from 'react-redux';
import axios from '../utils/axios';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // when login eamil and password ka reference leliya
    const emailRef = useRef();
    const passwordRef = useRef();

    const dispatch = useDispatch(); // to change the state we use it
    const navigate = useNavigate(); // to redirect to next Link

    const loginHandler = async () => {
        // login handler me email and password ki value utali 
        const username = emailRef.current.value.trim();
        const password = passwordRef.current.value.trim();
        if (!username) return alert('Please enter username');
        if (!password) return alert('Please enter password');

        try {
            // I can configure the axios so that the font url becomes same 
            const { data } = await axios.post('login', { username, password });
            //in axios we avoided the url will by setting in base url see utils->axios
            
            // console.log(data);
            // SET THE DATA TO REDUX: as the user(who is logged in ) can access the daat in the entire app
            // in redux we had action, reducer, store
            //see 'redux page'
            // using 'dispatch hook' we set to user in action of format:-  
            /* type , data */
            dispatch({ type: 'SET_USER', payload: data.user }) // in data we send
            // the user
            //Ater this is done  NAVIGATE TO HOME PAGE i,e switch the path
            navigate('/app');
        } catch (error) {
            alert(error)
        }
    }

    return (
        <div className='login'>
            {/* when login eamil and password ka reference leliya */}
            <input ref={emailRef} type='text' placeholder='Enter username or email' /> <br />
            <input ref={passwordRef} type='password' placeholder='Enter password' /> <br />

            <button onClick={loginHandler}>Login</button>
            {/* When clicked login ka handler function must form */}
        </div>
    )
}

export default Login