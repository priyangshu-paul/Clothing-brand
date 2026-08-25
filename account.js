// =====================================================
// FASHION ACCOUNT SYSTEM
// MY ORDERS
// FLIPKART-STYLE ORDER FLOW
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // LOGIN
    // =====================================================

    const loggedInUser = JSON.parse(
        localStorage.getItem("fashionLoggedIn")
    );

    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const accountName =
        document.getElementById("accountName");

    const accountAvatar =
        document.getElementById("accountAvatar");

    const orderHistory =
        document.getElementById("orderHistory");

    const orderMenuCount =
        document.getElementById("orderMenuCount");

    const ordersCountText =
        document.getElementById("ordersCountText");

    const orderSearch =
        document.getElementById("orderSearch");

    const orderFilter =
        document.getElementById("orderFilter");

    const accountLogout =
        document.getElementById("accountLogout");


    // =====================================================
    // PROFILE ELEMENTS
    // =====================================================

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const cancelProfileBtn =
        document.getElementById("cancelProfileBtn");

    const profileView =
        document.getElementById("profileView");

    const profileForm =
        document.getElementById("profileForm");

    const profileName =
        document.getElementById("profileName");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileAddress =
        document.getElementById("profileAddress");

    const profileCity =
        document.getElementById("profileCity");

    const profilePincode =
        document.getElementById("profilePincode");

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const userPhone =
        document.getElementById("userPhone");

    const userAddress =
        document.getElementById("userAddress");

    const userCity =
        document.getElementById("userCity");

    const userPincode =
        document.getElementById("userPincode");


    // =====================================================
    // USER INFORMATION
    // =====================================================

    function displayUser() {

        const name =
            loggedInUser.name || "User";


        if (accountName) {
            accountName.textContent = name;
        }


        if (accountAvatar) {
            accountAvatar.textContent =
                name.charAt(0).toUpperCase();
        }


        if (userName) {
            userName.textContent =
                loggedInUser.name || "-";
        }


        if (userEmail) {
            userEmail.textContent =
                loggedInUser.email || "-";
        }


        if (userPhone) {
            userPhone.textContent =
                loggedInUser.phone || "Not added";
        }


        if (userAddress) {
            userAddress.textContent =
                loggedInUser.address || "Not added";
        }


        if (userCity) {
            userCity.textContent =
                loggedInUser.city || "Not added";
        }


        if (userPincode) {
            userPincode.textContent =
                loggedInUser.pincode || "Not added";
        }

    }


    // =====================================================
    // PROFILE FORM
    // =====================================================

    function loadProfile() {

        if (profileName) {
            profileName.value =
                loggedInUser.name || "";
        }


        if (profilePhone) {
            profilePhone.value =
                loggedInUser.phone || "";
        }


        if (profileAddress) {
            profileAddress.value =
                loggedInUser.address || "";
        }


        if (profileCity) {
            profileCity.value =
                loggedInUser.city || "";
        }


        if (profilePincode) {
            profilePincode.value =
                loggedInUser.pincode || "";
        }

    }


    // =====================================================
    // EDIT PROFILE
    // =====================================================

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            function () {

                loadProfile();


                if (profileView) {
                    profileView.style.display =
                        "none";
                }


                if (profileForm) {
                    profileForm.style.display =
                        "block";
                }


                editProfileBtn.style.display =
                    "none";

            }
        );

    }


    // =====================================================
    // CANCEL PROFILE EDIT
    // =====================================================

    if (cancelProfileBtn) {

        cancelProfileBtn.addEventListener(
            "click",
            function () {

                if (profileForm) {
                    profileForm.style.display =
                        "none";
                }


                if (profileView) {
                    profileView.style.display =
                        "";
                }


                if (editProfileBtn) {
                    editProfileBtn.style.display =
                        "";
                }

            }
        );

    }


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    profileName
                        ? profileName.value.trim()
                        : "";


                const phone =
                    profilePhone
                        ? profilePhone.value.trim()
                        : "";


                const address =
                    profileAddress
                        ? profileAddress.value.trim()
                        : "";


                const city =
                    profileCity
                        ? profileCity.value.trim()
                        : "";


                const pincode =
                    profilePincode
                        ? profilePincode.value.trim()
                        : "";


                // NAME

                if (!name) {

                    alert(
                        "Please enter your full name."
                    );

                    if (profileName) {
                        profileName.focus();
                    }

                    return;

                }


                // PHONE

                if (
                    phone &&
                    !/^[0-9]{10}$/.test(phone)
                ) {

                    alert(
                        "Please enter a valid 10-digit phone number."
                    );

                    if (profilePhone) {
                        profilePhone.focus();
                    }

                    return;

                }


                // PIN

                if (
                    pincode &&
                    !/^[0-9]{6}$/.test(pincode)
                ) {

                    alert(
                        "Please enter a valid 6-digit PIN code."
                    );

                    if (profilePincode) {
                        profilePincode.focus();
                    }

                    return;

                }


                // UPDATE USER

                loggedInUser.name =
                    name;

                loggedInUser.phone =
                    phone;

                loggedInUser.address =
                    address;

                loggedInUser.city =
                    city;

                loggedInUser.pincode =
                    pincode;


                // SAVE LOGIN USER

                localStorage.setItem(
                    "fashionLoggedIn",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                // UPDATE USERS

                let users =
                    JSON.parse(
                        localStorage.getItem(
                            "fashionUsers"
                        )
                    ) || [];


                const userIndex =
                    users.findIndex(
                        user =>
                            String(user.id) ===
                            String(loggedInUser.id)
                    );


                if (userIndex !== -1) {

                    users[userIndex] = {
                        ...users[userIndex],
                        name,
                        phone,
                        address,
                        city,
                        pincode
                    };


                    localStorage.setItem(
                        "fashionUsers",
                        JSON.stringify(users)
                    );

                }


                displayUser();


                if (profileForm) {
                    profileForm.style.display =
                        "none";
                }


                if (profileView) {
                    profileView.style.display =
                        "";
                }


                if (editProfileBtn) {
                    editProfileBtn.style.display =
                        "";
                }


                alert(
                    "Profile updated successfully."
                );

            }
        );

    }


    // =====================================================
    // ORDERS
    // =====================================================

    let allOrders =
        JSON.parse(
            localStorage.getItem(
                "fashionOrders"
            )
        ) || [];


    // =====================================================
    // USER ORDERS
    // =====================================================

    let userOrders =
        allOrders.filter(
            order =>
                String(order.userId) ===
                String(loggedInUser.id)
        );


    // =====================================================
    // UPDATE ORDER COUNTS
    // =====================================================

    function updateOrderCounts() {

        if (orderMenuCount) {

            orderMenuCount.textContent =
                userOrders.length;

        }


        if (ordersCountText) {

            ordersCountText.textContent =
                userOrders.length === 1
                    ? "1 Order"
                    : `${userOrders.length} Orders`;

        }

    }


    // =====================================================
    // GET PRODUCTS
    // =====================================================

    function getProducts(order) {

        return (
            order.products ||
            order.items ||
            []
        );

    }


    // =====================================================
    // GET STATUS
    // =====================================================

    function getStatus(order) {

        return (
            order.status ||
            "Confirmed"
        );

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(value) {

        if (!value) {
            return "Date unavailable";
        }


        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "Date unavailable";

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // GET ORDER NUMBER
    // =====================================================

    function getOrderNumber(order) {

        return (
            order.orderNumber ||
            order.orderId ||
            "N/A"
        );

    }


    // =====================================================
    // GET TOTAL
    // =====================================================

    function getOrderTotal(order) {

        if (
            order.total !== undefined &&
            order.total !== null &&
            order.total !== ""
        ) {

            return String(
                order.total
            ).startsWith("₹")
                ? String(order.total)
                : "₹" +
                  Number(
                      order.total
                  ).toLocaleString("en-IN");

        }


        const products =
            getProducts(order);


        let total = 0;


        products.forEach(
            product => {

                const price =
                    Number(
                        product.price
                    ) || 0;


                const quantity =
                    Number(
                        product.quantity
                    ) || 1;


                total +=
                    price * quantity;

            }
        );


        return "₹" +
            total.toLocaleString(
                "en-IN"
            );

    }


    // =====================================================
    // CHECK IF ORDER CAN BE CANCELLED
    // =====================================================

    function canCancel(order) {

        const status =
            getStatus(order);


        return (
            status === "Confirmed" ||
            status === "Processing"
        );

    }


    // =====================================================
    // CHECK REVIEW AVAILABILITY
    // =====================================================

    function canReview(order) {

        const status =
            getStatus(order);


        return status === "Delivered";

    }


    // =====================================================
    // OPEN ORDER DETAILS
    // =====================================================

    function openOrder(order) {

        localStorage.setItem(
            "selectedOrder",
            JSON.stringify(order)
        );


        window.location.href =
            "order-details.html";

    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    function cancelOrder(order) {

        const orderNumber =
            getOrderNumber(order);


        if (!canCancel(order)) {

            alert(
                "This order can no longer be cancelled."
            );

            return;

        }


        const confirmed =
            confirm(
                `Are you sure you want to cancel Order #${orderNumber}?`
            );


        if (!confirmed) {
            return;
        }


        // ---------------------------------------------
        // FIND ORDER
        // ---------------------------------------------

        const orderIndex =
            allOrders.findIndex(
                existingOrder => {

                    const existingNumber =
                        getOrderNumber(
                            existingOrder
                        );


                    return (
                        String(existingNumber) ===
                        String(orderNumber)
                    );

                }
            );


        if (orderIndex === -1) {

            alert(
                "Order could not be found."
            );

            return;

        }


        // ---------------------------------------------
        // UPDATE STATUS
        // ---------------------------------------------

        allOrders[orderIndex].status =
            "Cancelled";


        allOrders[orderIndex].cancelledAt =
            new Date().toISOString();


        // ---------------------------------------------
        // SAVE
        // ---------------------------------------------

        localStorage.setItem(
            "fashionOrders",
            JSON.stringify(
                allOrders
            )
        );


        // ---------------------------------------------
        // UPDATE SELECTED ORDER
        // ---------------------------------------------

        localStorage.setItem(
            "selectedOrder",
            JSON.stringify(
                allOrders[orderIndex]
            )
        );


        // ---------------------------------------------
        // REFRESH USER ORDERS
        // ---------------------------------------------

        userOrders =
            allOrders.filter(
                existingOrder =>
                    String(
                        existingOrder.userId
                    ) ===
                    String(
                        loggedInUser.id
                    )
            );


        updateOrderCounts();

        renderOrders();


        alert(
            `Order #${orderNumber} has been cancelled successfully.`
        );

    }


    // =====================================================
    // WRITE REVIEW
    // =====================================================

    function writeReview(order) {

        localStorage.setItem(
            "selectedOrder",
            JSON.stringify(order)
        );


        localStorage.setItem(
            "openReview",
            "true"
        );


        window.location.href =
            "order-details.html";

    }


    // =====================================================
    // RENDER ORDER PRODUCTS
    // =====================================================

    function renderProducts(products) {

        if (!products.length) {

            return `

                <div class="account-order-product">

                    <div class="account-order-product-info">

                        <strong>
                            Product information unavailable
                        </strong>

                    </div>

                </div>

            `;

        }


        return products
            .map(
                function (product) {

                    const quantity =
                        Number(
                            product.quantity
                        ) || 1;


                    const price =
                        Number(
                            product.price
                        ) || 0;


                    const total =
                        price *
                        quantity;


                    return `

                        <div class="account-order-product">

                            <div class="account-order-image">

                                <img
                                    src="${
                                        product.image ||
                                        "images/product1.jpg"
                                    }"
                                    alt="${
                                        product.name ||
                                        "Product"
                                    }"
                                >

                            </div>


                            <div class="account-order-product-info">

                                <strong>
                                    ${
                                        product.name ||
                                        "Product"
                                    }
                                </strong>


                                ${
                                    product.size
                                        ? `
                                            <p>
                                                Size: ${product.size}
                                            </p>
                                        `
                                        : ""
                                }


                                <p>
                                    Qty: ${quantity}
                                </p>

                            </div>


                            <div class="account-product-price">

                                ₹${total.toLocaleString("en-IN")}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

    }


    // =====================================================
    // RENDER ORDERS
    // =====================================================

    function renderOrders() {

        if (!orderHistory) {
            return;
        }


        const search =
            orderSearch
                ? orderSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const filter =
            orderFilter
                ? orderFilter.value
                : "all";


        let orders =
            userOrders.filter(
                function (order) {

                    const status =
                        getStatus(order);


                    const orderNumber =
                        String(
                            getOrderNumber(order)
                        )
                        .toLowerCase();


                    const products =
                        getProducts(order);


                    const productFound =
                        products.some(
                            product =>
                                String(
                                    product.name || ""
                                )
                                .toLowerCase()
                                .includes(
                                    search
                                )
                        );


                    const searchMatch =
                        !search ||
                        orderNumber.includes(
                            search
                        ) ||
                        productFound;


                    const filterMatch =
                        filter === "all" ||
                        status === filter;


                    return (
                        searchMatch &&
                        filterMatch
                    );

                }
            );


        // NEWEST FIRST

        orders =
            orders
                .slice()
                .reverse();


        // =================================================
        // EMPTY
        // =================================================

        if (orders.length === 0) {

            orderHistory.innerHTML = `

                <div class="empty-orders">

                    <div class="empty-orders-icon">
                        🛍
                    </div>

                    <h3>
                        ${
                            userOrders.length === 0
                                ? "No orders yet"
                                : "No matching orders"
                        }
                    </h3>

                    <p>
                        ${
                            userOrders.length === 0
                                ? "Your placed orders will appear here."
                                : "Try another search or filter."
                        }
                    </p>

                    ${
                        userOrders.length === 0
                            ? `
                                <a
                                    href="index.html#shop"
                                    class="empty-orders-btn"
                                >
                                    START SHOPPING
                                </a>
                            `
                            : ""
                    }

                </div>

            `;

            return;

        }


        // CLEAR

        orderHistory.innerHTML = "";


        // =================================================
        // CREATE CARDS
        // =================================================

        orders.forEach(
            function (order) {

                const products =
                    getProducts(order);


                const status =
                    getStatus(order);


                const orderNumber =
                    getOrderNumber(order);


                const date =
                    formatDate(
                        order.date
                    );


                const payment =
                    order.payment === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment";


                const total =
                    getOrderTotal(order);


                // -------------------------------------------------
                // CANCEL BUTTON
                // -------------------------------------------------

                const cancelButton =
                    canCancel(order)
                        ? `

                            <button
                                type="button"
                                class="order-cancel-btn"
                            >
                                CANCEL ORDER
                            </button>

                        `
                        : "";


                // -------------------------------------------------
                // REVIEW BUTTON
                // -------------------------------------------------

                const reviewButton =
                    canReview(order)
                        ? `

                            <button
                                type="button"
                                class="order-review-btn"
                            >
                                WRITE A REVIEW
                            </button>

                        `
                        : "";


                // -------------------------------------------------
                // CARD
                // -------------------------------------------------

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "order-history-item";


                card.innerHTML = `

                    <!-- =========================================
                         ORDER HEADER
                    ========================================== -->

                    <div class="order-card-top">

                        <div class="order-card-number">

                            <span>
                                ORDER ID
                            </span>

                            <strong>
                                #${orderNumber}
                            </strong>

                            <div class="order-card-date">
                                ${date}
                            </div>

                        </div>


                        <span
                            class="order-status ${status
                                .toLowerCase()
                                .replace(
                                    /\s+/g,
                                    "-"
                                )}"
                        >
                            ${status}
                        </span>

                    </div>


                    <!-- =========================================
                         PRODUCTS
                    ========================================== -->

                    <div class="order-card-body">

                        ${renderProducts(products)}

                    </div>


                    <!-- =========================================
                         FOOTER
                    ========================================== -->

                    <div class="order-card-footer">


                        <div class="order-footer-info">


                            <div class="order-footer-item">

                                <span>
                                    PAYMENT
                                </span>

                                <strong>
                                    ${payment}
                                </strong>

                            </div>


                            <div class="order-footer-item">

                                <span>
                                    TOTAL
                                </span>

                                <strong>
                                    ${total}
                                </strong>

                            </div>

                        </div>


                        <!-- =================================
                             ACTIONS
                        ================================== -->

                        <div class="order-card-actions">


                            <button
                                type="button"
                                class="view-order-details"
                            >

                                VIEW DETAILS

                                <b>
                                    →
                                </b>

                            </button>


                            ${cancelButton}


                            ${reviewButton}

                        </div>

                    </div>

                `;


                // =================================================
                // VIEW DETAILS
                // =================================================

                const viewButton =
                    card.querySelector(
                        ".view-order-details"
                    );


                if (viewButton) {

                    viewButton.addEventListener(
                        "click",
                        function (event) {

                            event.stopPropagation();

                            openOrder(order);

                        }
                    );

                }


                // =================================================
                // CANCEL
                // =================================================

                const cancelButtonElement =
                    card.querySelector(
                        ".order-cancel-btn"
                    );


                if (cancelButtonElement) {

                    cancelButtonElement.addEventListener(
                        "click",
                        function (event) {

                            event.stopPropagation();

                            cancelOrder(order);

                        }
                    );

                }


                // =================================================
                // REVIEW
                // =================================================

                const reviewButtonElement =
                    card.querySelector(
                        ".order-review-btn"
                    );


                if (reviewButtonElement) {

                    reviewButtonElement.addEventListener(
                        "click",
                        function (event) {

                            event.stopPropagation();

                            writeReview(order);

                        }
                    );

                }


                // =================================================
                // CARD CLICK
                // =================================================

                card.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target.closest(
                                "button"
                            )
                        ) {
                            return;
                        }


                        openOrder(order);

                    }
                );


                orderHistory.appendChild(
                    card
                );

            }
        );

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            renderOrders
        );

    }


    // =====================================================
    // FILTER
    // =====================================================

    if (orderFilter) {

        orderFilter.addEventListener(
            "change",
            renderOrders
        );

    }


    // =====================================================
    // ACCOUNT MENU
    // =====================================================

    const menuItems =
        document.querySelectorAll(
            ".account-menu-item[data-section]"
        );


    const ordersSection =
        document.getElementById(
            "ordersSection"
        );


    const profileSection =
        document.getElementById(
            "profileSection"
        );


    menuItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    menuItems.forEach(
                        menu =>
                            menu.classList.remove(
                                "active"
                            )
                    );


                    item.classList.add(
                        "active"
                    );


                    const section =
                        item.dataset.section;


                    if (
                        section === "orders"
                    ) {

                        if (ordersSection) {

                            ordersSection.classList.add(
                                "active"
                            );

                        }


                        if (profileSection) {

                            profileSection.classList.remove(
                                "active"
                            );

                        }

                    }


                    if (
                        section === "profile"
                    ) {

                        if (profileSection) {

                            profileSection.classList.add(
                                "active"
                            );

                        }


                        if (ordersSection) {

                            ordersSection.classList.remove(
                                "active"
                            );

                        }

                    }

                }
            );

        }
    );


    // =====================================================
    // LOGOUT
    // =====================================================

    if (accountLogout) {

        accountLogout.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "fashionLoggedIn"
                );


                localStorage.removeItem(
                    "selectedOrder"
                );


                localStorage.removeItem(
                    "openReview"
                );


                window.location.href =
                    "index.html";

            }
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    displayUser();

    updateOrderCounts();

    renderOrders();

});hgxgfgfzvfzfxbfxbfxbfx