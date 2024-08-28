import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import RestaurantPageItem from './RestaurantPageItem';
import MySpinner from '../components/Spinner';


const RestaurantPage = () => {
    const { restaurant_id } = useParams();
    //check if the restuarant fetched
    const [isRestaurantFetched, setIsRestaurantFetched] = useState(false);
    // to store restauraty
    const [restaurant, setRestaurant] = useState([]);
    useEffect(() => {
        try {
          //a function to get restaurnt using id 
            const getRestaurant = async () => {
                const { data } = await axios.get(`/restaurant/${restaurant_id}`);
                setRestaurant(data.restaurant[0]);
                // console.log(data.restaurant[0])
                setIsRestaurantFetched(true); 
            }
            getRestaurant(); //function calling 
        } catch (error) {
            alert(error);
        }
    }, [restaurant_id]); // on chnage must rerender the page hance dependent on the value

    return (
        <>
            {isRestaurantFetched && <RestaurantPageItem restaurant={restaurant} />}
            {!isRestaurantFetched && <MySpinner />}
        </>
    )
}

export default RestaurantPage;
