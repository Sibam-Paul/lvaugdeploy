import React from 'react'
import { useSelector } from 'react-redux'
import Restaurant from './Restaurant.js';

const AllRestaurants = () => {
    const restaurantsData = useSelector(state => state.restaurantReducer);
    // console.log("Current", restaurantsData);
    return (
        <div className='restaurants-list'>
            {
                restaurantsData?.map(
                    (restaurant,indx) => <Restaurant key={indx} restaurant={restaurant} />
                )

            }
        </div>
    )
}

export default AllRestaurants