import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
	getDatabase,
	ref,
	push,
	onValue,
	remove,
	set,
	get,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

const firebaseConfig = {
	apiKey: 'AIzaSyARPiJ4TZHSP8Fu6tD4fTorkvDRC9NsPOo',
	authDomain: 'cobaupload-e1a48.firebaseapp.com',
	projectId: 'cobaupload-e1a48',
	storageBucket: 'cobaupload-e1a48.appspot.com',
	messagingSenderId: '756156944784',
	appId: '1:756156944784:web:bfa1df60ab0974ed2de315',
	measurementId: 'G-Y621QZTL8T',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const usersRef = ref(database, 'users');

// Fungsi untuk menampilkan data
function displayUsers(users) {
	const userList = document.getElementById('userList');
	userList.innerHTML = '';

	users.forEach((user) => {
		const userCard = `
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <span>${user.name}</span>
                                <div>
                                    <button class="btn btn-sm btn-info" onclick="viewDetails('${user.id}')">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                                        <i class="bi bi-trash"></i>
                                    </button>
									<button class="btn btn-sm btn-warning" onclick="editUser('${user.id}')">
    									<i class="bi bi-pencil"></i>
									</button>

                                </div>
                            </div>
                        </div>
                    </div>`;
		userList.innerHTML += userCard;
	});
}

// Mengambil data pengguna
onValue(usersRef, (snapshot) => {
	const users = [];
	snapshot.forEach((childSnapshot) => {
		const data = childSnapshot.val();
		users.push({ id: childSnapshot.key, ...data });
	});
	displayUsers(users);
});

// Tambah pengguna
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	const loadingIndicator = document.getElementById('loading-add');
	loadingIndicator.classList.remove('d-none');

	try {
		const name = document.getElementById('name').value;
		const username = document.getElementById('username').value;
		const password = document.getElementById('password').value;
		const profilePhoto = document.getElementById('profilePhoto').files[0];

		if (!profilePhoto) {
			alert('Harap upload foto profil.');
			return;
		}

		// Upload Foto ke Cloudinary
		const cloudinaryUrl =
			'https://api.cloudinary.com/v1_1/dhei3po2m/image/upload';
		const formData = new FormData();
		formData.append('file', profilePhoto);
		formData.append('upload_preset', 'cobaUploads'); // Ganti sesuai preset Anda
		formData.append('folder', 'CobaUploadsAssets');

		const cloudinaryResponse = await fetch(cloudinaryUrl, {
			method: 'POST',
			body: formData,
		}).then((res) => res.json());

		if (!cloudinaryResponse.secure_url) {
			throw new Error('Gagal mengunggah foto ke Cloudinary');
		}

		const photoUrl = cloudinaryResponse.secure_url;
		const publicId = cloudinaryResponse.public_id;

		// Simpan data ke Firebase
		await push(usersRef, {
			name,
			username,
			password, // Hash sebelum menyimpan di real project
			photoUrl,
			publicId,
		});

		alert('Pengguna berhasil ditambahkan!');
		document.getElementById('addUserForm').reset();
	} catch (error) {
		console.error('Error:', error);
		alert('Gagal menambahkan pengguna. Coba lagi.');
	} finally {
		loadingIndicator.classList.add('d-none');
	}
});

// Lihat detail pengguna
window.viewDetails = async function (id) {
	const userRef = ref(database, `users/${id}`);
	const snapshot = await get(userRef);

	if (snapshot.exists()) {
		const data = snapshot.val();
		document.getElementById('detailName').innerText = data.name;
		document.getElementById('detailUsername').innerText = data.username;
		document.getElementById('detailPhoto').src =
			data.photoUrl || 'default-photo.png';

		const detailModal = new bootstrap.Modal(
			document.getElementById('userDetailModal')
		);
		detailModal.show();
	} else {
		alert('Data pengguna tidak ditemukan.');
	}
};

// Hapus pengguna
window.deleteUser = async function (id) {
	const confirmDelete = confirm('Apakah Anda yakin ingin menghapus pengguna ini?');
	if (!confirmDelete) return;

	const loadingIndicator = document.getElementById('loading-delete');
	loadingIndicator.classList.remove('d-none');

	try {
		const userRef = ref(database, `users/${id}`);
		const userSnapshot = await get(userRef);

		if (!userSnapshot.exists()) {
			alert('Pengguna tidak ditemukan.');
			return;
		}

		const userData = userSnapshot.val();
		const publicId = userData.publicId;

		const deleteResponse = await fetch('http://localhost:5000/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ publicId }),
		});

		if (!deleteResponse.ok) {
			throw new Error(
				'Gagal menghapus foto dari Cloudinary.'
			);
		}

		// Hapus data dari Firebase
		await remove(userRef);
		alert('Pengguna berhasil dihapus.');
	} catch (error) {
		console.error('Error:', error);
		alert('Gagal menghapus pengguna. Coba lagi.');
	} finally {
		loadingIndicator.classList.add('d-none');
	}
};

window.editUser = async function (id) {
	const userRef = ref(database, `users/${id}`);
	const snapshot = await get(userRef);

	if (snapshot.exists()) {
		const data = snapshot.val();
		document.getElementById('editUserId').value = id;
		document.getElementById('editName').value = data.name;
		document.getElementById('editUsername').value = data.username;

		const editModal = new bootstrap.Modal(
			document.getElementById('editUserModal')
		);
		editModal.show();
	} else {
		alert('Data pengguna tidak ditemukan.');
	}
};

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	const loadingIndicator = document.getElementById('loading-edit');
	loadingIndicator.classList.remove('d-none');

	try {
		const id = document.getElementById('editUserId').value;
		const name = document.getElementById('editName').value;
		const username = document.getElementById('editUsername').value;
		const profilePhoto =
			document.getElementById('editProfilePhoto').files[0];

		const userRef = ref(database, `users/${id}`);
		const snapshot = await get(userRef);

		if (!snapshot.exists()) {
			alert('Pengguna tidak ditemukan.');
			return;
		}

		const userData = snapshot.val();
		let photoUrl = userData.photoUrl;
		let publicId = userData.publicId;

		// Jika ada gambar baru, upload ke Cloudinary
		if (profilePhoto) {
			const cloudinaryUrl =
				'https://api.cloudinary.com/v1_1/dhei3po2m/image/upload';
			const formData = new FormData();
			formData.append('file', profilePhoto);
			formData.append('upload_preset', 'cobaUploads');
			formData.append('folder', 'CobaUploadsAssets');

			const cloudinaryResponse = await fetch(cloudinaryUrl, {
				method: 'POST',
				body: formData,
			}).then((res) => res.json());

			if (!cloudinaryResponse.secure_url) {
				throw new Error(
					'Gagal mengunggah foto ke Cloudinary'
				);
			}

			photoUrl = cloudinaryResponse.secure_url;

			// Hapus gambar lama dari Cloudinary
			await fetch('http://localhost:5000/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ publicId }),
			});

			publicId = cloudinaryResponse.public_id;
		}

		// Update data di Firebase
		await set(userRef, {
			...userData,
			name,
			username,
			photoUrl,
			publicId,
		});

		alert('Pengguna berhasil diperbarui!');
		const editModal = bootstrap.Modal.getInstance(
			document.getElementById('editUserModal')
		);
		editModal.hide();
	} catch (error) {
		console.error('Error:', error);
		alert('Gagal memperbarui pengguna. Coba lagi.');
	} finally {
		loadingIndicator.classList.add('d-none');
	}
});
