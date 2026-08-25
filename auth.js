// =====================================================
// FASHION AUTH SYSTEM
// SUPABASE AUTH + PROFILES
// =====================================================

"use strict";


// =====================================================
// CUSTOM NOTIFICATION
// =====================================================

function showNotification(message, type = "success") {

    const oldNotification =
        document.querySelector(".fashion-notification");

    if (oldNotification) {
        oldNotification.remove();
    }


    const notification =
        document.createElement("div");


    notification.className =
        `fashion-notification ${type}`;


    notification.innerHTML = `

        <div class="notification-icon">
            ${type === "success" ? "✓" : "!"}
        </div>

        <div class="notification-content">

            <strong>
                ${type === "success" ? "Success" : "Oops"}
            </strong>

            <p>
                ${message}
            </p>

        </div>

        <button
            type="button"
            class="notification-close"
        >
            ×
        </button>

    `;


    document.body.appendChild(
        notification
    );


    setTimeout(function () {

        notification.classList.add(
            "show"
        );

    }, 50);


    const closeButton =
        notification.querySelector(
            ".notification-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                notification.classList.remove(
                    "show"
                );


                setTimeout(function () {

                    if (
                        notification.parentElement
                    ) {

                        notification.remove();

                    }

                }, 300);

            }
        );

    }


    setTimeout(function () {

        if (
            notification.parentElement
        ) {

            notification.classList.remove(
                "show"
            );


            setTimeout(function () {

                if (
                    notification.parentElement
                ) {

                    notification.remove();

                }

            }, 300);

        }

    }, 4000);

}



// =====================================================
// CHECK SUPABASE
// =====================================================

if (
    typeof supabaseClient ===
    "undefined"
) {

    console.error(
        "supabaseClient is not defined."
    );

}



// =====================================================
// REGISTER
// =====================================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =============================================
            // CHECK SUPABASE
            // =============================================

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                showNotification(
                    "Supabase is not connected.",
                    "error"
                );

                return;

            }


            // =============================================
            // GET FORM ELEMENTS
            // =============================================

            const nameInput =
                document.getElementById(
                    "registerName"
                );


            const emailInput =
                document.getElementById(
                    "registerEmail"
                );


            const passwordInput =
                document.getElementById(
                    "registerPassword"
                );


            const confirmPasswordInput =
                document.getElementById(
                    "confirmPassword"
                );


            if (
                !nameInput ||
                !emailInput ||
                !passwordInput ||
                !confirmPasswordInput
            ) {

                showNotification(
                    "Registration form is incomplete.",
                    "error"
                );

                return;

            }


            // =============================================
            // GET VALUES
            // =============================================

            const name =
                nameInput.value.trim();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmPasswordInput.value;



            // =============================================
            // VALIDATION
            // =============================================

            if (!name) {

                showNotification(
                    "Please enter your name.",
                    "error"
                );

                nameInput.focus();

                return;

            }


            if (!email) {

                showNotification(
                    "Please enter your email.",
                    "error"
                );

                emailInput.focus();

                return;

            }


            if (password.length < 6) {

                showNotification(
                    "Password must be at least 6 characters.",
                    "error"
                );

                passwordInput.focus();

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                showNotification(
                    "Passwords do not match.",
                    "error"
                );

                confirmPasswordInput.focus();

                return;

            }



            // =============================================
            // BUTTON
            // =============================================

            const submitButton =
                registerForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "CREATING ACCOUNT...";

            }



            try {

                // =========================================
                // CREATE SUPABASE AUTH USER
                // =========================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signUp({

                        email:
                            email,

                        password:
                            password,

                        options: {

                            data: {

                                name:
                                    name

                            }

                        }

                    });


                if (error) {

                    console.error(
                        "Supabase registration error:",
                        error
                    );

                    throw error;

                }


                const user =
                    data.user;


                if (!user) {

                    throw new Error(
                        "User could not be created."
                    );

                }



                // =========================================
                // CREATE PROFILE
                // =========================================

                /*
                 * If email confirmation is disabled,
                 * a session exists immediately.
                 *
                 * If email confirmation is enabled,
                 * there may be no session.
                 *
                 * In that case the profile will be
                 * created after the user logs in.
                 */

                if (data.session) {

                    const {
                        error:
                            profileError
                    } =
                        await supabaseClient
                            .from("profiles")
                            .upsert(
                                {
                                    id:
                                        user.id,

                                    name:
                                        name,

                                    email:
                                        email
                                },
                                {
                                    onConflict:
                                        "id"
                                }
                            );


                    if (profileError) {

                        console.error(
                            "Profile creation error:",
                            profileError
                        );

                    }

                }



                // =========================================
                // SUCCESS
                // =========================================

                if (!data.session) {

                    showNotification(
                        "Account created! Please check your email and verify your account."
                    );

                } else {

                    showNotification(
                        "Account created successfully!"
                    );

                }



                // =========================================
                // REDIRECT
                // =========================================

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 1800);


            } catch (error) {

                console.error(
                    "Registration failed:",
                    error
                );


                let message =
                    "Unable to create account.";


                if (
                    error &&
                    error.message
                ) {

                    message =
                        error.message;

                }


                // FRIENDLY SUPABASE ERRORS

                if (
                    message
                        .toLowerCase()
                        .includes(
                            "user already registered"
                        )
                ) {

                    message =
                        "An account with this email already exists.";

                }


                showNotification(
                    message,
                    "error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "CREATE ACCOUNT";

                }

            }

        }
    );

}



