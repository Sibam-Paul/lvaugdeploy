import express from "express"

import {
    postAddFoodImage,
    getAllCusines,
    getFoodItem,
    getFoodItems,
    postCusineCategoryAdd, 
    postRestaurant, 
    postUpdateFoodItem , 
    getDeleteFoodItem, 
    postAddFoodItem, 
    postAddReview,
    postUpdateReview,
    getDeleteReview,
    getAllReviews,
    getReview,
    getRestaurants,
    getRestaurant
} from "../controller/restaurant.js";

import upload from "../utils/multer.js";


const router=express.Router();
 
 
router.post('/register',upload.single("coverImage"),postRestaurant);
router.post('/cusine-category-add',postCusineCategoryAdd);
router.post('/add-food-items',upload.single("images"),postAddFoodItem);


//HOMEWORK
// CRUD user
// {
//     name: String,
//     price: Number,
//     description: String,
//     veg: Boolean,
//     images: [
//         {
//             url: String
//         }
//     ]
// }
router.post('/update-food-item/:id',upload.single('image'),postUpdateFoodItem)
router.get('/delete-food-item/:id',getDeleteFoodItem)
router.get('/get-food-items',getFoodItems)
router.get('/get-food-item/:id',getFoodItem)
router.get('/get-all-cusines', getAllCusines);

// Food -> images
router.post('/add-food-image/:id', upload.array('images', 6), postAddFoodImage);
// restaurant->Menu

// reviews
router.post('/add-review', upload.array('images', 12), postAddReview);
router.post('/update-review/:reviewId', postUpdateReview);
router.get('/delete-review/:reviewId', getDeleteReview);
router.get('/get-all-reviews', getAllReviews);
router.get('/get-review/:reviewId', getReview);
router.get('/all', getRestaurants);

router.get('/:restaurantId', getRestaurant);
 
import { 
    getAddCart,
    getCartItemDecrease,
    getCartItemDelete, 
    getCartItemIncrease,
    getCartItems} from "../controller/cart.js";



// CART OPERATIONS
router.get("/get-cart", getCartItems)
router.get('/add-cart/:id',getAddCart)
router.get('/cart/increase-cart/:id',getCartItemIncrease)
router.get('/cart/decrease-cart/:id',getCartItemDecrease)
router.get('/cart/delete-cart-item/:id',getCartItemDelete )



    //- email
    //- password Implement Forget password



// HOMEWORK
//CRUD
// Food
// Food-> images
// restaurant -> Menu
//reviews



 
export default router; 




        