import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;

        const response = await cloudinary.uploader.upload(
            filePath)

        console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(filePath);
        return response;
    } 
    catch (error) {
        fs.unlinkSync(filePath); //to delete file
        console.error("Error uploading file on cloudinary", err);
        return error;
    }

}


async function uploadBatchOnCloudinary(images) {
    try {
        //generate promises
        const promises = images.map(async (image) => {
            const response = await cloudinary.uploader.upload(image.path);
            return response;
        });
        //resolved all promises
        const results = await Promise.all(promises);
        //deleted all files 
        images.map((image) => fs.unlinkSync(image.path));
        return results;
    }
    catch (error) {
        console.error("Error uploading batch files on cloudinary", error);
        images.map((image) => fs.unlinkSync(image.path));
        return error;
    }
};

export default uploadOnCloudinary
export { uploadBatchOnCloudinary }