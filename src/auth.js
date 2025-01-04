import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Función para manejar errores de Firebase
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
        case 'auth/invalid-email':
            return 'El correo electrónico no es válido.';
        case 'auth/operation-not-allowed':
            return 'Operación no permitida.';
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
        case 'auth/user-disabled':
            return 'Esta cuenta ha sido deshabilitada.';
        case 'auth/user-not-found':
            return 'No existe una cuenta con este correo electrónico.';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Por favor, intenta más tarde.';
        default:
            return error.message;
    }
}

// Registro de usuarios
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Usar un avatar por defecto
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

            // Actualizar perfil
            await updateProfile(user, {
                displayName: name,
                photoURL: defaultAvatar
            });

            // Guardar información en Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                photoURL: defaultAvatar,
                createdAt: new Date()
            });

            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error en el registro:", error);
            alert(getErrorMessage(error));
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarse';
        }
    });
}

// Login de usuarios
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error en el login:", error);
            alert(getErrorMessage(error));
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar Sesión';
        }
    });
}

// Verificar si el usuario ya está autenticado
auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
});