import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbhWH43oeSTLJUxkgqSn61Frpc_VhUkKI",
    authDomain: "subspace-mx.firebaseapp.com",
    projectId: "subspace-mx",
    storageBucket: "subspace-mx.firebasestorage.app",
    messagingSenderId: "471489534097",
    appId: "1:471489534097:web:a92e5613f36146c21c4730",
    measurementId: "G-334KJEMYJ0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Cargar datos del perfil
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('profileName').textContent = user.displayName || 'Usuario';
        document.getElementById('profilePhotoPreview').src = user.photoURL || 'https://ui-avatars.com/api/?name=Usuario';
        document.getElementById('updateName').value = user.displayName || '';
    } else {
        window.location.href = 'login.html';
    }
});

// Actualizar perfil
const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const submitButton = profileForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Actualizando...';

    try {
        const newName = document.getElementById('updateName').value;
        let updates = {};
        
        if (newName !== user.displayName) {
            updates.displayName = newName;
            // Actualizar avatar con el nuevo nombre
            updates.photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`;
        }

        if (Object.keys(updates).length > 0) {
            await updateProfile(user, updates);
            await updateDoc(doc(db, "users", user.uid), {
                name: updates.displayName || user.displayName,
                photoURL: updates.photoURL || user.photoURL
            });

            document.getElementById('profileName').textContent = updates.displayName;
            if (updates.photoURL) {
                document.getElementById('profilePhotoPreview').src = updates.photoURL;
            }
            alert('Perfil actualizado con éxito');
        }
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        alert(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar cambios';
    }
});

// Cerrar sesión
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert(error.message);
    }
});