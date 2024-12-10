export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { publicId } = req.body;

		if (!publicId) {
			return res.status(400).json({
				error: 'Public ID is required',
			});
		}

		// Konfigurasi Cloudinary
		const cloudinary = require('cloudinary').v2;
		cloudinary.config({
			cloud_name: 'dhei3po2m',
			api_key: '684285221384396',
			api_secret: 'sfr0Xa79bgV4NQKq1xJ0tYOgnYA',
		});

		// Hapus file dari Cloudinary
		const result = await cloudinary.uploader.destroy(publicId);

		if (result.result !== 'ok') {
			throw new Error('Failed to delete the image');
		}

		res.status(200).json({ message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Error deleting image:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}
