import User from '../models/user.js'
import ErrorHandler from '../utils/ErrorHandler.js'
import ErrorWrapper from '../utils/ErrorWrapper.js'
import uploadOnCloudinary from '../utils/uploadOnCloudinary.js'
import jwt from 'jsonwebtoken'

export const postSignup = ErrorWrapper(async function (req, res, next) {
    // To read image we need to use multer
    const { username, password, email, name } = req.body

    /*missing fields part*/
    const incomingFields = Object.keys(req.body)
    // How to identify the missingFields?
    const requiredFields = ['username', 'password', 'email', 'name']
    const missingFields = requiredFields.filter(
        (field) => !incomingFields.includes(field)
    )
    if (missingFields.length > 0) {
        // Status code are necessary to throw errors
        //here we are sending object of the class
        throw new ErrorHandler(
            401,
            `Provide  missing fields ${missingFields.join(',')} to signup`
        )
        /// when I am throwing this error I want Error Wrapper catches it
    }
    /*missing fields part*/

    let existingUser = await User.findOne({
        $or: [{ username }, { email }],
    })
    
    if (existingUser) {
        throw new ErrorHandler(
            401,
            `User with username:${username} and email:${email} already exists`
        )
    }

    let cloudinaryResponse
    // we wrote in try and catch to wrute the Error handler inorder to knwo it runned or not
    try {
        cloudinaryResponse = await uploadOnCloudinary(req.file.path)
    } catch (err) {
        throw new ErrorHandler(
            500,
            `Error while uploading image ${err.message}`
        )
    }

    try {
        const user = await User.create({
            username,
            password,
            email,
            name,
            image: cloudinaryResponse.secure_url,
        })

        let newUser = await User.findOne({
            _id: user._id,
        }).select('-password')

        res.status(201).json({
            success: true,
            user: newUser,
        })
    } catch (error) {
        throw new ErrorHandler(500, 'Error while creating new user')
    }
})

//this is like a callback function

const generateAccessTokenAndRefreshToken= async (userId) => {
    try {
        let user = await User.findOne({
            _id: userId,
        })

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        return {
            accessToken,
            refreshToken,
        }
    } catch (error) {
        throw new ErrorHandler(
            500,
            `Error while generating access and refresh token`
        )
    }
}

export const postLogin = ErrorWrapper(async function (req, res, next) {
    try {
        const { username, email, password } = req.body

        if (!username && !email) {
            throw new ErrorHandler(400, 'Please entr username or email')
        }
        if (!password) {
            throw new ErrorHandler(400, 'Please entr password')
        }
        let user = await User.findOne({
            $or: [{ username }, { email }],
        })
        // console.log(user);

        if (!user) {
            throw new ErrorHandler(400, 'Invalid username or email')
        }

        const passwordMatch = user.isPasswordCorrect(password)
        console.log(password)
        if (!passwordMatch) {
            throw new ErrorHandler(400, 'Invalid password')
        }

        
        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(user._id)
        // console.log(accessToken);
        // console.log(refreshToken);
        user.refreshToken = refreshToken //db me store

        await user.save()
        // console.log(user);
        user = await User.findOne({
            $or: [{ username }, { email }],
        }).select('-password -refreshToken')

        res.status(200)
            .cookie('RefreshToken', refreshToken)
            .cookie('AccessToken', accessToken)
            .json({
                success: true,
                message: 'Login successfull',
                user,
            })
    } catch (error) {
        throw new ErrorHandler(400, 'Error in Sign up')
    }
})
