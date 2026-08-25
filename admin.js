// =========================
// ADMIN ACCESS PROTECTION
// =========================

const adminLoggedIn =
    localStorage.getItem("fashionAdminLoggedIn");

if (adminLoggedIn !== "true") {
    window.location.href = "admin-login.html";
}


// =========================
// GET DATA
// =========================

let orders =
    JSON.parse(
        localStorage.getItem("fashionOrders")
    ) || [];

const users =
    JSON.parse(
        localStorage.getItem("fashionUsers")
    ) || [];


// =========================
// ELEMENTS
// =========================

const totalOrders =
    document.getElementById("totalOrders");

const totalSales =
    document.getElementById("totalSales");

const totalCustomers =
    document.getElementById("totalCustomers");

const productsSold =
    document.getElementById("productsSold");

const adminOrders =
    document.getElementById("adminOrders");

const clearOrders =
    document.getElementById("clearOrders");

const adminLogout =
    document.getElementById("adminLogout");

const orderSearch =
    document.getElementById("orderSearch");

const orderStatusFilter =
    document.getElementById("orderStatusFilter");


// =========================
// DASHBOARD STATS
// =========================

function updateDashboardStats() {

    if (totalOrders) {
        totalOrders.textContent = orders.length;
    }


    if (totalCustomers) {
        totalCustomers.textContent = users.length;
    }


    let sales = 0;

    orders.forEach(order => {

        const total =
            parseInt(
                String(order.total || "")
                    .replace(/[^\d]/g, "")
            ) || 0;

        sales += total;

    });


    if (totalSales) {
        totalSales.textContent =
            "₹" + sales.toLocaleString("en-IN");
    }


    let soldProducts = 0;

    orders.forEach(order => {

        if (!order.products) {
            return;
        }

        order.products.forEach(product => {

            soldProducts +=
                Number(product.quantity) || 1;

        });

    });


    if (productsSold) {
        productsSold.textContent =
            soldProducts;
    }

}


// =========================
// SAVE ORDERS
// =========================

function saveOrders() {

    localStorage.setItem(
        "fashionOrders",
        JSON.stringify(orders)
    );

}


// =========================
// CHANGE ORDER STATUS
// =========================

function changeOrderStatus(
    orderNumber,
    newStatus
) {

    const order =
        orders.find(
            item =>
                String(item.orderNumber) ===
                String(orderNumber)
        );

    if (!order) {
        return;
    }


    order.status = newStatus;

    saveOrders();

    updateDashboardStats();

    filterOrders();

}


// =========================
// CREATE ORDER CARD
// =========================

function createOrderCard(order) {

    const orderCard =
        document.createElement("div");

    orderCard.className =
        "admin-order-card";


    // =========================
    // DATE
    // =========================

    let orderDate =
        "Date unavailable";


    if (order.date) {

        const parsedDate =
            new Date(order.date);

        if (!isNaN(parsedDate.getTime())) {

            orderDate =
                parsedDate.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        }

    }


    // =========================
    // PRODUCTS
    // =========================

    let productsHTML = "";


    if (
        order.products &&
        order.products.length > 0
    ) {

        productsHTML =
            order.products
                .map(product => {

                    const quantity =
                        Number(product.quantity) || 1;

                    return `

                        <div class="admin-product">

                            <img
                                src="${product.image || ""}"
                                alt="${product.name || "Product"}"
                            >

                            <div>

                                <strong>
                                    ${product.name || "Product"}
                                </strong>

                                <p>

                                    ${
                                        product.size
                                            ? `Size: ${product.size} · `
                                            : ""
                                    }

                                    Qty: ${quantity}

                                </p>

                            </div>

                        </div>

                    `;

                })
                .join("");

    } else {

        productsHTML = `

            <p>
                No product information available.
            </p>

        `;

    }


    // =========================
    // PAYMENT
    // =========================

    const payment =
        order.payment === "cod"
            ? "Cash on Delivery"
            : "Online Payment";


    // =========================
    // CUSTOMER
    // =========================

    const customer =
        order.customer || {};


    // =========================
    // STATUS
    // =========================

    const currentStatus =
        order.status || "Confirmed";


    // =========================
    // ORDER CARD
    // =========================

    orderCard.innerHTML = `

        <div class="admin-order-header">

            <div>

                <strong>
                    #${order.orderNumber || "N/A"}
                </strong>

                <p>
                    ${orderDate}
                </p>

            </div>


            <div class="admin-status-control">

                <label>
                    ORDER STATUS
                </label>

                <select
                    class="order-status-select"
                    data-order="${order.orderNumber || ""}"
                    title="Change order status"
                >

                    <option
                        value="Confirmed"
                        ${currentStatus === "Confirmed" ? "selected" : ""}
                    >
                        Confirmed
                    </option>

                    <option
                        value="Processing"
                        ${currentStatus === "Processing" ? "selected" : ""}
                    >
                        Processing
                    </option>

                    <option
                        value="Shipped"
                        ${currentStatus === "Shipped" ? "selected" : ""}
                    >
                        Shipped
                    </option>

                    <option
                        value="Delivered"
                        ${currentStatus === "Delivered" ? "selected" : ""}
                    >
                        Delivered
                    </option>

                    <option
                        value="Cancelled"
                        ${currentStatus === "Cancelled" ? "selected" : ""}
                    >
                        Cancelled
                    </option>

                </select>

            </div>

        </div>


        <!-- CUSTOMER -->

        <div class="admin-customer">

            <h3>
                Customer
            </h3>

            <p>
                <strong>Name:</strong>
                ${customer.firstName || "-"}
                ${customer.lastName || ""}
            </p>

            <p>
                <strong>Email:</strong>
                ${customer.email || "-"}
            </p>

            <p>
                <strong>Phone:</strong>
                ${customer.phone || "-"}
            </p>

            <p>
                <strong>Address:</strong>
                ${customer.address || "-"}
                ${customer.city ? `, ${customer.city}` : ""}
                ${customer.pincode ? ` - ${customer.pincode}` : ""}
            </p>

        </div>


        <!-- PRODUCTS -->

        <div class="admin-products">

            <h3>
                Products
            </h3>

            ${productsHTML}

        </div>


        <!-- FOOTER -->

        <div class="admin-order-footer">

            <div>

                <span>
                    PAYMENT
                </span>

                <strong>
                    ${payment}
                </strong>

            </div>


            <div>

                <span>
                    TOTAL
                </span>

                <strong>
                    ${order.total || "₹0"}
                </strong>

            </div>

        </div>

    `;


    // =========================
    // STATUS EVENT
    // =========================

    const statusSelect =
        orderCard.querySelector(
            ".order-status-select"
        );


    if (statusSelect) {

        statusSelect.addEventListener(
            "change",
            function () {

                changeOrderStatus(
                    this.dataset.order,
                    this.value
                );

            }
        );

    }


    return orderCard;

}


