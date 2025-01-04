import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Elementos HTML
const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const postContainer = document.getElementById("postContainer");
const userPhoto = document.getElementById("userPhoto");
const postUserPhoto = document.getElementById("postUserPhoto");
const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

// Verificar autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario está autenticado
        userName.textContent = user.displayName || "Usuario";
        userPhoto.src = user.photoURL || "./img/default-user.jpg";
        postUserPhoto.src = user.photoURL || "./img/default-user.jpg";
        postForm.style.display = "flex"; // Mostrar formulario de post
    } else {
        // Usuario no está autenticado, redirigir a login
        window.location.href = 'login.html';
    }
});

// Función para cerrar sesión
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert(error.message);
    }
});

// Función para subir un post
postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = postContent.value.trim();
    const user = auth.currentUser;

    if (content && user) {
        try {
            await addDoc(collection(db, "posts"), {
                content: content,
                user: user.displayName || "Usuario",
                photo: user.photoURL || "./img/default-user.jpg",
                userId: user.uid,
                timestamp: new Date()
            });
            postContent.value = ""; // Limpiar textarea
            renderPosts(); // Actualizar posts
        } catch (error) {
            console.error("Error al subir el post:", error);
            alert("Error al publicar el post: " + error.message);
        }
    }
});

// Función para renderizar los posts
const renderPosts = async () => {
    postContainer.innerHTML = ""; // Limpiar contenedor
    try {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${post.photo}" alt="User Photo">
                    <h3>${post.user}</h3>
                </div>
                <p>${post.content}</p>
                <small>${new Date(post.timestamp.toDate()).toLocaleString()}</small>
            `;
            postContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error("Error al cargar los posts:", error);
        alert("Error al cargar los posts: " + error.message);
    }
};

// Renderizar posts al cargar la página
renderPosts();