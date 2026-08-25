// =====================================================
// FASHION ACCOUNT NAVIGATION
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const authLinks =
        document.getElementById("authLinks");

    if (!authLinks) {
        return;
    }


    const loggedInUser =
        JSON.parse(
            localStorage.getItem("fashionLoggedIn")
        );


    // =================================================
    // LOGGED IN
    // =================================================

    if (loggedInUser) {

        authLinks.innerHTML = `

            <a href="account.html">
                My Account
            </a>

            <button
                type="button"
                id="navLogout"
                class="nav-logout"
            >
                Logout
            </button>

        `;


        const navLogout =
            document.getElementById("navLogout");


        if (navLogout) {

            navLogout.addEventListener(
                "click",
                function () {

                    localStorage.removeItem(
                        "fashionLoggedIn"
                    );


                    if (
                        typeof showNotification ===
                        "function"
                    ) {

                        showNotification(
                            "You have been logged out."
                        );

                    }


                    setTimeout(function () {

                        window.location.reload();

                    }, 800);

                }
            );

        }

    }


    // =================================================
    // NOT LOGGED IN
    // =================================================

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

});