// =========================
// DISPLAY FILTERED ORDERS
// =========================

function displayFilteredOrders(
    filteredOrders
) {

    if (!adminOrders) {
        return;
    }


    adminOrders.innerHTML = "";


    if (filteredOrders.length === 0) {

        adminOrders.innerHTML = `

            <div class="admin-empty">

                <h3>
                    No orders found
                </h3>

                <p>
                    Try another search or status filter.
                </p>

            </div>

        `;

        return;

    }


    filteredOrders
        .slice()
        .reverse()
        .forEach(order => {

            adminOrders.appendChild(
                createOrderCard(order)
            );

        });

}


// =========================
// DISPLAY ORDERS
// =========================

function displayOrders() {

    displayFilteredOrders(orders);

}


// =========================
// SEARCH + FILTER
// =========================

function filterOrders() {

    const searchText =
        orderSearch
            ? orderSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        orderStatusFilter
            ? orderStatusFilter.value
            : "all";


    const filteredOrders =
        orders.filter(order => {

            const customer =
                order.customer || {};


            const customerName =
                `${customer.firstName || ""} ${customer.lastName || ""}`
                    .toLowerCase();


            const email =
                String(
                    customer.email || ""
                ).toLowerCase();


            const phone =
                String(
                    customer.phone || ""
                ).toLowerCase();


            const orderNumber =
                String(
                    order.orderNumber || ""
                ).toLowerCase();


            const status =
                order.status || "Confirmed";


            const matchesSearch =

                orderNumber.includes(searchText) ||

                customerName.includes(searchText) ||

                email.includes(searchText) ||

                phone.includes(searchText);


            const matchesStatus =

                selectedStatus === "all" ||

                status === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    displayFilteredOrders(
        filteredOrders
    );

}


// =========================
// SEARCH EVENT
// =========================

if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        filterOrders
    );

}


// =========================
// STATUS FILTER EVENT
// =========================

if (orderStatusFilter) {

    orderStatusFilter.addEventListener(
        "change",
        filterOrders
    );

}


// =========================
// CLEAR ORDERS
// =========================

if (clearOrders) {

    clearOrders.addEventListener(
        "click",
        () => {

            if (orders.length === 0) {

                alert(
                    "There are no orders to clear."
                );

                return;

            }


            const confirmClear =
                confirm(
                    "Are you sure you want to delete all orders?"
                );


            if (!confirmClear) {
                return;
            }


            orders = [];


            localStorage.removeItem(
                "fashionOrders"
            );


            updateDashboardStats();

            displayOrders();

        }
    );

}


// =========================
// ADMIN LOGOUT
// =========================

if (adminLogout) {

    adminLogout.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "fashionAdminLoggedIn"
            );


            window.location.href =
                "admin-login.html";

        }
    );

}


// =========================
// LOAD DASHBOARD
// =========================

updateDashboardStats();

displayOrders();