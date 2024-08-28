import express from "express";
import { postLogin, postSignup } from "../controller/auth.js";
import upload from "../utils/multer.js";


const router = express.Router();

router.post('/signup',upload.single('image'), postSignup); // image is catched through multer
router.post('/login', postLogin);




export default router;