const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi Cloudinary
cloudinary.config({
	cloud_name: 'dhei3po2m',
	api_key: '684285221384396',
	api_secret: 'sfr0Xa79bgV4NQKq1xJ0tYOgnYA',
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route untuk menghapus gambar di Cloudinary
app.post('/delete', async (req, res) => {
	const { publicId } = req.body;

	try {
		const result = await cloudinary.uploader.destroy(publicId);
		if (result.result !== 'ok') {
			throw new Error(
				'Gagal menghapus gambar dari Cloudinary.'
			);
		}
		res.status(200).send({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: 'Gagal menghapus gambar.' });
	}
});

// Jalankan server
app.listen(PORT, () => {
	console.log(`Server berjalan pada port ${PORT}`);
});
