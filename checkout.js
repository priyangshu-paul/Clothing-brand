// =====================================================
// FASHION CHECKOUT SYSTEM
// SUPABASE AUTH + CART + ORDER
// =====================================================

"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // SUPABASE CHECK
    // =====================================================

    if (typeof supabaseClient === "undefined") {

        console.error("supabaseClient is not defined.");

        alert(
            "Supabase is not connected. Please check supabase.js."
        );

        return;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const checkoutItems =
        document.getElementById("checkoutItems");

    const checkoutSubtotal =
        document.getElementById("checkoutSubtotal");

    const checkoutShipping =
        document.getElementById("checkoutShipping");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    const placeOrder =
        document.getElementById("placeOrder");


    // =====================================================
    // LOAD CART
    // =====================================================

    let cart = [];

    try {

        const savedCart =
            JSON.parse(
                localStorage.getItem("fashionCart") || "[]"
            );

        if (Array.isArray(savedCart)) {

            cart = savedCart;

        }

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        cart = [];

    }


    // =====================================================
    // GET SUPABASE AUTH SESSION
    // =====================================================

    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth.getSession();


    if (sessionError) {

        console.error(
            "Session error:",
            sessionError
        );

        alert(
            "Unable to verify your login."
        );

        return;

    }


    const session =
        sessionData?.session;


    const authUser =
        session?.user;


    // =====================================================
    // LOGIN CHECK
    // =====================================================

    if (!authUser) {

        if (placeOrder) {

            placeOrder.disabled =
                true;

        }

        alert(
            "Please login before checkout."
        );


        setTimeout(function () {

            window.location.href =
                "login.html";

        }, 800);


        return;

    }


    // =====================================================
    // GET PROFILE
    // =====================================================

    let profile = null;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    authUser.id
                )
                .maybeSingle();


        if (error) {

            console.warn(
                "Profile loading warning:",
                error
            );

        } else {

            profile =
                data;

        }

    } catch (error) {

        console.warn(
            "Profile request failed:",
            error
        );

    }


    // =====================================================
    // USER DATA
    // =====================================================

    const metadata =
        authUser.user_metadata || {};


    const userName =
        profile?.name ||
        metadata.name ||
        metadata.full_name ||
        authUser.email?.split("@")[0] ||
        "";


    const userEmail =
        authUser.email ||
        "";


    const userPhone =
        profile?.phone ||
        metadata.phone ||
        "";


    const userAddress =
        profile?.address ||
        metadata.address ||
        "";


    const userCity =
        profile?.city ||
        metadata.city ||
        "";


    const userPincode =
        profile?.pincode ||
        metadata.pincode ||
        "";


    // =====================================================
    // LEGACY LOGIN COMPATIBILITY
    // =====================================================

    localStorage.setItem(
        "fashionLoggedIn",
        JSON.stringify({

            id:
                authUser.id,

            userId:
                authUser.id,

            name:
                userName,

            email:
                userEmail,

            phone:
                userPhone,

            address:
                userAddress,

            city:
                userCity,

            pincode:
                userPincode

        })
    );


    // =====================================================
    // PRICE FORMAT
    // =====================================================

    function formatPrice(value) {

        return (
            "₹" +
            (
                Number(value) || 0
            ).toLocaleString(
                "en-IN"
            )
        );

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(
            value || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =====================================================
    // FILL CUSTOMER INFORMATION
    // =====================================================

    function fillUserInformation() {

        const email =
            document.getElementById(
                "email"
            );


        const firstName =
            document.getElementById(
                "firstName"
            );


        const lastName =
            document.getElementById(
                "lastName"
            );


        const address =
            document.getElementById(
                "address"
            );


        const city =
            document.getElementById(
                "city"
            );


        const pincode =
            document.getElementById(
                "pincode"
            );


        const phone =
            document.getElementById(
                "phone"
            );


        const nameParts =
            userName
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (email) {

            email.value =
                userEmail;

        }


        if (firstName) {

            firstName.value =
                nameParts[0] || "";

        }


        if (lastName) {

            lastName.value =
                nameParts
                    .slice(1)
                    .join(" ");

        }


        if (address) {

            address.value =
                userAddress;

        }


        if (city) {

            city.value =
                userCity;

        }


        if (pincode) {

            pincode.value =
                userPincode;

        }


        if (phone) {

            phone.value =
                userPhone;

        }

    }


    // =====================================================
    // DISPLAY CHECKOUT
    // =====================================================

    function displayCheckout() {

        if (!checkoutItems) {

            return;

        }


        checkoutItems.innerHTML =
            "";


        // =================================================
        // EMPTY CART
        // =================================================

        if (!cart.length) {

            checkoutItems.innerHTML = `

                <div class="checkout-empty">

                    <h3>
                        Your cart is empty
                    </h3>

                    <p>
                        Add products before checkout.
                    </p>

                    <a href="index.html#shop">
                        CONTINUE SHOPPING
                    </a>

                </div>

            `;


            if (checkoutSubtotal) {

                checkoutSubtotal.textContent =
                    "₹0";

            }


            if (checkoutShipping) {

                checkoutShipping.textContent =
                    "₹0";

            }


            if (checkoutTotal) {

                checkoutTotal.textContent =
                    "₹0";

            }


            if (placeOrder) {

                placeOrder.disabled =
                    true;

            }


            return;

        }


        // =================================================
        // CALCULATE SUBTOTAL
        // =================================================

        let subtotal =
            0;


        // =================================================
        // DISPLAY PRODUCTS
        // =================================================

        cart.forEach(function (item) {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity
                    ) || 1
                );


            const itemTotal =
                price *
                quantity;


            subtotal +=
                itemTotal;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "checkout-item";


            // =================================================
            // IMAGE
            // =================================================

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "checkout-product-image";


            image.src =
                item.image ||
                "product1.jpg";


            image.alt =
                item.name ||
                "Product";


            image.onerror =
                function () {

                    this.onerror =
                        null;

                    this.src =
                        "product1.jpg";

                };


            // =================================================
            // PRODUCT INFO
            // =================================================

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "checkout-product-info";


            info.innerHTML = `

                <h3>
                    ${escapeHTML(
                        item.name ||
                        "Product"
                    )}
                </h3>

                <p>
                    Quantity:
                    ${quantity}
                </p>

                ${
                    item.size
                        ? `
                            <p>
                                Size:
                                ${escapeHTML(
                                    item.size
                                )}
                            </p>
                        `
                        : ""
                }

                <strong>
                    ${formatPrice(
                        itemTotal
                    )}
                </strong>

            `;


            itemElement.appendChild(
                image
            );


            itemElement.appendChild(
                info
            );


            checkoutItems.appendChild(
                itemElement
            );

        });


        // =================================================
        // SHIPPING
        // =================================================

        const shipping =
            subtotal >= 1999
                ? 0
                : 99;


        const total =
            subtotal +
            shipping;


        // =================================================
        // UPDATE TOTALS
        // =================================================

        if (checkoutSubtotal) {

            checkoutSubtotal.textContent =
                formatPrice(
                    subtotal
                );

        }


        if (checkoutShipping) {

            checkoutShipping.textContent =
                shipping === 0
                    ? "FREE"
                    : formatPrice(
                        shipping
                    );

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                formatPrice(
                    total
                );

        }


        if (placeOrder) {

            placeOrder.disabled =
                false;

        }

    }


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    function validateForm() {

        const email =
            document.getElementById(
                "email"
            );


        const firstName =
            document.getElementById(
                "firstName"
            );


        const lastName =
            document.getElementById(
                "lastName"
            );


        const address =
            document.getElementById(
                "address"
            );


        const city =
            document.getElementById(
                "city"
            );


        const pincode =
            document.getElementById(
                "pincode"
            );


        const phone =
            document.getElementById(
                "phone"
            );


        // EMAIL

        if (
            !email ||
            !email.value.trim()
        ) {

            alert(
                "Please enter your email."
            );

            email?.focus();

            return false;

        }


        // FIRST NAME

        if (
            !firstName ||
            !firstName.value.trim()
        ) {

            alert(
                "Please enter your first name."
            );

            firstName?.focus();

            return false;

        }


        // LAST NAME

        if (
            !lastName ||
            !lastName.value.trim()
        ) {

            alert(
                "Please enter your last name."
            );

            lastName?.focus();

            return false;

        }


        // ADDRESS

        if (
            !address ||
            !address.value.trim()
        ) {

            alert(
                "Please enter your address."
            );

            address?.focus();

            return false;

        }


        // CITY

        if (
            !city ||
            !city.value.trim()
        ) {

            alert(
                "Please enter your city."
            );

            city?.focus();

            return false;

        }


        // PINCODE

        if (
            !pincode ||
            !/^[0-9]{6}$/.test(
                pincode.value.trim()
            )
        ) {

            alert(
                "Please enter a valid 6-digit PIN code."
            );

            pincode?.focus();

            return false;

        }


        // PHONE

        if (
            !phone ||
            !/^[0-9]{10}$/.test(
                phone.value.trim()
            )
        ) {

            alert(
                "Please enter a valid 10-digit phone number."
            );

            phone?.focus();

            return false;

        }


        return true;

    }


    // =====================================================
    // PLACE ORDER
    // =====================================================

    if (placeOrder) {

        placeOrder.addEventListener(
            "click",
            async function () {

                if (
                    placeOrder.disabled
                ) {

                    return;

                }


                if (
                    !cart.length
                ) {

                    alert(
                        "Your cart is empty."
                    );

                    return;

                }


                if (
                    !validateForm()
                ) {

                    return;

                }


                placeOrder.disabled =
                    true;


                placeOrder.textContent =
                    "PLACING ORDER...";


                try {

                    // =====================================
                    // CUSTOMER DETAILS
                    // =====================================

                    const email =
                        document
                            .getElementById(
                                "email"
                            )
                            .value
                            .trim();


                    const firstName =
                        document
                            .getElementById(
                                "firstName"
                            )
                            .value
                            .trim();


                    const lastName =
                        document
                            .getElementById(
                                "lastName"
                            )
                            .value
                            .trim();


                    const address =
                        document
                            .getElementById(
                                "address"
                            )
                            .value
                            .trim();


                    const city =
                        document
                            .getElementById(
                                "city"
                            )
                            .value
                            .trim();


                    const pincode =
                        document
                            .getElementById(
                                "pincode"
                            )
                            .value
                            .trim();


                    const phone =
                        document
                            .getElementById(
                                "phone"
                            )
                            .value
                            .trim();


                    // =====================================
                    // PAYMENT
                    // =====================================

                    const paymentElement =
                        document.querySelector(
                            'input[name="payment"]:checked'
                        );


                    const payment =
                        paymentElement
                            ? paymentElement.value
                            : "cod";


                    // =====================================
                    // CALCULATE TOTAL
                    // =====================================

                    let subtotal =
                        0;


                    cart.forEach(
                        function (item) {

                            const price =
                                Number(
                                    item.price
                                ) || 0;


                            const quantity =
                                Math.max(
                                    1,
                                    Number(
                                        item.quantity
                                    ) || 1
                                );


                            subtotal +=
                                price *
                                quantity;

                        }
                    );


                    const shipping =
                        subtotal >= 1999
                            ? 0
                            : 99;


                    const total =
                        subtotal +
                        shipping;


                    // =====================================
                    // CUSTOMER NAME
                    // =====================================

                    const customerName =
                        `${firstName} ${lastName}`
                            .trim();


                    // =====================================
                    // SHIPPING ADDRESS
                    // =====================================

                    const shippingAddress =
                        [
                            address,
                            city,
                            pincode
                        ]
                            .filter(Boolean)
                            .join(", ");


                    // =====================================
                    // DATABASE ORDER
                    //
                    // ONLY EXISTING COLUMNS
                    // =====================================

                    const orderData = {

                        customer_name:
                            customerName,

                        customer_email:
                            email,

                        customer_phone:
                            phone,

                        shipping_address:
                            shippingAddress,

                        items:
                            cart,

                        total:
                            total,

                        status:
                            "Confirmed"

                    };


                    console.log(
                        "Order data:",
                        orderData
                    );


                    // =====================================
                    // INSERT INTO SUPABASE
                    // =====================================

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("orders")
                            .insert([
                                orderData
                            ])
                            .select()
                            .single();


                    if (error) {

                        console.error(
                            "Supabase order error:",
                            error
                        );

                        throw error;

                    }


                    // =====================================
                    // ORDER NUMBER
                    // =====================================

                    const orderNumber =
                        "FASH" +
                        Date.now();


                    // =====================================
                    // SUCCESS ORDER
                    // =====================================

                    const successOrder = {

                        id:
                            data?.id ||
                            null,

                        orderId:
                            orderNumber,

                        orderNumber:
                            orderNumber,

                        customer: {

                            name:
                                customerName,

                            email:
                                email,

                            firstName:
                                firstName,

                            lastName:
                                lastName,

                            address:
                                address,

                            city:
                                city,

                            pincode:
                                pincode,

                            phone:
                                phone

                        },

                        payment:
                            payment,

                        paymentMethod:
                            payment,

                        items:
                            cart,

                        products:
                            cart,

                        subtotal:
                            subtotal,

                        shipping:
                            shipping,

                        total:
                            total,

                        status:
                            "Confirmed",

                        date:
                            data?.created_at ||
                            new Date()
                                .toISOString()

                    };


                    // =====================================
                    // SAVE LAST ORDER
                    // =====================================

                    localStorage.setItem(
                        "fashionLastOrder",
                        JSON.stringify(
                            successOrder
                        )
                    );


                    localStorage.setItem(
                        "selectedOrder",
                        JSON.stringify(
                            successOrder
                        )
                    );


                    // =====================================
                    // CLEAR CART
                    // =====================================

                    localStorage.setItem(
                        "fashionCart",
                        "[]"
                    );


                    cart =
                        [];


                    // =====================================
                    // UPDATE CART
                    // =====================================

                    document.dispatchEvent(
                        new CustomEvent(
                            "cartUpdated",
                            {
                                detail: {
                                    cart: []
                                }
                            }
                        )
                    );


                    // =====================================
                    // SUCCESS
                    // =====================================

                    alert(
                        "Order placed successfully!"
                    );


                    // =====================================
                    // REDIRECT
                    // =====================================

                    setTimeout(
                        function () {

                            window.location.href =
                                "order-success.html";

                        },
                        500
                    );

                }


                catch (error) {

                    console.error(
                        "ORDER PLACEMENT FAILED:",
                        error
                    );


                    alert(
                        error?.message ||
                        "Unable to place order. Please try again."
                    );


                    placeOrder.disabled =
                        false;


                    placeOrder.textContent =
                        "PLACE ORDER";

                }

            }
        );

    }


    // =====================================================
    // INITIALIZE
    // =====================================================

    fillUserInformation();

    displayCheckout();

});