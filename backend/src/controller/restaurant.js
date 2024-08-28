import restaurant from '../models/restaurant.js'
import Restaurant from '../models/restaurant.js'
import ErrorHandler from '../utils/ErrorHandler.js'
import ErrorWrapper from '../utils/ErrorWrapper.js'
import uploadOnCloudinary, { uploadBatchOnCloudinary } from '../utils/uploadOnCloudinary.js'

export const postRestaurant = ErrorWrapper(async (req, res, next) => {
    const { name, address, contact } = req.body

    const email = req.user.email //to take it from req.user from jwt verify as it is called next();
    if (!email) {
        throw new ErrorHandler(401, 'Please verify your email and try again!')
    }
    // console.log(req.user);

    const incomingFields = Object.keys(req.body)
    // How to identify the missingFields?
    const requiredFields = ['name', 'address', 'contact']
    const missingFields = requiredFields.filter(
        (field) => !incomingFields.includes(field)
    )
    if (missingFields.length > 0) {
        // Status code are necessary to throw errors
        //here we are sending object of the class
        throw new ErrorHandler(
            401,
            `Provide  missing fields ${missingFields.join(
                ','
            )} to add a restaurant`
        )
        /// when I am throwing this error I want Error Wrapper catches it
    }

    let restaurant

    try {
        const restaurant = await Restaurant.findOne({
            $or: [{ name }, { address }],
        })
    } catch (error) {
        throw new ErrorHandler(500, error.message)
    }

    if (restaurant) {
        throw new ErrorHandler(
            401,
            `The Restaurant with the name ${name} or address ${address} already exists`
        )
    }

    let cloudinaryResponse
    try {
        cloudinaryResponse = await uploadOnCloudinary(req.file.path)
    } catch (error) {
        throw new ErrorHandler(500, error.message)
    }
    // console.log(cloudinaryResponse);
    // console.log(req.user);

    try {
        let newRestaurant = await Restaurant.create({
            name,
            address,
            email,
            contact,
            coverImage: cloudinaryResponse.url,
            owner: req.user._id,
        })
        console.log(newRestaurant)

        res.status(201).json({
            status: 'success',
            message: 'Restaurant added successfully',
            data: newRestaurant,
        })
    } catch (error) {
        throw new ErrorHandler(500, 'Not able to add restaurant right now')
    }
})

export const postCusineCategoryAdd = ErrorWrapper(async (req, res, next) => {
    const { categories, restaurant_name } = req.body

    let newCusineCategories = categories.split(',')

    newCusineCategories = newCusineCategories.map((c) => c.trim().toLowerCase())

    if (!newCusineCategories.length)
        throw new ErrorHandler(
            400,
            'Please provide the valid categories to add'
        )

    try {
        let restaurant = await Restaurant.findOne({
            name: restaurant_name,
        })

        // console.log(restaurant.email);
        // console.log("dgdg",req.user.email);
        if (restaurant.email !== req.user.email) {
            throw new ErrorHandler(
                401,
                'You are not authorized to add categories to this restaurantr'
            )
        }

        if (!restaurant)
            throw new ErrorHandler(
                400,
                'Restaurant not found, cannot add categories!'
            )

        let existingCusines = restaurant.cusines
        if (existingCusines.length) {
            // we will compare
            let newCusines = newCusineCategories.filter((cusine) => {
                for (let i = 0; i < existingCusines.length; i++) {
                    //if in existingCusine if I have same dish then usko jane matdo
                    if (existingCusines[i].category == cusine) return false
                }
                return true
            })

            //updating the cusines
            newCusineCategories = newCusines
        }

        //adding new cusine
        let newCusines = []
        for (let i = 0; i < newCusineCategories.length; i++) {
            let category = newCusineCategories[i]
            let newCusine = {
                category,
                food: [],
            }
            newCusines.push(newCusine)
        }

        if (newCusines.length) {
            restaurant.cusines = [...newCusines, ...existingCusines]

            // he code effectively combines two arrays, 'newCusines' and 'existingCusines',
            //into a single array and assigns it to the 'restaurant.cusines' property

            restaurant.save()
        }
        res.status(200).json({
            message: 'Categories added successfully!',
            data: restaurant,
        })
    } catch (error) {
        throw new ErrorHandler(500, error.message)
    }
})

