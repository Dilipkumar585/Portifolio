import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyAu_g_pquHOWszZx88kHZXAlrOhOCebImY",
    authDomain: "dilip-portfolio-41d6d.firebaseapp.com",
    projectId: "dilip-portfolio-41d6d",
    storageBucket: "dilip-portfolio-41d6d.firebasestorage.app",
    messagingSenderId: "789421488084",
    appId: "1:789421488084:web:11f75e5ea30ac4e68dc841",
    measurementId: "G-ECZ21740DT"
};


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ===============================
// ELEMENTS
// ===============================

const loginSection =
    document.getElementById("loginSection");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("loginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const logoutBtn =
    document.getElementById("logoutBtn");

const messagesContainer =
    document.getElementById("messagesContainer");

const totalMessages =
    document.getElementById("totalMessages");

const newMessages =
    document.getElementById("newMessages");


// ===============================
// ADMIN LOGIN
// ===============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = adminEmail.value.trim();

    const password = adminPassword.value;

    loginBtn.disabled = true;

    loginBtn.textContent = "Logging in...";

    loginError.textContent = "";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    } catch (error) {

        console.error("Login Error:", error);

        loginError.textContent =
            "Invalid email or password.";

        loginBtn.disabled = false;

        loginBtn.textContent = "Login";

    }

});


// ===============================
// AUTH STATE
// ===============================

onAuthStateChanged(auth, (user) => {

    if (user) {

        // User logged in

        loginSection.style.display = "none";

        dashboard.style.display = "block";

        loadMessages();

    } else {

        // User logged out

        loginSection.style.display = "flex";

        dashboard.style.display = "none";

    }

});


// ===============================
// LOAD FIRESTORE MESSAGES
// ===============================
function loadMessages() {

    const messagesQuery = query(
        collection(db, "contactMessages"),
        orderBy("createdAt", "desc")
    );

    onSnapshot(
        messagesQuery,
        (snapshot) => {

            messagesContainer.innerHTML = "";

            let total = 0;
            let newCount = 0;

            if (snapshot.empty) {

                messagesContainer.innerHTML = `
                    <div class="empty">
                        No messages yet.
                    </div>
                `;

                totalMessages.textContent = "0";
                newMessages.textContent = "0";

                return;
            }

            snapshot.forEach((docSnapshot) => {

                const data = docSnapshot.data();

                const messageId = docSnapshot.id;

                total++;

                if (data.status === "new") {
                    newCount++;
                }

                const card = document.createElement("div");

                card.className = "message-card";

                card.innerHTML = `

                    <div class="message-header">

                        <div>

                            <h3>
                                ${escapeHTML(data.name || "Unknown")}
                            </h3>

                            <div class="message-email">
                                ${escapeHTML(data.email || "")}
                            </div>

                        </div>

                        <span class="message-status">
                            ${escapeHTML(data.status || "new")}
                        </span>

                    </div>

                    <div class="message-text">

                        ${escapeHTML(data.message || "")}

                    </div>

                    <div class="message-actions">

                        ${
                            data.status === "new"
                            ? `
                                <button
                                    class="read-btn"
                                    data-id="${messageId}"
                                >
                                    ✓ Mark as Read
                                </button>
                            `
                            : `
                                <span class="read-label">
                                    ✓ Read
                                </span>
                            `
                        }

                        <button
                            class="delete-btn"
                            data-id="${messageId}"
                        >
                            🗑 Delete
                        </button>

                    </div>

                `;

                messagesContainer.appendChild(card);

            });

            totalMessages.textContent = total;

            newMessages.textContent = newCount;


            // ===============================
            // MARK AS READ
            // ===============================

            document.querySelectorAll(".read-btn")
                .forEach((button) => {

                    button.addEventListener("click", async () => {

                        const id = button.dataset.id;

                        button.disabled = true;

                        button.textContent = "Updating...";

                        try {

                            await updateDoc(
                                doc(db, "contactMessages", id),
                                {
                                    status: "read"
                                }
                            );

                        } catch (error) {

                            console.error(
                                "Update Error:",
                                error
                            );

                            button.disabled = false;

                            button.textContent =
                                "✓ Mark as Read";

                            alert(
                                "Unable to update message."
                            );

                        }

                    });

                });


            // ===============================
            // DELETE MESSAGE
            // ===============================

            document.querySelectorAll(".delete-btn")
                .forEach((button) => {

                    button.addEventListener("click", async () => {

                        const id = button.dataset.id;

                        const confirmDelete =
                            confirm(
                                "Are you sure you want to delete this message?"
                            );

                        if (!confirmDelete) {
                            return;
                        }

                        button.disabled = true;

                        button.textContent = "Deleting...";

                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "contactMessages",
                                    id
                                )
                            );

                        } catch (error) {

                            console.error(
                                "Delete Error:",
                                error
                            );

                            button.disabled = false;

                            button.textContent =
                                "🗑 Delete";

                            alert(
                                "Unable to delete message."
                            );

                        }

                    });

                });

        },

        (error) => {

            console.error(
                "Firestore Error:",
                error
            );

            messagesContainer.innerHTML = `
                <div class="empty">
                    Unable to load messages.
                </div>
            `;

        }
    );
}


// ===============================
// HTML SECURITY
// ===============================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

});