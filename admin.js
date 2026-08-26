// =====================================================
// FASHION ADMIN DASHBOARD
// COMPLETE SUPABASE VERSION
// =====================================================

"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // CONFIG
    // =====================================================

    const ADMIN_EMAIL = "admin@fashion.com";

    // =====================================================
    // SUPABASE CHECK
    // =====================================================

    if (typeof supabaseClient === "undefined") {
        alert("Supabase is not connected. Check supabase.js.");
        return;
    }

    // =====================================================
    // STATE
    // =====================================================

    let products = [];
    let orders = [];
    let customers = [];
    let editingProductId = null;

    // =====================================================
    // ELEMENT HELPER
    // =====================================================

    const $ = (id) => document.getElementById(id);

    // =====================================================
    // ELEMENTS
    // =====================================================

    const adminUserInfo = $("adminUserInfo");
    const adminLogout = $("adminLogout");

    const productCount = $("productCount");
    const orderCount = $("orderCount");
    const customerCount = $("customerCount");
    const salesCount = $("salesCount");

    const adminProductList = $("adminProductList");
    const adminOrders = $("adminOrders");
    const customersContainer = $("customersContainer");

    const productSearch = $("productSearch");
    const productCategoryFilter = $("productCategoryFilter");

    const orderSearch = $("orderSearch");
    const orderStatusFilter = $("orderStatusFilter");

    const productModal = $("productModal");
    const productModalTitle = $("productModalTitle");
    const closeProductModal = $("closeProductModal");
    const cancelProductBtn = $("cancelProductBtn");
    const addProductBtn = $("addProductBtn");

    const productForm = $("productForm");

    const productId = $("productId");
    const productName = $("productName");
    const productPrice = $("productPrice");
    const productImage = $("productImage");
    const productCategory = $("productCategory");
    const productDescription = $("productDescription");
    const productSizes = $("productSizes");
    const productStock = $("productStock");
    const productGender = $("productGender");
    const productIsNew = $("productIsNew");

    const saveProductBtn = $("saveProductBtn");
    const toast = $("toast");

    // =====================================================
    // TOAST
    // =====================================================

    function showToast(message) {

        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // =====================================================
    // PRICE
    // =====================================================

    function formatPrice(value) {

        return "₹" + (
            Number(value) || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    // =====================================================
    // DATE
    // =====================================================

    function formatDate(value) {

        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // =====================================================
    // AUTH CHECK
    // =====================================================

    async function checkAdminSession() {

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.getSession();

            if (error) {
                throw error;
            }

            const session = data?.session;

            if (!session || !session.user) {

                window.location.replace("admin-login.html");
                return false;
            }

            const email = String(
                session.user.email || ""
            )
                .trim()
                .toLowerCase();

            if (email !== ADMIN_EMAIL.toLowerCase()) {

                await supabaseClient.auth.signOut();

                alert("Admin access required. Please login as admin.");

                window.location.replace("admin-login.html");

                return false;
            }

            if (adminUserInfo) {
                adminUserInfo.textContent =
                    "Logged in as: " + email;
            }

            return true;

        } catch (error) {

            console.error("Admin session error:", error);

            alert(
                error.message ||
                "Unable to verify admin session."
            );

            window.location.replace("admin-login.html");

            return false;
        }
    }

    // =====================================================
    // LOGOUT
    // =====================================================

    if (adminLogout) {

        adminLogout.addEventListener("click", async function () {

            try {

                await supabaseClient.auth.signOut();

                window.location.replace("admin-login.html");

            } catch (error) {

                console.error("Logout error:", error);

                alert(
                    error.message ||
                    "Unable to logout."
                );
            }

        });
    }

    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    async function loadProducts() {

        if (adminProductList) {

            adminProductList.innerHTML = `
                <div class="loading">
                    Loading products...
                </div>
            `;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("products")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            products = Array.isArray(data)
                ? data
                : [];

            renderProducts();
            updateDashboard();

        } catch (error) {

            console.error("Products error:", error);

            if (adminProductList) {

                adminProductList.innerHTML = `
                    <div class="empty">
                        <strong>Unable to load products</strong>
                        <p>${escapeHTML(error.message)}</p>
                    </div>
                `;
            }
        }
    }

    // =====================================================
    // RENDER PRODUCTS
    // =====================================================

    function renderProducts() {

        if (!adminProductList) {
            return;
        }

        const search = productSearch
            ? productSearch.value.trim().toLowerCase()
            : "";

        const category = productCategoryFilter
            ? productCategoryFilter.value
            : "all";

        const filtered = products.filter(product => {

            const name = String(
                product.name || ""
            ).toLowerCase();

            const productCategory = String(
                product.category || ""
            ).toLowerCase();

            const gender = String(
                product.gender || ""
            ).toLowerCase();

            const matchesSearch =
                !search ||
                name.includes(search) ||
                productCategory.includes(search) ||
                gender.includes(search);

            let matchesCategory = true;

            if (category !== "all") {

                if (category === "new") {

                    matchesCategory =
                        product.is_new === true;

                } else {

                    matchesCategory =
                        productCategory ===
                        category.toLowerCase();
                }
            }

            return matchesSearch && matchesCategory;
        });

        if (!filtered.length) {

            adminProductList.innerHTML = `
                <div class="empty">
                    <strong>No products found</strong>
                    <p>Add a product or change your search.</p>
                </div>
            `;

            return;
        }

        adminProductList.innerHTML = filtered.map(product => {

            const image = product.image || "";

            return `
                <article class="product-card">

                    <div class="product-image">

                        ${
                            image
                            ? `
                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(product.name || "Product")}"
                                >
                            `
                            : `
                                <div style="
                                    height:100%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    color:#999;
                                ">
                                    No Image
                                </div>
                            `
                        }

                    </div>

                    <div class="product-info">

                        <small>
                            ${escapeHTML(
                                product.category ||
                                "Uncategorized"
                            )}
                        </small>

                        <h3>
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </h3>

                        <strong>
                            ${formatPrice(product.price)}
                        </strong>

                        <p>
                            Stock:
                            ${Number(product.stock) || 0}
                        </p>

                        <p>
                            Gender:
                            ${escapeHTML(
                                product.gender || "-"
                            )}
                        </p>

                        <p>
                            Sizes:
                            ${escapeHTML(
                                product.sizes || "-"
                            )}
                        </p>

                        ${
                            product.is_new
                            ? `<span>NEW</span>`
                            : ""
                        }

                    </div>

                    <div class="product-actions">

                        <button
                            type="button"
                            class="primary-btn edit-product"
                            data-id="${escapeHTML(product.id)}"
                        >
                            EDIT
                        </button>

                        <button
                            type="button"
                            class="danger-btn delete-product"
                            data-id="${escapeHTML(product.id)}"
                        >
                            DELETE
                        </button>

                    </div>

                </article>
            `;

        }).join("");

        document.querySelectorAll(".edit-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {
                        openEditProduct(this.dataset.id);
                    }
                );

            });

        document.querySelectorAll(".delete-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {
                        deleteProduct(this.dataset.id);
                    }
                );

            });
    }

    // =====================================================
    // OPEN ADD PRODUCT
    // =====================================================

    function openAddProduct() {

        editingProductId = null;

        if (productModalTitle) {
            productModalTitle.textContent =
                "Add Product";
        }

        if (productForm) {
            productForm.reset();
        }

        if (productId) {
            productId.value = "";
        }

        if (productStock) {
            productStock.value = 0;
        }

        if (productIsNew) {
            productIsNew.checked = false;
        }

        if (productModal) {
            productModal.classList.add("show");
        }

        if (productName) {
            setTimeout(() => productName.focus(), 100);
        }
    }

    // =====================================================
    // OPEN EDIT PRODUCT
    // =====================================================

    function openEditProduct(id) {

        const product = products.find(item =>
            String(item.id) === String(id)
        );

        if (!product) {
            return;
        }

        editingProductId = product.id;

        if (productModalTitle) {
            productModalTitle.textContent =
                "Edit Product";
        }

        if (productId) {
            productId.value = product.id;
        }

        if (productName) {
            productName.value =
                product.name || "";
        }

        if (productPrice) {
            productPrice.value =
                product.price ?? "";
        }

        if (productImage) {
            productImage.value =
                product.image || "";
        }

        if (productCategory) {
            productCategory.value =
                product.category || "";
        }

        if (productDescription) {
            productDescription.value =
                product.description || "";
        }

        if (productSizes) {
            productSizes.value =
                product.sizes || "";
        }

        if (productStock) {
            productStock.value =
                product.stock ?? 0;
        }

        if (productGender) {
            productGender.value =
                product.gender || "";
        }

        if (productIsNew) {
            productIsNew.checked =
                product.is_new === true;
        }

        if (productModal) {
            productModal.classList.add("show");
        }
    }

    // =====================================================
    // CLOSE PRODUCT MODAL
    // =====================================================

    function closeModal() {

        if (productModal) {
            productModal.classList.remove("show");
        }

        editingProductId = null;

        if (productForm) {
            productForm.reset();
        }
    }

    if (addProductBtn) {
        addProductBtn.addEventListener(
            "click",
            openAddProduct
        );
    }

    if (closeProductModal) {
        closeProductModal.addEventListener(
            "click",
            closeModal
        );
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener(
            "click",
            closeModal
        );
    }

    if (productModal) {

        productModal.addEventListener(
            "click",
            function (event) {

                if (event.target === productModal) {
                    closeModal();
                }

            }
        );
    }

    // =====================================================
    // SAVE PRODUCT
    // =====================================================

    async function saveProduct(event) {

        event.preventDefault();

        const name =
            productName?.value.trim() || "";

        const price =
            Number(productPrice?.value);

        const image =
            productImage?.value.trim() || "";

        const category =
            productCategory?.value.trim() || "";

        const description =
            productDescription?.value.trim() || "";

        const sizes =
            productSizes?.value.trim() || "";

        const stock =
            Number(productStock?.value);

        const gender =
            productGender?.value || "";

        const isNew =
            productIsNew?.checked || false;

        if (!name) {
            alert("Please enter product name.");
            return;
        }

        if (!Number.isFinite(price) || price < 0) {
            alert("Please enter a valid price.");
            return;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            alert("Please enter a valid stock quantity.");
            return;
        }

        const productData = {
            name: name,
            price: price,
            image: image,
            category: category,
            description: description,
            sizes: sizes,
            stock: stock,
            gender: gender,
            is_new: isNew
        };

        if (saveProductBtn) {
            saveProductBtn.disabled = true;
            saveProductBtn.textContent = "SAVING...";
        }

        try {

            let result;

            // =================================================
            // UPDATE
            // =================================================

            if (editingProductId !== null) {

                result = await supabaseClient
                    .from("products")
                    .update(productData)
                    .eq("id", editingProductId)
                    .select()
                    .single();

            }

            // =================================================
            // INSERT
            // =================================================

            else {

                result = await supabaseClient
                    .from("products")
                    .insert([productData])
                    .select()
                    .single();
            }

            if (result.error) {
                throw result.error;
            }

            showToast(
                editingProductId !== null
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

            closeModal();

            await loadProducts();

        } catch (error) {

            console.error(
                "Save product error:",
                error
            );

            alert(
                error.message ||
                "Unable to save product."
            );

        } finally {

            if (saveProductBtn) {
                saveProductBtn.disabled = false;
                saveProductBtn.textContent =
                    "SAVE PRODUCT";
            }
        }
    }

    if (productForm) {

        productForm.addEventListener(
            "submit",
            saveProduct
        );
    }

    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async function deleteProduct(id) {

        const product = products.find(item =>
            String(item.id) === String(id)
        );

        if (!product) {
            return;
        }

        const confirmed = confirm(
            `Delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            const {
                error
            } = await supabaseClient
                .from("products")
                .delete()
                .eq("id", id);

            if (error) {
                throw error;
            }

            showToast(
                "Product deleted successfully."
            );

            await loadProducts();

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete product."
            );
        }
    }

    // =====================================================
    // LOAD ORDERS
    // =====================================================

    async function loadOrders() {

        if (adminOrders) {

            adminOrders.innerHTML = `
                <div class="loading">
                    Loading orders...
                </div>
            `;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("orders")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            orders = Array.isArray(data)
                ? data
                : [];

            renderOrders();
            updateDashboard();

        } catch (error) {

            console.error(
                "Orders error:",
                error
            );

            if (adminOrders) {

                adminOrders.innerHTML = `
                    <div class="empty">
                        <strong>
                            Unable to load orders
                        </strong>

                        <p>
                            ${escapeHTML(error.message)}
                        </p>
                    </div>
                `;
            }
        }
    }

    // =====================================================
    // GET ORDER ITEMS
    // =====================================================

    function getOrderItems(order) {

        let items = order?.items;

        if (typeof items === "string") {

            try {
                items = JSON.parse(items);
            } catch {
                items = [];
            }
        }

        return Array.isArray(items)
            ? items
            : [];
    }

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    async function updateOrderStatus(id, status) {

        try {

            const {
                error
            } = await supabaseClient
                .from("orders")
                .update({
                    status: status
                })
                .eq("id", id);

            if (error) {
                throw error;
            }

            const order = orders.find(item =>
                String(item.id) === String(id)
            );

            if (order) {
                order.status = status;
            }

            showToast(
                "Order status updated."
            );

            renderOrders();
            updateDashboard();

        } catch (error) {

            console.error(
                "Order status error:",
                error
            );

            alert(
                error.message ||
                "Unable to update order status."
            );

            await loadOrders();
        }
    }

    // =====================================================
    // RENDER ORDERS
    // =====================================================

    function renderOrders() {

        if (!adminOrders) {
            return;
        }

        const search = orderSearch
            ? orderSearch.value.trim().toLowerCase()
            : "";

        const statusFilter = orderStatusFilter
            ? orderStatusFilter.value
            : "all";

        const filtered = orders.filter(order => {

            const email = String(
                order.customer_email || ""
            ).toLowerCase();

            const name = String(
                order.customer_name || ""
            ).toLowerCase();

            const phone = String(
                order.customer_phone || ""
            ).toLowerCase();

            const id = String(
                order.id || ""
            ).toLowerCase();

            const status =
                order.status || "Confirmed";

            const matchesSearch =
                !search ||
                email.includes(search) ||
                name.includes(search) ||
                phone.includes(search) ||
                id.includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;

            return matchesSearch &&
                matchesStatus;
        });

        if (!filtered.length) {

            adminOrders.innerHTML = `
                <div class="empty">
                    <strong>No orders found</strong>
                    <p>
                        There are no matching orders.
                    </p>
                </div>
            `;

            return;
        }

        adminOrders.innerHTML = filtered.map(order => {

            const items = getOrderItems(order);

            const status =
                order.status || "Confirmed";

            const itemsHTML = items.length

                ? items.map(item => {

                    const quantity =
                        Number(item.quantity) || 1;

                    return `
                        <div class="order-item">

                            ${
                                item.image
                                ? `
                                    <img
                                        src="${escapeHTML(item.image)}"
                                        alt="${escapeHTML(
                                            item.name || "Product"
                                        )}"
                                    >
                                `
                                : ""
                            }

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        item.name ||
                                        "Product"
                                    )}
                                </strong>

                                <p>
                                    Qty: ${quantity}
                                </p>

                                ${
                                    item.size
                                    ? `
                                        <p>
                                            Size:
                                            ${escapeHTML(item.size)}
                                        </p>
                                    `
                                    : ""
                                }

                                ${
                                    item.price !== undefined
                                    ? `
                                        <p>
                                            Price:
                                            ${formatPrice(item.price)}
                                        </p>
                                    `
                                    : ""
                                }

                            </div>

                        </div>
                    `;

                }).join("")

                : `
                    <p>
                        No item details available.
                    </p>
                `;

            return `
                <article class="order-card">

                    <div class="order-header">

                        <div>

                            <h3>
                                Order #${escapeHTML(order.id)}
                            </h3>

                            <small>
                                ${formatDate(order.created_at)}
                            </small>

                        </div>

                        <strong>
                            ${formatPrice(order.total)}
                        </strong>

                    </div>

                    <div class="order-customer">

                        <p>
                            <strong>Name:</strong>
                            ${escapeHTML(
                                order.customer_name || "-"
                            )}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${escapeHTML(
                                order.customer_email || "-"
                            )}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${escapeHTML(
                                order.customer_phone || "-"
                            )}
                        </p>

                        <p>
                            <strong>Address:</strong>
                            ${escapeHTML(
                                order.shipping_address || "-"
                            )}
                        </p>

                    </div>

                    <div class="order-items">

                        <h4>Items</h4>

                        ${itemsHTML}

                    </div>

                    <div class="order-status">

                        <label>
                            Order Status
                        </label>

                        <select
                            class="order-status-select"
                            data-id="${escapeHTML(order.id)}"
                        >

                            <option
                                value="Confirmed"
                                ${status === "Confirmed" ? "selected" : ""}
                            >
                                Confirmed
                            </option>

                            <option
                                value="Processing"
                                ${status === "Processing" ? "selected" : ""}
                            >
                                Processing
                            </option>

                            <option
                                value="Shipped"
                                ${status === "Shipped" ? "selected" : ""}
                            >
                                Shipped
                            </option>

                            <option
                                value="Delivered"
                                ${status === "Delivered" ? "selected" : ""}
                            >
                                Delivered
                            </option>

                            <option
                                value="Cancelled"
                                ${status === "Cancelled" ? "selected" : ""}
                            >
                                Cancelled
                            </option>

                        </select>

                    </div>

                </article>
            `;

        }).join("");

        document.querySelectorAll(
            ".order-status-select"
        ).forEach(select => {

            select.addEventListener(
                "change",
                function () {

                    updateOrderStatus(
                        this.dataset.id,
                        this.value
                    );

                }
            );

        });
    }

    // =====================================================
    // LOAD CUSTOMERS
    // =====================================================

    async function loadCustomers() {

        if (customersContainer) {

            customersContainer.innerHTML = `
                <div class="loading">
                    Loading customers...
                </div>
            `;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("profiles")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            customers = Array.isArray(data)
                ? data
                : [];

            renderCustomers();
            updateDashboard();

        } catch (error) {

            console.error(
                "Customers error:",
                error
            );

            if (customersContainer) {

                customersContainer.innerHTML = `
                    <div class="empty">
                        <strong>
                            Unable to load customers
                        </strong>

                        <p>
                            ${escapeHTML(error.message)}
                        </p>
                    </div>
                `;
            }
        }
    }

    // =====================================================
    // RENDER CUSTOMERS
    // =====================================================

    function renderCustomers() {

        if (!customersContainer) {
            return;
        }

        if (!customers.length) {

            customersContainer.innerHTML = `
                <div class="empty">
                    <strong>No customers found</strong>
                    <p>
                        No customer profiles are available.
                    </p>
                </div>
            `;

            return;
        }

        customersContainer.innerHTML =
            customers.map(customer => {

                return `
                    <article class="customer-card">

                        <div class="customer-info">

                            <h3>
                                ${escapeHTML(
                                    customer.name || "Unnamed Customer"
                                )}
                            </h3>

                            <p>
                                <strong>Email:</strong>
                                ${escapeHTML(
                                    customer.email || "-"
                                )}
                            </p>

                            <p>
                                <strong>Phone:</strong>
                                ${escapeHTML(
                                    customer.phone || "-"
                                )}
                            </p>

                            <p>
                                <strong>Address:</strong>
                                ${escapeHTML(
                                    customer.address || "-"
                                )}
                            </p>

                            <p>
                                <strong>City:</strong>
                                ${escapeHTML(
                                    customer.city || "-"
                                )}
                            </p>

                            <p>
                                <strong>Pincode:</strong>
                                ${escapeHTML(
                                    customer.pincode || "-"
                                )}
                            </p>

                            <small>
                                Joined:
                                ${formatDate(customer.created_at)}
                            </small>

                        </div>

                    </article>
                `;

            }).join("");
    }

    // =====================================================
    // UPDATE DASHBOARD
    // =====================================================

    function updateDashboard() {

        if (productCount) {
            productCount.textContent =
                products.length;
        }

        if (orderCount) {
            orderCount.textContent =
                orders.length;
        }

        if (customerCount) {
            customerCount.textContent =
                customers.length;
        }

        const totalSales = orders.reduce(
            (sum, order) => {

                const status =
                    String(
                        order.status || "Confirmed"
                    ).toLowerCase();

                if (status === "cancelled") {
                    return sum;
                }

                return sum +
                    (Number(order.total) || 0);

            },
            0
        );

        if (salesCount) {
            salesCount.textContent =
                formatPrice(totalSales);
        }
    }

    // =====================================================
    // SEARCH EVENTS
    // =====================================================

    if (productSearch) {

        productSearch.addEventListener(
            "input",
            renderProducts
        );
    }

    if (productCategoryFilter) {

        productCategoryFilter.addEventListener(
            "change",
            renderProducts
        );
    }

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            renderOrders
        );
    }

    if (orderStatusFilter) {

        orderStatusFilter.addEventListener(
            "change",
            renderOrders
        );
    }

    // =====================================================
    // ESC KEY CLOSE MODAL
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                if (
                    productModal &&
                    productModal.classList.contains("show")
                ) {
                    closeModal();
                }
            }
        }
    );

    // =====================================================
    // START DASHBOARD
    // =====================================================

    try {

        const isAdmin =
            await checkAdminSession();

        if (!isAdmin) {
            return;
        }

        await Promise.all([
            loadProducts(),
            loadOrders(),
            loadCustomers()
        ]);

        updateDashboard();

        console.log(
            "FASHION Admin Dashboard loaded successfully."
        );

    } catch (error) {

        console.error(
            "Admin dashboard startup error:",
            error
        );

        alert(
            error.message ||
            "Unable to load admin dashboard."
        );
    }

});