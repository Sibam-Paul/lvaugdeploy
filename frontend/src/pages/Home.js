import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/axios";
import AllRestaurants from "../components/Restaurant/AllRestaurants";
import MySpinner from "../components/Spinner";
import LandingPage from "./LandingPage";
import { Outlet } from "react-router-dom";

const Home = () => {
  const userData = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const [isRestaurantsFetched, setIsRestaurantsFetched] = useState(false); //default restuarant fetched
  useEffect(() => {
    async function getRestaurantDetails() {
      try {
        let { data } = await axios.get("/restaurant/all");
        // now to store all the info in Redux so making restaurnatReducer
        // console.log("he",data);
        dispatch({ type: "SET_RESTAURANTS", payload: data.restaurants });

        setIsRestaurantsFetched(true);
      } catch (error) {
        alert(error);
      }
    }

    getRestaurantDetails();
  }, []);
  // console.log(userData);
  return (
    <>
      {userData.isLoggedIn && (
        <div>
          {!isRestaurantsFetched && <MySpinner />}
          {isRestaurantsFetched && <AllRestaurants />}
          {/* The nested restuarnts id when clikced in details muist be shown when the restaurnat is fetched */}
          <Outlet />
        </div>
      )}

      {!userData.isLoggedIn && <LandingPage />}
    </>
  );
};

export default Home;
