// =====================================================
// FASHION ADMIN LOGIN
// SUPABASE AUTH
// =====================================================

"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    if (typeof supabaseClient === "undefined") {
        alert("Supabase is not connected. Check supabase.js.");
        return;
    }

    const ADMIN_EMAIL = "admin@fashion.com";

    const form = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const loginButton = document.getElementById("adminLoginButton");

    if (!form) {
        return;
    }

    // =================================================
    // CHECK EXISTING SESSION
    // =================================================

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        const session = data?.session;

        if (session?.user) {

            const email =
                String(session.user.email || "")
                    .trim()
                    .toLowerCase();

            if (email === ADMIN_EMAIL) {
                window.location.replace("admin.html");
                return;
            }

            await supabaseClient.auth.signOut();
        }

    } catch (error) {

        console.error(
            "Admin session check failed:",
            error
        );

    }


    // =================================================
    // LOGIN
    // =================================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;

        if (email !== ADMIN_EMAIL) {

            alert(
                "Only the authorized admin account can access this panel."
            );

            return;
        }

        if (!password) {

            alert(
                "Please enter your password."
            );

            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "SIGNING IN...";

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });

            if (error) {
                throw error;
            }

            if (!data?.user) {

                throw new Error(
                    "Admin session could not be created."
                );

            }

            const loggedEmail =
                String(data.user.email || "")
                    .trim()
                    .toLowerCase();

            if (loggedEmail !== ADMIN_EMAIL) {

                await supabaseClient.auth.signOut();

                throw new Error(
                    "This account is not authorized as an admin."
                );

            }

            // Remove old authentication values
            localStorage.removeItem(
                "fashionAdminLoggedIn"
            );

            localStorage.removeItem(
                "fashionCurrentUser"
            );

            localStorage.removeItem(
                "fashionAdmin"
            );

            window.location.replace(
                "admin.html"
            );

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            alert(
                error.message ||
                "Invalid admin email or password."
            );

            passwordInput.value = "";

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "ADMIN LOGIN";

        }

    });

});