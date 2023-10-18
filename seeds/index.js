const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

const Project = require('../models/project')

// const mongoUrl = 'mongodb://127.0.0.1:27017/science';
const mongoUrl = process.env.CLOUD_ATLAS;


const path = require('path');

main().catch(err => console.log(err, ' Error at /seeds/index.js (line 6)'));


async function main() {
	await mongoose.connect(mongoUrl)
		.then(() => {
			console.log('Mongo connection successful!');
		})
		.catch((err) => {
			console.log('Oh no mongo connection error!')
			console.log(err);
		})
}

const sample = (array) => array[ Math.floor(Math.random() * array.length) ];

const imageArr = [
	{
		originalname: 'miguel1.jpg',
		mimetype: 'image/jpeg',
		path: 'https://res.cloudinary.com/drttcxk27/image/upload/v1697026754/Science%20Project/rantdifmvzsk81vxhzko.jpg',
		size: 1931551,
		filename: 'Science Project/rantdifmvzsk81vxhzko',
	},
	{
		originalname: 'miguel2.jpg',
		mimetype: 'image/jpeg',
		path: 'https://res.cloudinary.com/drttcxk27/image/upload/v1697026756/Science%20Project/k9dsepvm6pmm4frvvc17.jpg',
		size: 731869,
		filename: 'Science Project/k9dsepvm6pmm4frvvc17',
	},
	{
		originalname: 'miguel3.jpg',
		mimetype: 'image/jpeg',
		path: 'https://res.cloudinary.com/drttcxk27/image/upload/v1697026758/Science%20Project/k1pxclcbxmrhxaos5umd.jpg',
		size: 562817,
		filename: 'Science Project/k1pxclcbxmrhxaos5umd',
	}
]

const seedDB = async () => {
	await Project.deleteMany({}); // Deletes all the projects
	for (let i = 0; i < 10; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const date = new Date().toString().substring(0, 24) + ' SGT';
		const p = new Project({
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${cities[ random1000 ].city} ${cities[ random1000 ].state}`,
			description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus reiciendis totam rem, possimus natus inventore quod, neque cumque, facere laborum voluptas. Nam cupiditate labore vel amet, magni distinctio consequatur corporis!',

			images: [
				imageArr[ i % 3 ], imageArr[ (i + 1) % 3 ]
			],
			subject: 'Mathematics',
			owner: '65110b1696b08a05d2326f8c',
			grade: Math.floor(Math.random() + 11),
			section: 'IC A',
			timeCreated: date,
			year: 2023,
			isApproved: false
		})
		await p.save();
		// console.log(p)
	}

}

seedDB().then(() => {
	console.log("Mongoose disconnection successful")
	mongoose.connection.close();
});