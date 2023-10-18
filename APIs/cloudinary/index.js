const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
	secure: true
})


const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'Science Project',
		allowedFormats: [ 'jpeg', 'jpg', 'png', 'pdf', 'avif', 'webp', 'gif', 'mp3', 'mp4' ]
	},
});

module.exports = { cloudinary, storage }