// =====================================================
// LOGIN
// =====================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =============================================
            // CHECK SUPABASE
            // =============================================

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                showNotification(
                    "Supabase is not connected.",
                    "error"
                );

                return;

            }


            // =============================================
            // FORM ELEMENTS
            // =============================================

            const emailInput =
                document.getElementById(
                    "loginEmail"
                );


            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                showNotification(
                    "Login form is incomplete.",
                    "error"
                );

                return;

            }


            // =============================================
            // VALUES
            // =============================================

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;



            // =============================================
            // VALIDATION
            // =============================================

            if (!email) {

                showNotification(
                    "Please enter your email.",
                    "error"
                );

                emailInput.focus();

                return;

            }


            if (!password) {

                showNotification(
                    "Please enter your password.",
                    "error"
                );

                passwordInput.focus();

                return;

            }



            // =============================================
            // BUTTON
            // =============================================

            const submitButton =
                loginForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "LOGGING IN...";

            }



            try {

                // =========================================
                // SUPABASE LOGIN
                // =========================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                if (error) {

                    console.error(
                        "Supabase login error:",
                        error
                    );

                    throw error;

                }


                const user =
                    data.user;


                if (!user) {

                    throw new Error(
                        "Login failed."
                    );

                }



                // =========================================
                // GET PROFILE
                // =========================================

                let {
                    data:
                        profile,
                    error:
                        profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("*")
                        .eq(
                            "id",
                            user.id
                        )
                        .maybeSingle();


                if (profileError) {

                    console.warn(
                        "Profile loading warning:",
                        profileError
                    );

                }



                // =========================================
                // CREATE PROFILE IF MISSING
                // =========================================

                if (!profile) {

                    const userName =
                        user.user_metadata?.name ||
                        email.split("@")[0];


                    const {
                        data:
                            newProfile,
                        error:
                            createProfileError
                    } =
                        await supabaseClient
                            .from("profiles")
                            .upsert(
                                {
                                    id:
                                        user.id,

                                    name:
                                        userName,

                                    email:
                                        email
                                },
                                {
                                    onConflict:
                                        "id"
                                }
                            )
                            .select()
                            .single();


                    if (
                        createProfileError
                    ) {

                        console.error(
                            "Profile creation after login failed:",
                            createProfileError
                        );

                    } else {

                        profile =
                            newProfile;

                    }

                }



                // =========================================
                // USER NAME
                // =========================================

                const userName =
                    profile &&
                    profile.name
                        ? profile.name
                        : user.user_metadata?.name ||
                          email.split("@")[0];



                // =========================================
                // SUCCESS
                // =========================================

                showNotification(
                    `Welcome back, ${userName}!`
                );



                // =========================================
                // REDIRECT
                // =========================================

                setTimeout(function () {

                    window.location.href =
                        "index.html";

                }, 1200);


            } catch (error) {

                console.error(
                    "Login failed:",
                    error
                );


                let message =
                    "Invalid email or password.";


                if (
                    error &&
                    error.message
                ) {

                    const errorMessage =
                        error.message.toLowerCase();


                    if (
                        errorMessage.includes(
                            "email not confirmed"
                        )
                    ) {

                        message =
                            "Please verify your email before logging in.";

                    }

                    else if (
                        errorMessage.includes(
                            "invalid login credentials"
                        )
                    ) {

                        message =
                            "Invalid email or password.";

                    }

                    else {

                        message =
                            error.message;

                    }

                }


                showNotification(
                    message,
                    "error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "LOGIN";

                }

            }

        }
    );

}



// =====================================================
// HOME PAGE ACCOUNT NAVIGATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const authLinks =
            document.getElementById(
                "authLinks"
            );


        if (!authLinks) {
            return;
        }


        // =============================================
        // CHECK SUPABASE
        // =============================================

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "Supabase client unavailable."
            );

            return;

        }



        // =============================================
        // GET SESSION
        // =============================================

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return;

        }


        const session =
            data.session;



        // =============================================
        // LOGGED IN
        // =============================================

        if (session) {

            authLinks.innerHTML = `

                <a
                    href="account.html"
                    class="account-nav-link"
                >
                    👤 My Account
                </a>

            `;

        }


        // =============================================
        // NOT LOGGED IN
        // =============================================

        else {

            authLinks.innerHTML = `

                <a href="login.html">
                    Login
                </a>

                <a href="register.html">
                    Register
                </a>

            `;

        }

    }
);



// =====================================================
// SUPABASE AUTH STATE LISTENER
// =====================================================

if (
    typeof supabaseClient !==
    "undefined"
) {

    supabaseClient.auth.onAuthStateChange(
        function (
            event,
            session
        ) {

            console.log(
                "Auth state changed:",
                event
            );


            const authLinks =
                document.getElementById(
                    "authLinks"
                );


            if (!authLinks) {
                return;
            }


            if (session) {

                authLinks.innerHTML = `

                    <a
                        href="account.html"
                        class="account-nav-link"
                    >
                        👤 My Account
                    </a>

                `;

            }

            else {

                authLinks.innerHTML = `

                    <a href="login.html">
                        Login
                    </a>

                    <a href="register.html">
                        Register
                    </a>

                `;

            }

        }
    );

}



// =====================================================
// LOGOUT FUNCTION
// =====================================================

async function logoutUser() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        showNotification(
            "Supabase is not connected.",
            "error"
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            throw error;

        }


        showNotification(
            "You have been logged out."
        );


        setTimeout(function () {

            window.location.href =
                "index.html";

        }, 1000);


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showNotification(
            "Unable to logout.",
            "error"
        );

    }

}