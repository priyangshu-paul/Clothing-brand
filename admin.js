// ============================================================
// FASHION ADMIN DASHBOARD
// COMPLETE + STABLE SUPABASE ADMIN.JS
// ============================================================
"use strict";

console.log("ADMIN.JS FILE LOADED");

document.addEventListener("DOMContentLoaded", async () => {

    console.log("DOM LOADED");
    // ============================================================
    // CONFIGURATION
    // ============================================================

    const ADMIN_EMAIL = "admin@fashion.com";

    const LOW_STOCK_LIMIT = 5;

    const PRODUCT_TABLE = "products";
    const ORDER_TABLE = "orders";
    const CUSTOMER_TABLE = "profiles";
    const REVIEW_TABLE = "reviews";

    let products = [];
    let orders = [];
    let customers = [];
    let reviews = [];

    let selectedProduct = null;
    let selectedOrder = null;
    let selectedCustomer = null;

    let salesPeriod = 7;

    // ============================================================
    // HELPERS
    // ============================================================

    const $ = id => document.getElementById(id);

    function safeNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        const number = Number(
            String(value)
                .replace(/[₹,\s]/g, "")
                .replace(/[^\d.-]/g, "")
        );

        return Number.isFinite(number) ? number : 0;
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatPrice(value) {

        return "₹" + safeNumber(value).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function formatDate(value) {

        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getOrderDate(order) {

        return (
            order.created_at ||
            order.createdAt ||
            order.order_date ||
            order.orderDate ||
            order.date ||
            order.updated_at ||
            ""
        );
    }

    function getOrderAmount(order) {

        return safeNumber(
            order.total ??
            order.amount ??
            order.total_amount ??
            order.order_total ??
            order.grand_total ??
            order.price ??
            0
        );
    }

    function getOrderStatus(order) {

        const raw =
            order.status ||
            order.order_status ||
            order.payment_status ||
            "Confirmed";

        const normalized =
            String(raw)
                .trim()
                .toLowerCase();

        const map = {

            confirmed: "Confirmed",
            pending: "Confirmed",
            processing: "Processing",
            shipped: "Shipped",
            delivered: "Delivered",
            cancelled: "Cancelled",
            canceled: "Cancelled",
            returned: "Returned",
            refunded: "Returned"

        };

        return map[normalized] || raw || "Confirmed";
    }

    function getCustomerName(customer) {

        return (
            customer.name ||
            customer.customer_name ||
            customer.full_name ||
            customer.fullName ||
            "Customer"
        );
    }

    function getCustomerEmail(customer) {

        return (
            customer.email ||
            customer.customer_email ||
            "-"
        );
    }

    function getCustomerPhone(customer) {

        return (
            customer.phone ||
            customer.customer_phone ||
            customer.mobile ||
            "-"
        );
    }

    function getProductName(product) {

        return (
            product.name ||
            product.product_name ||
            "Product"
        );
    }

    function getProductImage(product) {

        return (
            product.image ||
            product.image_url ||
            product.product_image ||
            "product1.jpg"
        );
    }

    function getProductStock(product) {

        return safeNumber(
            product.stock ??
            product.quantity ??
            product.inventory ??
            0
        );
    }

    function getProductPrice(product) {

        return safeNumber(
            product.price ??
            product.sale_price ??
            0
        );
    }

    function setText(id, value) {

        const element = $(id);

        if (element) {
            element.textContent = value;
        }
    }

    function showToast(message, type = "success") {

        let toast = $("adminToast");

        if (!toast) {

            toast = document.createElement("div");

            toast.id = "adminToast";

            Object.assign(toast.style, {

                position: "fixed",
                right: "24px",
                bottom: "24px",
                zIndex: "99999",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#111",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 15px 40px rgba(0,0,0,.25)",
                maxWidth: "360px",
                opacity: "0",
                transform: "translateY(15px)",
                transition: "all .25s ease"

            });

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        if (type === "error") {

            toast.style.background = "#b42318";

        } else if (type === "warning") {

            toast.style.background = "#b54708";

        } else {

            toast.style.background = "#111";
        }

        requestAnimationFrame(() => {

            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";

        });

        clearTimeout(toast._timer);

        toast._timer = setTimeout(() => {

            toast.style.opacity = "0";
            toast.style.transform = "translateY(15px)";

        }, 3000);
    }

    // ============================================================
    // SUPABASE CHECK
    // ============================================================

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "supabaseClient is not defined."
        );

        showToast(
            "Supabase is not connected. Check your Supabase configuration.",
            "error"
        );

        return;
    }

    // ============================================================
    // LOADING SCREEN
    // ============================================================

    function hideLoadingScreen() {

        [
            $("loadingScreen"),
            $("adminLoading"),
            $("dashboardLoading")
        ].forEach(loader => {

            if (!loader) return;

            loader.classList.add("hidden");
            loader.style.display = "none";

        });
    }

    // ============================================================
    // AUTHENTICATION
    // ============================================================

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

            if (!session?.user) {

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            const email =
                session.user.email || "";

            if (
                email.toLowerCase() !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                await supabaseClient.auth.signOut();

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            return true;

        } catch (error) {

            console.error(
                "Admin session error:",
                error
            );

            window.location.replace(
                "admin-login.html"
            );

            return false;
        }
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    function setupLogout() {

        document
            .querySelectorAll(
                "#logoutBtn, .logout-btn, [data-action='logout']"
            )
            .forEach(button => {

                if (button.dataset.bound) return;

                button.dataset.bound = "true";

                button.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();

                        try {

                            await supabaseClient.auth.signOut();

                        } catch (error) {

                            console.error(
                                "Logout error:",
                                error
                            );
                        }

                        window.location.replace(
                            "admin-login.html"
                        );
                    }
                );
            });
    }

    // ============================================================
    // NAVIGATION
    // ============================================================

    function openSection(sectionName) {

        document
            .querySelectorAll(
                "[data-section], .admin-section"
            )
            .forEach(section => {

                const sectionId =
                    section.dataset.section ||
                    section.id;

                if (
                    sectionId === sectionName ||
                    sectionId ===
                    `${sectionName}Section`
                ) {

                    section.classList.add("active");
                    section.style.display = "";

                } else if (
                    section.classList.contains("admin-section")
                ) {

                    section.classList.remove("active");
                    section.style.display = "none";
                }
            });

        document
            .querySelectorAll(
                "[data-section-target]"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.sectionTarget ===
                    sectionName
                );
            });

        document
            .querySelectorAll(
                "[data-section-link]"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.sectionLink ===
                    sectionName
                );
            });

        closeMobileSidebar();
    }

    function setupNavigation() {

        document
            .querySelectorAll(
                "[data-section-target], [data-section-link]"
            )
            .forEach(button => {

                if (button.dataset.navBound) return;

                button.dataset.navBound = "true";

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        const section =
                            button.dataset.sectionTarget ||
                            button.dataset.sectionLink;

                        if (section) {
                            openSection(section);
                        }
                    }
                );
            });
    }

    // ============================================================
    // MOBILE SIDEBAR
    // ============================================================

    function closeMobileSidebar() {

        const sidebar =
            $("sidebar") ||
            $("adminSidebar") ||
            document.querySelector(".sidebar");

        const overlay =
            $("sidebarOverlay") ||
            $("mobileOverlay");

        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
    }

    function setupMobileSidebar() {

        const toggle =
            $("mobileMenuBtn") ||
            $("menuToggle") ||
            $("sidebarToggle");

        const sidebar =
            $("sidebar") ||
            $("adminSidebar") ||
            document.querySelector(".sidebar");

        const overlay =
            $("sidebarOverlay") ||
            $("mobileOverlay");

        if (!toggle || !sidebar) return;

        if (!toggle.dataset.bound) {

            toggle.dataset.bound = "true";

            toggle.addEventListener(
                "click",
                () => {

                    sidebar.classList.toggle("open");

                    overlay?.classList.toggle(
                        "show"
                    );
                }
            );
        }

        overlay?.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    // ============================================================
    // PRODUCTS
    // ============================================================

    async function loadProducts() {

        const container =
            $("productsContainer");

        if (container) {

            container.innerHTML =
                `<div class="loading">Loading products...</div>`;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(PRODUCT_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            products =
                Array.isArray(data)
                    ? data
                    : [];

            renderProducts();
            renderInventory();
            updateDashboard();

        } catch (error) {

            console.error(
                "Products loading error:",
                error
            );

            products = [];

            if (container) {

                container.innerHTML =
                    `<div class="empty">
                        <strong>Unable to load products</strong>
                        <p>${escapeHTML(
                            error.message ||
                            "Supabase products error."
                        )}</p>
                    </div>`;
            }

            showToast(
                "Products could not be loaded.",
                "error"
            );
        }
    }

    function getFilteredProducts() {

        const search =
            $("productSearch")
                ?.value
                ?.trim()
                ?.toLowerCase() || "";

        const category =
            $("productCategoryFilter")
                ?.value || "all";

        const sort =
            $("productSort")
                ?.value || "newest";

        let result =
            products.filter(product => {

                const name =
                    getProductName(product)
                        .toLowerCase();

                const productCategory =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const gender =
                    String(
                        product.gender || ""
                    ).toLowerCase();

                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    productCategory.includes(search) ||
                    gender.includes(search);

                const matchesCategory =
                    category === "all" ||
                    productCategory ===
                    category.toLowerCase();

                return (
                    matchesSearch &&
                    matchesCategory
                );
            });

        result.sort((a, b) => {

            if (sort === "name_asc") {

                return getProductName(a)
                    .localeCompare(
                        getProductName(b)
                    );
            }

            if (sort === "name_desc") {

                return getProductName(b)
                    .localeCompare(
                        getProductName(a)
                    );
            }

            if (sort === "price_low") {

                return (
                    getProductPrice(a) -
                    getProductPrice(b)
                );
            }

            if (sort === "price_high") {

                return (
                    getProductPrice(b) -
                    getProductPrice(a)
                );
            }

            if (sort === "stock_low") {

                return (
                    getProductStock(a) -
                    getProductStock(b)
                );
            }

            if (sort === "stock_high") {

                return (
                    getProductStock(b) -
                    getProductStock(a)
                );
            }

            return (
                new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                )
            );
        });

        return result;
    }

    function renderProducts() {

        const container =
            $("productsContainer");

        if (!container) return;

        const filtered =
            getFilteredProducts();

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No products found</strong>
                    <p>Add a product or change your search/filter.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(product => {

                const stock =
                    getProductStock(product);

                let stockClass = "healthy";
                let stockText = "In Stock";

                if (stock <= 0) {

                    stockClass = "out";
                    stockText = "Out of Stock";

                } else if (
                    stock <= LOW_STOCK_LIMIT
                ) {

                    stockClass = "low";
                    stockText = "Low Stock";
                }

                const sizes =
                    Array.isArray(product.sizes)
                        ? product.sizes.join(", ")
                        : String(
                            product.sizes || "-"
                        );

                return `
                    <article
                        class="product-admin-card"
                        data-product-id="${escapeHTML(product.id)}"
                    >

                        <div class="product-admin-image">

                            <img
                                src="${escapeHTML(
                                    getProductImage(product)
                                )}"
                                alt="${escapeHTML(
                                    getProductName(product)
                                )}"
                                loading="lazy"
                                onerror="this.src='product1.jpg'"
                            >

                        </div>

                        <div class="product-admin-info">

                            <span class="product-category">
                                ${escapeHTML(
                                    product.category ||
                                    "Fashion"
                                )}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    getProductName(product)
                                )}
                            </h3>

                            <p>
                                ${formatPrice(
                                    getProductPrice(product)
                                )}
                            </p>

                            <small>
                                ${escapeHTML(
                                    product.gender ||
                                    "Unisex"
                                )}
                                · Sizes:
                                ${escapeHTML(sizes)}
                            </small>

                        </div>

                        <div class="product-admin-stock">

                            <strong>
                                ${stock}
                            </strong>

                            <span>
                                units
                            </span>

                            <em class="${stockClass}">
                                ${stockText}
                            </em>

                        </div>

                        <div class="product-admin-actions">

                            <button
                                type="button"
                                class="secondary-btn edit-product"
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

        bindProductActions();
    }

    function bindProductActions() {

        document
            .querySelectorAll(".edit-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {
                        openEditProduct(
                            button.dataset.id
                        );
                    }
                );
            });

        document
            .querySelectorAll(".delete-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {
                        deleteProduct(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    // ============================================================
    // PRODUCT MODAL
    // ============================================================

    const productModal =
        $("productModal");

    const productModalContent =
        $("productModalContent");

    function getProductFormHTML(product = null) {

        const editing =
            Boolean(product);

        const sizes =
            Array.isArray(product?.sizes)
                ? product.sizes.join(", ")
                : String(
                    product?.sizes ||
                    "S, M, L, XL, XXL"
                );

        return `
            <form id="adminProductForm">

                <div class="form-grid">

                    <label>

                        <span>Product Name</span>

                        <input
                            id="adminProductName"
                            name="name"
                            type="text"
                            required
                            value="${escapeHTML(
                                product?.name || ""
                            )}"
                            placeholder="Classic Oversized Tee"
                        >

                    </label>

                    <label>

                        <span>Price</span>

                        <input
                            id="adminProductPrice"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value="${escapeHTML(
                                product?.price ?? ""
                            )}"
                            placeholder="1499"
                        >

                    </label>

                    <label>

                        <span>Category</span>

                        <input
                            id="adminProductCategory"
                            name="category"
                            type="text"
                            value="${escapeHTML(
                                product?.category || ""
                            )}"
                            placeholder="T-Shirts"
                        >

                    </label>

                    <label>

                        <span>Gender</span>

                        <select
                            id="adminProductGender"
                            name="gender"
                        >

                            <option value="Unisex"
                                ${
                                    !product?.gender ||
                                    product?.gender === "Unisex"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Unisex
                            </option>

                            <option value="Men"
                                ${
                                    product?.gender === "Men"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Men
                            </option>

                            <option value="Women"
                                ${
                                    product?.gender === "Women"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Women
                            </option>

                        </select>

                    </label>

                    <label>

                        <span>Stock</span>

                        <input
                            id="adminProductStock"
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            value="${escapeHTML(
                                product?.stock ?? 0
                            )}"
                        >

                    </label>

                    <label>

                        <span>Sizes</span>

                        <input
                            id="adminProductSizes"
                            name="sizes"
                            type="text"
                            value="${escapeHTML(sizes)}"
                            placeholder="S, M, L, XL"
                        >

                    </label>

                    <label class="full">

                        <span>Image URL</span>

                        <input
                            id="adminProductImage"
                            name="image"
                            type="url"
                            value="${escapeHTML(
                                product
                                    ? getProductImage(product)
                                    : ""
                            )}"
                            placeholder="https://..."
                        >

                    </label>

                    <label class="full">

                        <span>Description</span>

                        <textarea
                            id="adminProductDescription"
                            name="description"
                            rows="5"
                            placeholder="Product description..."
                        >${escapeHTML(
                            product?.description || ""
                        )}</textarea>

                    </label>

                    <label class="checkbox-field">

                        <input
                            id="adminProductIsNew"
                            name="is_new"
                            type="checkbox"
                            ${
                                product?.is_new === true ||
                                product?.isNew === true
                                    ? "checked"
                                    : ""
                            }
                        >

                        <span>
                            Mark as New Arrival
                        </span>

                    </label>

                </div>

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="cancelProductForm"
                    >
                        CANCEL
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        ${
                            editing
                                ? "UPDATE PRODUCT"
                                : "ADD PRODUCT"
                        }
                    </button>

                </div>

            </form>
        `;
    }

    function openProductModal(product = null) {

        selectedProduct =
            product || null;

        if (!productModalContent) return;

        productModalContent.innerHTML =
            getProductFormHTML(product);

        if (productModal) {

            productModal.classList.add("show");
            productModal.style.display = "flex";
        }

        $("adminProductForm")
            ?.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    await saveProduct();
                }
            );

        $("cancelProductForm")
            ?.addEventListener(
                "click",
                closeProductModal
            );
    }

    function openAddProduct() {

        openProductModal(null);
    }

    function openEditProduct(id) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!product) {

            showToast(
                "Product not found.",
                "error"
            );

            return;
        }

        openProductModal(product);
    }

    async function saveProduct() {

        const name =
            $("adminProductName")
                ?.value
                ?.trim();

        const price =
            safeNumber(
                $("adminProductPrice")?.value
            );

        const category =
            $("adminProductCategory")
                ?.value
                ?.trim() ||
            "Fashion";

        const gender =
            $("adminProductGender")
                ?.value
                ?.trim() ||
            "Unisex";

        const stock =
            safeNumber(
                $("adminProductStock")?.value
            );

        const sizes =
            $("adminProductSizes")
                ?.value
                ?.split(",")
                .map(value => value.trim())
                .filter(Boolean) || [];

        const image =
            $("adminProductImage")
                ?.value
                ?.trim() ||
            "product1.jpg";

        const description =
            $("adminProductDescription")
                ?.value
                ?.trim() || "";

        const isNew =
            Boolean(
                $("adminProductIsNew")?.checked
            );

        if (!name) {

            showToast(
                "Product name is required.",
                "error"
            );

            return;
        }

        const payload = {

            name,
            price,
            category,
            gender,
            stock,
            sizes,
            image,
            description,
            is_new: isNew,
            isNew

        };

        try {

            let result;

            if (selectedProduct) {

                result =
                    await supabaseClient
                        .from(PRODUCT_TABLE)
                        .update(payload)
                        .eq(
                            "id",
                            selectedProduct.id
                        );

            } else {

                result =
                    await supabaseClient
                        .from(PRODUCT_TABLE)
                        .insert(payload);
            }

            if (result.error) {
                throw result.error;
            }

            const wasEditing =
                Boolean(selectedProduct);

            closeProductModal();

            await loadProducts();

            showToast(
                wasEditing
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

        } catch (error) {

            console.error(
                "Product save error:",
                error
            );

            showToast(
                error.message ||
                "Unable to save product.",
                "error"
            );
        }
    }

    async function deleteProduct(id) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!product) return;

        const confirmed =
            window.confirm(
                `Delete "${getProductName(product)}"?\n\nThis action cannot be undone.`
            );

        if (!confirmed) return;

        try {

            const {
                error
            } = await supabaseClient
                .from(PRODUCT_TABLE)
                .delete()
                .eq("id", id);

            if (error) {
                throw error;
            }

            products =
                products.filter(
                    item =>
                        String(item.id) !==
                        String(id)
                );

            renderProducts();
            renderInventory();
            updateDashboard();

            showToast(
                "Product deleted successfully."
            );

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            showToast(
                error.message ||
                "Unable to delete product.",
                "error"
            );
        }
    }

    function closeProductModal() {

        productModal?.classList.remove(
            "show"
        );

        if (productModal) {
            productModal.style.display = "";
        }

        selectedProduct = null;
    }

    // ============================================================
    // PRODUCT BUTTONS
    // ============================================================

    function setupProductButtons() {

        document
            .querySelectorAll(
                "#addProductBtn, #addProduct, .add-product-btn"
            )
            .forEach(button => {

                if (button.dataset.bound) return;

                button.dataset.bound = "true";

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        openAddProduct();
                    }
                );
            });
    }

    // ============================================================
    // PRODUCT FILTER EVENTS
    // ============================================================

    function setupProductFilters() {

        [
            "productSearch",
            "productCategoryFilter",
            "productSort"
        ].forEach(id => {

            $(id)?.addEventListener(
                "input",
                renderProducts
            );

            $(id)?.addEventListener(
                "change",
                renderProducts
            );
        });
    }

    // ============================================================
    // ORDERS
    // ============================================================

    async function loadOrders() {

        const container =
            $("ordersContainer");

        if (container) {

            container.innerHTML =
                `<div class="loading">Loading orders...</div>`;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(ORDER_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            orders =
                Array.isArray(data)
                    ? data
                    : [];

            renderOrders();
            renderPayments();
            updateDashboard();

        } catch (error) {

            console.error(
                "Orders loading error:",
                error
            );

            orders = [];

            if (container) {

                container.innerHTML =
                    `<div class="empty">
                        <strong>Unable to load orders</strong>
                        <p>${escapeHTML(
                            error.message || ""
                        )}</p>
                    </div>`;
            }

            showToast(
                "Orders could not be loaded.",
                "error"
            );
        }
    }

    function sortOrders(list) {

        const sort =
            $("orderSort")
                ?.value || "newest";

        const result = [...list];

        result.sort((a, b) => {

            if (sort === "oldest") {

                return (
                    new Date(
                        getOrderDate(a) || 0
                    ) -
                    new Date(
                        getOrderDate(b) || 0
                    )
                );
            }

            if (sort === "amount_high") {

                return (
                    getOrderAmount(b) -
                    getOrderAmount(a)
                );
            }

            if (sort === "amount_low") {

                return (
                    getOrderAmount(a) -
                    getOrderAmount(b)
                );
            }

            return (
                new Date(
                    getOrderDate(b) || 0
                ) -
                new Date(
                    getOrderDate(a) || 0
                )
            );
        });

        return result;
    }

    function renderOrders() {

        const container =
            $("ordersContainer");

        if (!container) return;

        const search =
            $("orderSearch")
                ?.value
                ?.trim()
                ?.toLowerCase() || "";

        const statusFilter =
            $("orderStatusFilter")
                ?.value || "all";

        let filtered =
            orders.filter(order => {

                const customer =
                    String(
                        order.customer_name ||
                        order.name ||
                        order.full_name ||
                        ""
                    ).toLowerCase();

                const email =
                    String(
                        order.customer_email ||
                        order.email ||
                        ""
                    ).toLowerCase();

                const id =
                    String(
                        order.id || ""
                    ).toLowerCase();

                const status =
                    getOrderStatus(order);

                const searchMatch =
                    !search ||
                    customer.includes(search) ||
                    email.includes(search) ||
                    id.includes(search);

                const statusMatch =
                    statusFilter === "all" ||
                    status.toLowerCase() ===
                    statusFilter.toLowerCase();

                return (
                    searchMatch &&
                    statusMatch
                );
            });

        filtered =
            sortOrders(filtered);

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No orders found</strong>
                    <p>Orders will appear here after customers place orders.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(order => {

                const status =
                    getOrderStatus(order);

                return `
                    <article
                        class="order-row"
                        data-order-id="${escapeHTML(order.id)}"
                    >

                        <div>

                            <strong>
                                #${escapeHTML(order.id)}
                            </strong>

                            <span>
                                ${formatDate(
                                    getOrderDate(order)
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    order.customer_name ||
                                    order.name ||
                                    order.full_name ||
                                    "Customer"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    order.customer_email ||
                                    order.email ||
                                    "-"
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatPrice(
                                    getOrderAmount(order)
                                )}
                            </strong>

                        </div>

                        <div>

                            <span
                                class="status ${status
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}"
                            >
                                ${escapeHTML(status)}
                            </span>

                        </div>

                        <div>

                            <button
                                type="button"
                                class="primary-btn view-order"
                                data-id="${escapeHTML(order.id)}"
                            >
                                VIEW
                            </button>

                        </div>

                    </article>
                `;

            }).join("");

        document
            .querySelectorAll(".view-order")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openOrderModal(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    async function updateOrderStatus(
        order,
        status
    ) {

        try {

            const {
                error
            } = await supabaseClient
                .from(ORDER_TABLE)
                .update({
                    status
                })
                .eq(
                    "id",
                    order.id
                );

            if (error) {
                throw error;
            }

            order.status = status;

            renderOrders();
            renderPayments();
            updateDashboard();

            showToast(
                "Order status updated."
            );

        } catch (error) {

            console.error(
                "Order status update error:",
                error
            );

            showToast(
                error.message ||
                "Unable to update order.",
                "error"
            );
        }
    }

    // ============================================================
    // ORDER MODAL
    // ============================================================

    const orderModal =
        $("orderModal");

    const orderModalContent =
        $("orderModalContent");

    function openOrderModal(id) {

        const order =
            orders.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!order) return;

        selectedOrder =
            order;

        const customerName =
            order.customer_name ||
            order.name ||
            order.full_name ||
            "Customer";

        const email =
            order.customer_email ||
            order.email ||
            "-";

        const phone =
            order.customer_phone ||
            order.phone ||
            "-";

        const address =
            order.address ||
            order.shipping_address ||
            order.customer_address ||
            "-";

        let items =
            order.items ||
            order.products ||
            order.order_items ||
            [];

        if (typeof items === "string") {

            try {

                items = JSON.parse(items);

            } catch {

                // Keep string.
            }
        }

        let itemsHTML = "";

        if (Array.isArray(items)) {

            itemsHTML =
                items.map(item => {

                    const name =
                        item.name ||
                        item.product_name ||
                        "Product";

                    const quantity =
                        safeNumber(
                            item.quantity ||
                            item.qty ||
                            1
                        );

                    const price =
                        safeNumber(
                            item.price ||
                            item.unit_price ||
                            0
                        );

                    return `
                        <div class="order-item-row">

                            <span>
                                ${escapeHTML(name)}
                            </span>

                            <span>
                                × ${quantity}
                            </span>

                            <strong>
                                ${formatPrice(
                                    price * quantity
                                )}
                            </strong>

                        </div>
                    `;

                }).join("");

        } else if (items) {

            itemsHTML =
                `<p>${escapeHTML(items)}</p>`;

        } else {

            itemsHTML =
                `<p>No item details available.</p>`;
        }

        const status =
            getOrderStatus(order);

        if (orderModalContent) {

            orderModalContent.innerHTML = `

                <div class="order-detail-grid">

                    <div>
                        <strong>Order ID</strong>
                        <span>
                            #${escapeHTML(order.id)}
                        </span>
                    </div>

                    <div>
                        <strong>Date</strong>
                        <span>
                            ${formatDate(
                                getOrderDate(order)
                            )}
                        </span>
                    </div>

                    <div>
                        <strong>Customer</strong>
                        <span>
                            ${escapeHTML(customerName)}
                        </span>
                    </div>

                    <div>
                        <strong>Email</strong>
                        <span>
                            ${escapeHTML(email)}
                        </span>
                    </div>

                    <div>
                        <strong>Phone</strong>
                        <span>
                            ${escapeHTML(phone)}
                        </span>
                    </div>

                    <div>

                        <strong>Status</strong>

                        <select
                            id="orderStatusUpdate"
                        >

                            ${
                                [
                                    "Confirmed",
                                    "Processing",
                                    "Shipped",
                                    "Delivered",
                                    "Cancelled",
                                    "Returned"
                                ]
                                .map(value => `
                                    <option
                                        value="${value}"
                                        ${
                                            value === status
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${value}
                                    </option>
                                `)
                                .join("")
                            }

                        </select>

                    </div>

                </div>

                <div class="order-address">

                    <strong>
                        Shipping Address
                    </strong>

                    <p>
                        ${escapeHTML(address)}
                    </p>

                </div>

                <div class="order-items">

                    <h3>
                        Order Items
                    </h3>

                    ${itemsHTML}

                </div>

                <div class="order-total">

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatPrice(
                            getOrderAmount(order)
                        )}
                    </strong>

                </div>
            `;
        }

        $("orderStatusUpdate")
            ?.addEventListener(
                "change",
                event => {

                    updateOrderStatus(
                        order,
                        event.target.value
                    );
                }
            );

        if (orderModal) {

            orderModal.classList.add("show");
            orderModal.style.display = "flex";
        }
    }

    function closeOrderModal() {

        orderModal?.classList.remove(
            "show"
        );

        if (orderModal) {
            orderModal.style.display = "";
        }

        selectedOrder = null;
    }

    // ============================================================
    // ORDER FILTER EVENTS
    // ============================================================

    function setupOrderFilters() {

        [
            "orderSearch",
            "orderStatusFilter",
            "orderSort"
        ].forEach(id => {

            $(id)?.addEventListener(
                "input",
                renderOrders
            );

            $(id)?.addEventListener(
                "change",
                renderOrders
            );
        });
    }

    // ============================================================
    // PRINT INVOICE
    // ============================================================

    function setupPrintInvoice() {

        $("printInvoiceBtn")
            ?.addEventListener(
                "click",
                () => {

                    if (!selectedOrder) {

                        showToast(
                            "Open an order first.",
                            "warning"
                        );

                        return;
                    }

                    const order =
                        selectedOrder;

                    let items =
                        order.items ||
                        order.products ||
                        order.order_items ||
                        [];

                    if (typeof items === "string") {

                        try {
                            items = JSON.parse(items);
                        } catch {
                            items = [];
                        }
                    }

                    if (!Array.isArray(items)) {
                        items = [];
                    }

                    const rows =
                        items.map(item => {

                            const quantity =
                                safeNumber(
                                    item.quantity ||
                                    item.qty ||
                                    1
                                );

                            const price =
                                safeNumber(
                                    item.price ||
                                    item.unit_price ||
                                    0
                                );

                            return `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            item.name ||
                                            item.product_name ||
                                            "Product"
                                        )}
                                    </td>

                                    <td>
                                        ${quantity}
                                    </td>

                                    <td>
                                        ${formatPrice(price)}
                                    </td>

                                    <td>
                                        ${formatPrice(
                                            price * quantity
                                        )}
                                    </td>

                                </tr>
                            `;

                        }).join("");

                    const invoiceWindow =
                        window.open(
                            "",
                            "_blank",
                            "width=900,height=800"
                        );

                    if (!invoiceWindow) {

                        showToast(
                            "Please allow popups to print invoice.",
                            "error"
                        );

                        return;
                    }

                    invoiceWindow.document.write(`

                        <!DOCTYPE html>

                        <html>

                        <head>

                            <meta charset="UTF-8">

                            <title>
                                FASHION Invoice #${escapeHTML(order.id)}
                            </title>

                            <style>

                                * {
                                    box-sizing: border-box;
                                }

                                body {
                                    margin: 0;
                                    padding: 40px;
                                    font-family: Arial, sans-serif;
                                    color: #111;
                                }

                                .invoice {
                                    max-width: 850px;
                                    margin: auto;
                                }

                                .header {
                                    display: flex;
                                    justify-content: space-between;
                                    gap: 30px;
                                    padding-bottom: 25px;
                                    border-bottom: 2px solid #111;
                                }

                                h1 {
                                    margin: 0 0 5px;
                                    font-size: 32px;
                                    letter-spacing: 2px;
                                }

                                .muted {
                                    color: #666;
                                }

                                .box {
                                    margin-top: 25px;
                                    padding: 20px;
                                    border: 1px solid #ddd;
                                    border-radius: 8px;
                                }

                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin-top: 20px;
                                }

                                th,
                                td {
                                    padding: 12px;
                                    border-bottom: 1px solid #ddd;
                                    text-align: left;
                                }

                                th {
                                    background: #f5f5f5;
                                }

                                .total {
                                    margin-top: 30px;
                                    text-align: right;
                                    font-size: 24px;
                                    font-weight: bold;
                                }

                                .footer {
                                    margin-top: 60px;
                                    padding-top: 20px;
                                    border-top: 1px solid #ddd;
                                    text-align: center;
                                    color: #777;
                                    font-size: 13px;
                                }

                            </style>

                        </head>

                        <body>

                            <div class="invoice">

                                <div class="header">

                                    <div>

                                        <h1>
                                            FASHION
                                        </h1>

                                        <div class="muted">
                                            Official Invoice
                                        </div>

                                    </div>

                                    <div>

                                        <strong>
                                            Order #${escapeHTML(order.id)}
                                        </strong>

                                        <div class="muted">
                                            ${formatDate(
                                                getOrderDate(order)
                                            )}
                                        </div>

                                    </div>

                                </div>

                                <div class="box">

                                    <strong>
                                        Customer
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            order.customer_name ||
                                            order.name ||
                                            order.full_name ||
                                            "Customer"
                                        )}
                                    </p>

                                    <p>
                                        ${escapeHTML(
                                            order.customer_email ||
                                            order.email ||
                                            "-"
                                        )}
                                    </p>

                                    <p>
                                        ${escapeHTML(
                                            order.customer_phone ||
                                            order.phone ||
                                            "-"
                                        )}
                                    </p>

                                    <p>
                                        ${escapeHTML(
                                            order.address ||
                                            order.shipping_address ||
                                            "-"
                                        )}
                                    </p>

                                </div>

                                <div class="box">

                                    <strong>
                                        Status:
                                    </strong>

                                    ${escapeHTML(
                                        getOrderStatus(order)
                                    )}

                                </div>

                                <table>

                                    <thead>

                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        ${rows}

                                    </tbody>

                                </table>

                                <div class="total">

                                    Total:
                                    ${formatPrice(
                                        getOrderAmount(order)
                                    )}

                                </div>

                                <div class="footer">

                                    Thank you for shopping with FASHION.

                                </div>

                            </div>

                        </body>

                        </html>
                    `);

                    invoiceWindow.document.close();

                    invoiceWindow.focus();

                    setTimeout(
                        () => invoiceWindow.print(),
                        300
                    );
                }
            );
    }

    // ============================================================
    // CUSTOMERS
    // ============================================================

    async function loadCustomers() {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(CUSTOMER_TABLE)
                .select("*");

            if (error) {

                customers =
                    buildCustomersFromOrders();

            } else {

                customers =
                    Array.isArray(data)
                        ? data
                        : [];

                if (
                    !customers.length &&
                    orders.length
                ) {

                    customers =
                        buildCustomersFromOrders();
                }
            }

            renderCustomers();
            updateDashboard();

        } catch (error) {

            console.error(
                "Customer loading error:",
                error
            );

            customers =
                buildCustomersFromOrders();

            renderCustomers();
            updateDashboard();
        }
    }

    function buildCustomersFromOrders() {

        const map =
            new Map();

        orders.forEach(order => {

            const email =
                String(
                    order.customer_email ||
                    order.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const phone =
                String(
                    order.customer_phone ||
                    order.phone ||
                    ""
                )
                    .trim();

            const key =
                email ||
                phone ||
                String(order.id);

            if (!map.has(key)) {

                map.set(
                    key,
                    {

                        id: key,

                        name:
                            order.customer_name ||
                            order.name ||
                            order.full_name ||
                            "Customer",

                        email:
                            order.customer_email ||
                            order.email ||
                            "",

                        phone:
                            order.customer_phone ||
                            order.phone ||
                            "",

                        created_at:
                            getOrderDate(order),

                        order_count: 0,

                        total_spent: 0

                    }
                );
            }

            const customer =
                map.get(key);

            customer.order_count += 1;

            customer.total_spent +=
                getOrderAmount(order);
        });

        return Array.from(
            map.values()
        );
    }

    function renderCustomers() {

        const container =
            $("customersContainer");

        if (!container) return;

        if (!customers.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No customers found</strong>
                    <p>Customers will appear here after orders are placed.</p>
                </div>`;

            return;
        }

        const search =
            $("customerSearch")
                ?.value
                ?.trim()
                ?.toLowerCase() || "";

        const filtered =
            customers.filter(customer => {

                const name =
                    getCustomerName(customer)
                        .toLowerCase();

                const email =
                    getCustomerEmail(customer)
                        .toLowerCase();

                const phone =
                    getCustomerPhone(customer)
                        .toLowerCase();

                return (
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search)
                );
            });

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No matching customers</strong>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(customer => {

                const orderCount =
                    safeNumber(
                        customer.order_count ??
                        customer.orders_count ??
                        customer.total_orders ??
                        0
                    );

                const spent =
                    safeNumber(
                        customer.total_spent ??
                        customer.totalSpent ??
                        customer.spent ??
                        0
                    );

                return `

                    <article
                        class="customer-row"
                        data-customer-id="${escapeHTML(customer.id)}"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getCustomerName(customer)
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    getCustomerEmail(customer)
                                )}
                            </span>

                        </div>

                        <div>

                            <span>
                                ${escapeHTML(
                                    getCustomerPhone(customer)
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${orderCount}
                            </strong>

                            <span>
                                Orders
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatPrice(spent)}
                            </strong>

                            <span>
                                Spent
                            </span>

                        </div>

                        <div>

                            <button
                                type="button"
                                class="secondary-btn view-customer"
                                data-id="${escapeHTML(customer.id)}"
                            >
                                VIEW
                            </button>

                        </div>

                    </article>
                `;

            }).join("");

        document
            .querySelectorAll(".view-customer")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openCustomerModal(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    function openCustomerModal(id) {

        const customer =
            customers.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!customer) return;

        selectedCustomer =
            customer;

        const orderCount =
            safeNumber(
                customer.order_count ??
                customer.orders_count ??
                customer.total_orders ??
                0
            );

        const spent =
            safeNumber(
                customer.total_spent ??
                customer.totalSpent ??
                customer.spent ??
                0
            );

        const modal =
            $("customerModal");

        const content =
            $("customerModalContent");

        if (!content) {

            showToast(
                `${getCustomerName(customer)} has ${orderCount} order(s) worth ${formatPrice(spent)}.`,
                "success"
            );

            return;
        }

        content.innerHTML = `

            <div class="customer-detail">

                <h3>
                    ${escapeHTML(
                        getCustomerName(customer)
                    )}
                </h3>

                <p>
                    Email:
                    ${escapeHTML(
                        getCustomerEmail(customer)
                    )}
                </p>

                <p>
                    Phone:
                    ${escapeHTML(
                        getCustomerPhone(customer)
                    )}
                </p>

                <p>
                    Orders:
                    <strong>
                        ${orderCount}
                    </strong>
                </p>

                <p>
                    Total Spent:
                    <strong>
                        ${formatPrice(spent)}
                    </strong>
                </p>

            </div>
        `;

        modal?.classList.add("show");

        if (modal) {
            modal.style.display = "flex";
        }
    }

    function closeCustomerModal() {

        const modal =
            $("customerModal");

        modal?.classList.remove("show");

        if (modal) {
            modal.style.display = "";
        }

        selectedCustomer = null;
    }

    function setupCustomerEvents() {

        $("customerSearch")
            ?.addEventListener(
                "input",
                renderCustomers
            );

        $("closeCustomerModal")
            ?.addEventListener(
                "click",
                closeCustomerModal
            );

        $("closeCustomerModalBottom")
            ?.addEventListener(
                "click",
                closeCustomerModal
            );

        $("customerModal")
            ?.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        $("customerModal")
                    ) {
                        closeCustomerModal();
                    }
                }
            );
    }

    // ============================================================
    // INVENTORY
    // ============================================================

    function renderInventory() {

        const container =
            $("inventoryContainer");

        if (!container) return;

        const sorted =
            [...products].sort(
                (a, b) =>
                    getProductStock(a) -
                    getProductStock(b)
            );

        if (!sorted.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No inventory data</strong>
                </div>`;

            return;
        }

        container.innerHTML =
            sorted.map(product => {

                const stock =
                    getProductStock(product);

                let status =
                    "Healthy";

                let statusClass =
                    "healthy";

                if (stock <= 0) {

                    status =
                        "Out of Stock";

                    statusClass =
                        "out";

                } else if (
                    stock <= LOW_STOCK_LIMIT
                ) {

                    status =
                        "Low Stock";

                    statusClass =
                        "low";
                }

                return `

                    <article
                        class="inventory-row"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getProductName(product)
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    "Fashion"
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${stock}
                            </strong>

                            <span>
                                Units
                            </span>

                        </div>

                        <div>

                            <span
                                class="${statusClass}"
                            >
                                ${status}
                            </span>

                        </div>

                    </article>
                `;

            }).join("");
    }

    // ============================================================
    // PAYMENTS
    // ============================================================

    function getPaymentStatus(order) {

        const value =
            order.payment_status ||
            order.paymentStatus ||
            order.status ||
            "Confirmed";

        const normalized =
            String(value)
                .toLowerCase();

        if (
            normalized.includes("refund") ||
            normalized.includes("return")
        ) {
            return "Refunded";
        }

        if (
            normalized.includes("cancel")
        ) {
            return "Cancelled";
        }

        if (
            normalized.includes("pending")
        ) {
            return "Pending";
        }

        return "Paid";
    }

    function renderPayments() {

        const container =
            $("paymentsContainer");

        if (!container) return;

        if (!orders.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No payment records</strong>
                    <p>Payment information will appear here after orders are placed.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            sortOrders(orders)
                .map(order => {

                    const paymentStatus =
                        getPaymentStatus(order);

                    return `

                        <article
                            class="payment-row"
                        >

                            <div>

                                <strong>
                                    #${escapeHTML(order.id)}
                                </strong>

                                <span>
                                    ${formatDate(
                                        getOrderDate(order)
                                    )}
                                </span>

                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        order.customer_name ||
                                        order.name ||
                                        order.full_name ||
                                        "Customer"
                                    )}
                                </strong>

                            </div>

                            <div>

                                <strong>
                                    ${formatPrice(
                                        getOrderAmount(order)
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span class="status ${
                                    paymentStatus
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                }">
                                    ${paymentStatus}
                                </span>

                            </div>

                        </article>
                    `;

                })
                .join("");
    }

    // ============================================================
    // REVIEWS
    // ============================================================

    async function loadReviews() {

        const container =
            $("reviewsContainer");

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(REVIEW_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            reviews =
                Array.isArray(data)
                    ? data
                    : [];

            renderReviews();

            updateDashboard();

        } catch (error) {

            console.error(
                "Reviews loading error:",
                error
            );

            reviews = [];

            if (container) {

                container.innerHTML =
                    `<div class="empty">
                        <strong>Reviews unavailable</strong>
                        <p>${escapeHTML(
                            error.message || ""
                        )}</p>
                    </div>`;
            }
        }
    }

    function renderReviews() {

        const container =
            $("reviewsContainer");

        if (!container) return;

        if (!reviews.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No reviews found</strong>
                    <p>Customer reviews will appear here.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            reviews.map(review => {

                const rating =
                    Math.max(
                        0,
                        Math.min(
                            5,
                            safeNumber(
                                review.rating ??
                                review.stars ??
                                0
                            )
                        )
                    );

                const stars =
                    "★".repeat(rating) +
                    "☆".repeat(5 - rating);

                return `

                    <article
                        class="review-row"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    review.name ||
                                    review.customer_name ||
                                    review.customer ||
                                    "Customer"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    review.email ||
                                    review.customer_email ||
                                    ""
                                )}
                            </span>

                        </div>

                        <div class="review-rating">
                            ${stars}
                        </div>

                        <div>

                            <p>
                                ${escapeHTML(
                                    review.comment ||
                                    review.review ||
                                    review.message ||
                                    ""
                                )}
                            </p>

                        </div>

                        <div>

                            <span>
                                ${formatDate(
                                    review.created_at ||
                                    review.date
                                )}
                            </span>

                        </div>

                    </article>
                `;

            }).join("");
    }

    // ============================================================
    // MARKETING
    // ============================================================

    function setupMarketing() {

        const buttons =
            document.querySelectorAll(
                "[data-marketing-action], .marketing-btn"
            );

        buttons.forEach(button => {

            if (button.dataset.marketingBound) {
                return;
            }

            button.dataset.marketingBound = "true";

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const action =
                        button.dataset.marketingAction ||
                        button.textContent.trim();

                    showToast(
                        `${action} feature is ready to connect with your marketing workflow.`,
                        "success"
                    );
                }
            );
        });
    }

    // ============================================================
    // DASHBOARD STATISTICS
    // ============================================================

    function calculateSales(period) {

        const now =
            new Date();

        const start =
            new Date(now);

        start.setDate(
            now.getDate() - period
        );

        return orders.filter(order => {

            const date =
                new Date(
                    getOrderDate(order)
                );

            return (
                !Number.isNaN(date.getTime()) &&
                date >= start &&
                date <= now
            );

        });
    }

    function updateDashboard() {

        const totalProducts =
            products.length;

        const totalOrders =
            orders.length;

        const totalCustomers =
            customers.length;

        const totalRevenue =
            orders.reduce(
                (sum, order) =>
                    sum +
                    getOrderAmount(order),
                0
            );

        const lowStock =
            products.filter(
                product =>
                    getProductStock(product) <=
                    LOW_STOCK_LIMIT
            ).length;

        const pendingOrders =
            orders.filter(order => {

                const status =
                    getOrderStatus(order)
                        .toLowerCase();

                return (
                    status === "confirmed" ||
                    status === "processing"
                );

            }).length;

        const sales =
            calculateSales(salesPeriod);

        const periodRevenue =
            sales.reduce(
                (sum, order) =>
                    sum +
                    getOrderAmount(order),
                0
            );

        // Common IDs

        setText(
            "totalProducts",
            totalProducts
        );

        setText(
            "productsCount",
            totalProducts
        );

        setText(
            "totalOrders",
            totalOrders
        );

        setText(
            "ordersCount",
            totalOrders
        );

        setText(
            "totalCustomers",
            totalCustomers
        );

        setText(
            "customersCount",
            totalCustomers
        );

        setText(
            "totalRevenue",
            formatPrice(totalRevenue)
        );

        setText(
            "revenue",
            formatPrice(totalRevenue)
        );

        setText(
            "totalSales",
            formatPrice(periodRevenue)
        );

        setText(
            "lowStockCount",
            lowStock
        );

        setText(
            "pendingOrders",
            pendingOrders
        );

        setText(
            "reviewCount",
            reviews.length
        );

        setText(
            "totalReviews",
            reviews.length
        );

        // Additional common stat IDs

        setText(
            "dashboardProducts",
            totalProducts
        );

        setText(
            "dashboardOrders",
            totalOrders
        );

        setText(
            "dashboardCustomers",
            totalCustomers
        );

        setText(
            "dashboardRevenue",
            formatPrice(totalRevenue)
        );

        setText(
            "dashboardLowStock",
            lowStock
        );

        setText(
            "dashboardPendingOrders",
            pendingOrders
        );

        renderRecentOrders();
        renderLowStockProducts();
        renderTopProducts();
    }

    // ============================================================
    // RECENT ORDERS
    // ============================================================

    function renderRecentOrders() {

        const container =
            $("recentOrdersContainer") ||
            $("recentOrders");

        if (!container) return;

        const recent =
            sortOrders(orders).slice(0, 5);

        if (!recent.length) {

            container.innerHTML =
                `<div class="empty">
                    No recent orders.
                </div>`;

            return;
        }

        container.innerHTML =
            recent.map(order => {

                const status =
                    getOrderStatus(order);

                return `

                    <div class="recent-order">

                        <div>

                            <strong>
                                #${escapeHTML(order.id)}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    order.customer_name ||
                                    order.name ||
                                    order.full_name ||
                                    "Customer"
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatPrice(
                                    getOrderAmount(order)
                                )}
                            </strong>

                            <span class="status ${
                                status
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")
                            }">
                                ${escapeHTML(status)}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");
    }

    // ============================================================
    // LOW STOCK DASHBOARD
    // ============================================================

    function renderLowStockProducts() {

        const container =
            $("lowStockContainer") ||
            $("lowStockProducts");

        if (!container) return;

        const low =
            products
                .filter(
                    product =>
                        getProductStock(product) <=
                        LOW_STOCK_LIMIT
                )
                .sort(
                    (a, b) =>
                        getProductStock(a) -
                        getProductStock(b)
                )
                .slice(0, 6);

        if (!low.length) {

            container.innerHTML =
                `<div class="empty">
                    All products have healthy stock.
                </div>`;

            return;
        }

        container.innerHTML =
            low.map(product => {

                const stock =
                    getProductStock(product);

                return `

                    <div class="low-stock-item">

                        <strong>
                            ${escapeHTML(
                                getProductName(product)
                            )}
                        </strong>

                        <span>
                            ${stock} units
                        </span>

                    </div>
                `;

            }).join("");
    }

    // ============================================================
    // TOP PRODUCTS
    // ============================================================

    function renderTopProducts() {

        const container =
            $("topProductsContainer") ||
            $("topProducts");

        if (!container) return;

        const salesMap =
            new Map();

        orders.forEach(order => {

            let items =
                order.items ||
                order.products ||
                order.order_items ||
                [];

            if (typeof items === "string") {

                try {
                    items = JSON.parse(items);
                } catch {
                    items = [];
                }
            }

            if (!Array.isArray(items)) return;

            items.forEach(item => {

                const name =
                    item.name ||
                    item.product_name ||
                    "Product";

                const quantity =
                    safeNumber(
                        item.quantity ||
                        item.qty ||
                        1
                    );

                salesMap.set(
                    name,
                    (
                        salesMap.get(name) ||
                        0
                    ) + quantity
                );
            });
        });

        const top =
            Array.from(
                salesMap.entries()
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 5);

        if (!top.length) {

            container.innerHTML =
                `<div class="empty">
                    No product sales data available.
                </div>`;

            return;
        }

        container.innerHTML =
            top.map(
                ([name, quantity], index) => `

                    <div class="top-product-item">

                        <span>
                            #${index + 1}
                        </span>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <em>
                            ${quantity} sold
                        </em>

                    </div>
                `
            ).join("");
    }

    // ============================================================
    // SALES PERIOD
    // ============================================================

    function setupSalesPeriod() {

        const controls =
            document.querySelectorAll(
                "[data-sales-period], .sales-period-btn"
            );

        controls.forEach(button => {

            if (button.dataset.salesBound) {
                return;
            }

            button.dataset.salesBound = "true";

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const value =
                        safeNumber(
                            button.dataset.salesPeriod ||
                            button.value ||
                            7
                        );

                    salesPeriod =
                        value > 0
                            ? value
                            : 7;

                    controls.forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    });

                    updateDashboard();
                }
            );
        });
    }

    // ============================================================
    // MODAL CLOSE BUTTONS
    // ============================================================

    function setupModalClosing() {

        $("closeProductModal")
            ?.addEventListener(
                "click",
                closeProductModal
            );

        $("closeProductModalBottom")
            ?.addEventListener(
                "click",
                closeProductModal
            );

        $("closeOrderModal")
            ?.addEventListener(
                "click",
                closeOrderModal
            );

        $("closeOrderModalBottom")
            ?.addEventListener(
                "click",
                closeOrderModal
            );

        productModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    productModal
                ) {
                    closeProductModal();
                }
            }
        );

        orderModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    orderModal
                ) {
                    closeOrderModal();
                }
            }
        );

        document.addEventListener(
            "keydown",
            event => {

                if (event.key !== "Escape") {
                    return;
                }

                closeProductModal();
                closeOrderModal();
                closeCustomerModal();
            }
        );
    }

    // ============================================================
    // SUPABASE REALTIME
    // ============================================================

    function setupRealtime() {

        try {

            supabaseClient
                .channel("fashion-admin-live")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: PRODUCT_TABLE
                    },
                    async () => {

                        await loadProducts();
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: ORDER_TABLE
                    },
                    async () => {

                        await loadOrders();
                        await loadCustomers();
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: REVIEW_TABLE
                    },
                    async () => {

                        await loadReviews();
                    }
                )
                .subscribe();

        } catch (error) {

            console.warn(
                "Realtime setup unavailable:",
                error
            );
        }
    }

    // ============================================================
    // INITIALIZE
    // ============================================================

    async function initializeAdmin() {

        const authenticated =
            await checkAdminSession();

        if (!authenticated) {
            return;
        }

        hideLoadingScreen();

        setupLogout();

        setupNavigation();

        setupMobileSidebar();

        setupProductButtons();

        setupProductFilters();

        setupOrderFilters();

        setupCustomerEvents();

        setupPrintInvoice();

        setupMarketing();

        setupSalesPeriod();

        setupModalClosing();

        // Load independent data

        await loadProducts();

        await loadOrders();

        await loadCustomers();

        await loadReviews();

        // Initial dashboard

        updateDashboard();

        // Default section

        const activeSection =
            document.querySelector(
                ".admin-section.active"
            );

        if (!activeSection) {

            const dashboard =
                document.querySelector(
                    "#dashboardSection"
                ) ||
                document.querySelector(
                    "[data-section='dashboard']"
                );

            if (dashboard) {

                openSection("dashboard");
            }
        }

        setupRealtime();

        console.log(
            "FASHION Admin Dashboard initialized successfully."
        );
    }

    // ============================================================
    // START
    // ============================================================

    try {

        await initializeAdmin();

    } catch (error) {

        console.error(
            "Admin initialization error:",
            error
        );

        hideLoadingScreen();

        showToast(
            error.message ||
            "Admin dashboard initialization failed.",
            "error"
        );
    }

});