export const postAddFoodItem = ErrorWrapper(async (req, res, next) => {
    const requiredFields = [
        'category',
        'name',
        'price',
        'veg',
        'restaurant_name',
        'description',
    ]

    const incomingFields = Object.keys(req.body)
    // How to identify the missingFields?
    const missingFields = requiredFields.filter(
        (field) => !incomingFields.includes(field)
    )
    if (missingFields.length > 0) {
        // Status code are necessary to throw errors
        //here we are sending object of the class
        throw new ErrorHandler(
            401,
            `Provide  missing fields ${missingFields.join(',')} to add a Food `
        )
        /// when I am throwing this error I want Error Wrapper catches it
    }

    try {
        let { category, name, price, veg, restaurant_name, description } =
            req.body
        category = category.toLowerCase()
        name = name.toLowerCase()
        restaurant_name = restaurant_name.toLowerCase()
        description = description.toLowerCase()
        veg = veg.toLowerCase()
        console.log(category, name, price, veg, restaurant_name, description)

        const restaurant = await Restaurant.findOne({ name: restaurant_name })
        if (!restaurant) {
            throw new ErrorHandler(
                404,
                `Restaurant with name ${restaurant_name} not found`
            )
        }

        //check for cusines
        let index = -1

        for (let i = 0; i < restaurant.cusines.length; i++) {
            if (restaurant.cusines[i].category === category) {
                index = i
                break
            }
        }
        if (index == -1) {
            throw new ErrorHandler(
                404,
                `Please add the Category first in which u want to add to ${name} eatable`
            )
        }

        let cloudinaryResponse = {
            url: '',
        }
        //upload image on cloudinary
        if (req.file.path) {
            cloudinaryResponse = await uploadOnCloudinary(req.file.path)
        }

        // add newfood
        let vegVal = veg == 'true' ? true : false
        let newFoodItem = {
            name: name,
            // price: Number(price) or,
            price: +price,
            veg: vegVal,
            description: description,
            images: [
                {
                    url: cloudinaryResponse.url,
                },
            ],
        }

        // to us cusine ke index
        restaurant.cusines[index]['food'].push(newFoodItem) // food is key here written ["food"]
        // console.log(restaurant.cusines[index]["food"]);
        await restaurant.save()

        res.status(200).json({
            message: 'Food Item added successfully',
            data: restaurant,
        })
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message)
    }
})

export const postUpdateFoodItem = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params
    const { name, price, veg, description, category, restaurant_name } =
        req.body
    console.log(req.user)
    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name })
        if (!restaurant) {
            throw new ErrorHandler(
                404,
                `Restaurant with name ${restaurant_name} not found`
            )
        }

        //check for same user restarant by comparing ids
        const user = req.user
        if (user._id.toString() !== restaurant.owner.toString()) {
            throw new ErrorHandler(
                401,
                'You are not authorized to perform this action'
            )
        }

        const index = restaurant.cusines.findIndex(
            (item) => item.category === category
        )
        if (index == -1) {
            throw new ErrorHandler(
                404,
                `Please add the category first in which you want to update the food item of ${restaurant_name}`
            )
        }

        const foodIndex = restaurant.cusines[index]['food'].findIndex(
            (item) => item._id.toString() === id.toString()
        )
        // console.log(restaurant.cusines[index]["food"]);
        if (foodIndex == -1) {
            throw new ErrorHandler(
                404,
                `Please provide the correct details - food or id inorder to update the details`
            )
        }

        //here all are keys here
        if (name) restaurant.cusines[index]['food'][foodIndex].name = name
        if (price) restaurant.cusines[index]['food'][foodIndex].price = price
        if (veg) restaurant.cusines[index]['food'][foodIndex].veg = veg
        if (description)
            restaurant.cusines[index]['food'][foodIndex].description =
                description

        console.log(req.file)
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path)
            const { url } = cloudinaryResponse
            restaurant.cusines[index]['food'][foodIndex].image = url
        }

        await restaurant.save()
        res.status(200).json({
            message: 'Food item updated successfully!',
            data: restaurant,
        })
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message)
    }
})

