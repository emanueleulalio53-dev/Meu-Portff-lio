import { requireAuth, logout } from "./auth.js";

async function init() {
    const user = await requireAuth("login.html");
    if (!user) return;

    const logoutBtn = document.querySelector("[data-logout]");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            await logout();
            window.location.href = "login.html";
        });
    }
}

init();