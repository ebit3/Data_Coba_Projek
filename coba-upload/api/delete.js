import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: 'dhei3po2m',
	api_key: '684285221384396', // Ganti dengan API Key Anda
	api_secret: 'sfr0Xa79bgV4NQKq1xJ0tYOgnYA', // Ganti dengan API Secret Anda
});

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { publicId } = req.body;

		if (!publicId) {
			return res.status(400).json({
				error: 'publicId is required',
			});
		}

		try {
			// Menghapus gambar dari Cloudinary
			const response = await cloudinary.uploader.destroy(
				publicId
			);

			if (response.result === 'ok') {
				res.status(200).json({ success: true });
			} else {
				throw new Error(
					'Gagal menghapus gambar.'
				);
			}
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
