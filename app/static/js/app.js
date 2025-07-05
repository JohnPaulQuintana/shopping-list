import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyATUKXdG6kFA-ZCpNCblzB52JI2OqNLlgM",
  authDomain: "shopping-list-e9cc7.firebaseapp.com",
  projectId: "shopping-list-e9cc7"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ DOM elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loader = document.getElementById("loader");
const listContainer = document.getElementById("list-container");

// Optional user info elements (may not be on every page)
const userInfoBox = document.getElementById("user-info");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPhoto = document.getElementById("user-photo");

// ✅ Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (loader) loader.classList.remove("hidden");

    const token = await user.getIdToken();

    // ✅ Send to FastAPI to store/verify user
    await fetch("/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    // ✅ Fetch user profile from FastAPI
    if (userInfoBox) {
      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      userName.textContent = data.name;
      userEmail.textContent = data.email;
      userPhoto.src = data.photoURL;
      userInfoBox.classList.remove("hidden");
    }

    if (loader) loader.classList.add("hidden");

    // ✅ Redirect to dashboard if still on login page
    if (window.location.pathname === "/") {
      window.location.href = "/dashboard";
    } else if (listContainer) {
      loadLists();
    }
  } else {
    // Not authenticated
    if (window.location.pathname === "/dashboard") {
      window.location.href = "/";
    }
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (loader) loader.classList.add("hidden");
    if (userInfoBox) userInfoBox.classList.add("hidden");
  }
});


function getInitials(name) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

// ✅ Fetch lists
async function loadLists() {
  const res = await fetch("/api/lists");
  const data = await res.json();
  listContainer.innerHTML = data.lists
    .map((item) => `
      <div class="flex items-start justify-between p-4 bg-white rounded-xl shadow hover:shadow-md transition group">

        <div class="flex gap-3 items-start">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            ${getInitials(item.added_by_name || "U")}
          </div>
          <div class="text-sm">
            <p class="font-semibold text-gray-800">${item.name} ${item.emoji || ""}</p>
            <p class="text-gray-500 text-xs">Added by ${item.added_by_name || "Someone"}</p>
            ${item.note ? `<p class="text-xs italic text-gray-400 mt-1">“${item.note}”</p>` : ""}
          </div>
        </div>

        <button class="text-green-600 hover:text-green-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>

      </div>
    `)
    .join("");
}

// ✅ Login and Logout
window.loginWithGoogle = () => {
  signInWithPopup(auth, provider);
};

window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
};