export const getDeleteFoodItem = ErrorWrapper(async (req, res, next) => {
    // req. query deals with data from the end of a URL, while req.params
    // grabs values from dynamic parts of the URL
    const { id } = req.params
    const { restaurant_name, category } = req.query

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name })
        if (!restaurant) {
            throw new ErrorHandler(
                404,
                `Restaurant with name ${restaurant_name} not found`
            )
        }
        const user = req.user

        if (user._id.toString() !== restaurant.owner.toString()) {
            throw new ErrorHandler(
                401,
                'You are not authorized to perform this action'
            )
        }
        const index = restaurant.cusines.findIndex(
            (item) => item.category === category
        )
        if (index == -1) {
            throw new ErrorHandler(
                404,
                `Please add the category first in which you want to update the food item of ${restaurant_name}`
            )
        }

        const foodIndex = restaurant.cusines[index]['food'].findIndex(
            (item) => item._id.toString() === id.toString()
        )
        // console.log(restaurant.cusines[index]["food"]);
        // console.log(foodIndex);

        if (foodIndex == -1) {
            throw new ErrorHandler(
                404,
                `Please provide the correct details - food or id inorder to update the details`
            )
        }

        restaurant.cusines[index]['food'].splice(foodIndex, 1)

        await restaurant.save()
        res.status(200).json({
            message: 'Food item deleted successfully!',
            data: restaurant,
        })
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message)
    }
})



export const getFoodItems = ErrorWrapper(async (req, res, next) => {
    const { restaurant_name, category } = req.query;
    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} not found`);
        }
        const user = req.user;
        if (user._id.toString() !== restaurant.owner.toString()) {
            throw new ErrorHandler(401, "You are not authorized to perform this action");
        }
        const index = restaurant.cusines.findIndex((item) => item.category === category);
        if (index == -1) {
            throw new ErrorHandler(404, `Please add the category first in which you want to update the
                    food item of ${restaurant_name}`);
        }
        const food = restaurant.cusines[index]["food"];
        res.status(200).json({
            message: "Food items fetched successfully!",
            data: food
        })
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})


export const getFoodItem = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category } = req.query;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} not found`);
        }
        const user = req.user;
        if (user._id.toString() !== restaurant.owner.toString()) {
            throw new ErrorHandler(401, "You are not authorized to perform this action");
        }
        const index = restaurant.cusines.findIndex((item) => item.category === category);
        if (index == -1) {
            throw new ErrorHandler(404, `Please add the category first in which you want to update the food item of ${restaurant_name}`);
        }

        const foodIndex = restaurant.cusines[index]["food"].findIndex((item) => item._id.toString() === id.toString());
        if (foodIndex == -1) {
            throw new ErrorHandler(404, `Food item with id ${id} not found`);
        }

        const food = restaurant.cusines[index]["food"][foodIndex];

        res.status(200).json({
            message: "Food items fetched successfully!",
            data: food
        })
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})


export const getAllCusines = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category } = req.query;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} not found`);
        }
        const user = req.user;
        if (user._id.toString() !== restaurant.owner.toString()) {
            throw new ErrorHandler(401, "You are not authorized to perform this action");
        }

        const food = restaurant.cusines;

        res.status(200).json({
            message: "Food items fetched successfully!",
            data: food
        })
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})






export const postAddFoodImage = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category } = req.body;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });

        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} not found`);
        }
        const user = req.user;
        if (user._id.toString() !== restaurant.owner.toString()) {
            throw new ErrorHandler(401, "You are not authorized to perform this action");
        }
        const index = restaurant.cusines.findIndex((item) => item.category === category);
        if (index == -1) {
            throw new ErrorHandler(404, `Food item with name ${category} not found`);
        }

        const foodIndex = restaurant.cusines[index]["food"].findIndex((item) => item._id.toString() === id.toString());
        if (foodIndex == -1) {
            throw new ErrorHandler(404, `Food item with id ${id} not found`);
        }

        const food = restaurant.cusines[index]["food"][foodIndex];
        const images = req.files;

        if (images.length == 0) {
            throw new ErrorHandler(400, "Please provide images to upload");
        }

        //need images urls
        const imageUrls = [];
        console.log(images);
        const cloudinaryResult = await uploadBatchOnCloudinary(images);

        //images urls 
        for (let i = 0; i < cloudinaryResult.length; i++) {
            imageUrls.push({
                url: cloudinaryResult[i].url
            });
        }

        food.images = [...imageUrls, ...food.images];

        await restaurant.save();

        res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            data: food,
        });
    }
    catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})




//reviews
export const postAddReview = ErrorWrapper(async (req, res, next) => {
    const { restaurant_name, rating, message } = req.body; 
    const { name } = req.user; //stored during sign in verifytoken
    const userId = req.user._id


    try {
        //find restuarant
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, "Restaurant not found");
        }

        //check if the user who is the owner of the restaurant must not add review 
        // so we have to login with another user and then only we can add review add review
        if (userId.toString() === restaurant.ownerId.toString()) {
            throw new ErrorHandler(400, "You can't review your own restaurant");
        }

        //check if the given rating is valid
        if (Number(rating) < 1 || Number(rating) > 5) {
            throw new ErrorHandler(400, "Rating must be between 1 and 5");
        }

        //upload files
        const response = await uploadBatchOnCloudinary(req.files);
        const imageUrl = [];
        //stores the images
        for (let i = 0; i < response.length; i++) {
            imageUrl.push({
                "url": response[i].url
            });
        }

        //created a review
        const review = {
            username: name,
            rating: +rating,
            message,
            userId,
            images: imageUrl,
        };
        //pushed review 
        restaurant.reviews.push(review);
        await restaurant.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review,
        });
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }


})



