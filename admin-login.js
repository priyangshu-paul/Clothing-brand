// =====================================================
// FASHION ADMIN LOGIN
// =====================================================

"use strict";


// =====================================================
// ADMIN CREDENTIALS
// =====================================================

const ADMIN_EMAIL = "admin@fashion.com";
const ADMIN_PASSWORD = "admin123";


// =====================================================
// CHECK EXISTING ADMIN LOGIN
// =====================================================

const adminLoggedIn =
    localStorage.getItem(
        "fashionAdminLoggedIn"
    );


if (adminLoggedIn === "true") {

    window.location.href =
        "admin.html";

}


// =====================================================
// LOGIN FORM
// =====================================================

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // =================================================
            // GET EMAIL
            // =================================================

            const email =
                document
                    .getElementById(
                        "adminEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            // =================================================
            // GET PASSWORD
            // =================================================

            const password =
                document
                    .getElementById(
                        "adminPassword"
                    )
                    .value;


            // =================================================
            // CHECK ADMIN CREDENTIALS
            // =================================================

            if (
                email === ADMIN_EMAIL &&
                password === ADMIN_PASSWORD
            ) {


                // =================================================
                // SAVE ADMIN LOGIN
                // =================================================

                localStorage.setItem(
                    "fashionAdminLoggedIn",
                    "true"
                );


                // =================================================
                // SAVE ADMIN USER
                // =================================================

                const adminUser = {

                    name: "Fashion Admin",

                    email: ADMIN_EMAIL,

                    role: "admin"

                };


                localStorage.setItem(
                    "fashionCurrentUser",
                    JSON.stringify(
                        adminUser
                    )
                );


                // =================================================
                // VERIFY STORAGE
                // =================================================

                console.log(
                    "Admin login successful."
                );


                console.log(
                    "fashionAdminLoggedIn:",
                    localStorage.getItem(
                        "fashionAdminLoggedIn"
                    )
                );


                console.log(
                    "fashionCurrentUser:",
                    localStorage.getItem(
                        "fashionCurrentUser"
                    )
                );


                // =================================================
                // REDIRECT TO ADMIN DASHBOARD
                // =================================================

                window.location.href =
                    "admin.html";

            } else {


                // =================================================
                // INVALID LOGIN
                // =================================================

                alert(
                    "Invalid admin email or password."
                );

            }

        }
    );

}