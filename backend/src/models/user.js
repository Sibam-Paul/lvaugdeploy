import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: { //name can not be unique oly username multiple nam ho sakte hai
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    image: {
        type: String, // cloudinary url
        required: true
    },
    orderHistory: [
        {
            date: {
                type: Date,
                default: Date.now
            },
            items: [
                {
                    name: String,
                    price: Number,
                    quantity: Number,
            
                }
            ]
        }
    ],
    password: {
        type: String,
        required: true
    },
    cart:[
        {
            food:Object,
            quantity:Number
        }
    ],
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});


//Before saving in db this will work
userSchema.pre('save',  function (next) {
    // Password change nhi hua toh kuch nahi krna
    if (!this.isModified("password")) return next();
    //ismodified() : is an Api document in mongoose

    // Password change hua toh hash krna
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }
        user.password = hash;
        // console.log(user.password);
        
        next();
    });
});

userSchema.methods.isPasswordCorrect=async function(enteredPassword){
    const user=this;
    return await bcrypt.compare(this.password,enteredPassword);
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            userId: this._id
        },
        process.env.REFRESH_TOKEN_KEY
        ,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        });
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            username: this.username,
            name: this.name
        },
        process.env.ACCESS_TOKEN_KEY
        ,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        });
}

const User =mongoose.model("User",userSchema);
export default User; 