export const postUpdateReview = ErrorWrapper(async (req, res, next) => {
    const { reviewId } = req.params;
    const { restaurant_name, rating, message } = req.body;
    const userId = req.user._id;

    try {
        //find restaurant
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, "Restaurant not found to update the review");
        }
        //find the index of the review to be updated woith the review id as each review of each index has 
        // self id
        const index = restaurant["reviews"].findIndex(r => r._id.toString() == reviewId.toString());
        if (index === -1) {
            throw new ErrorHandler(404, "Review not found, that you are trying to update");
        }
        // the person who added the review i.e userId must match with the id who gave the review in the 
        //restaurant's review i.e the another person's id must match the stored id of the person who gave the review 
        //in the restaurant's review  i.e "who want to update the same review his/her same id must be matched"
        if (userId.toString() !== restaurant["reviews"][index].userId.toString()) {
            throw new ErrorHandler(401, "You are not authorized to update this review");
        }

        //check if the raiting valid
        if (Number(rating) < 1 || Number(rating) > 5) {
            throw new ErrorHandler(400, "Rating must be between 1 and 5");
        }

        //updated if the person updated the rating and message
        if (rating) restaurant["reviews"][index].rating = +rating;
        if (message) restaurant["reviews"][index].message = message;

        await restaurant.save();
        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            restaurant,
        });

    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }

})


export const getDeleteReview = ErrorWrapper(async (req, res, next) => {
    const { reviewId } = req.params;
    const { restaurant_name } = req.query;
    const userId = req.user._id;

    try {
        //find restaurant
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, "Restaurant not found to update the review");
        }

        //find the index of the review using id
        const index = restaurant["reviews"].findIndex(r => r._id.toString() == reviewId.toString());
        if (index === -1) {
            throw new ErrorHandler(404, "Review not found, that you are trying to update");
        }

        // the person who added the review i.e userId must match with the id who gave the review in the 
        //restaurant's review i.e the another person's id must match the stored id of the person who gave the review 
        //in the restaurant's review  i.e "who want to update the same review his/her same id must be matched"
        if (userId.toString() !== restaurant["reviews"][index].userId.toString()) {
            throw new ErrorHandler(401, "You are not authorized to update this review");
        }

        await restaurant["reviews"].splice(index, 1);
        await restaurant.save();
        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            restaurant,
        });

    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }

})


export const getAllReviews = ErrorWrapper(async (req, res, next) => {
    const { restaurant_name } = req.query;

    try {
        //find restaurant
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, "Restaurant not found to update the review");
        }

        //send all reviews
        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            reviews: restaurant["reviews"],
        });

    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})





export const getReview = ErrorWrapper(async (req, res, next) => {
    // (id or url in params || data in query )--> Query
    const { reviewId } = req.params;
    const { restaurant_name } = req.query;

    try {

        //get restauarant
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, "Restaurant not found to update the review");
        }
        //find the index of the review
        const index = restaurant["reviews"].findIndex(r => r._id.toString() == reviewId.toString());
        if (index === -1) {
            throw new ErrorHandler(404, "Review not found, that you are trying to update");
        }

        res.status(200).json({
            success: true,
            message: "Review fetched successfully",
            review: restaurant["reviews"][index]
        });

    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})




export const getRestaurants = ErrorWrapper(async (req, res, next) => {
    try {
        //get restaurant
        const restaurants = await Restaurant.find();
        let currentTime =new Date().getTime();
        

        res.status(200).json({
            success: true,
            message: "Restaurants fetched successfully",
            restaurants: restaurants
        });
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }

})



export const getRestaurant = ErrorWrapper(async (req, res, next) => {
    const { restaurantId } = req.params;
    console.log(restaurantId);
    try {
        const restaurant = await Restaurant.find({ _id: restaurantId });
        
        res.status(200).json({
            success: true,
            message: "Restaurant fetched successfully",
            restaurant: restaurant
        });
    } catch (error) {
        throw new ErrorHandler(error.statusCode || 500, error.message);
    }
})