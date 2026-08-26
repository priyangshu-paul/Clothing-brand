// ============================================================
// FASHION ADMIN DASHBOARD
// COMPLETE SUPABASE ADMIN.JS
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const ADMIN_EMAIL = "admin@fashion.com";

    const LOW_STOCK_LIMIT = 5;

    let products = [];
    let orders = [];
    let customers = [];

    let editingProductId = null;
    let selectedOrder = null;
    let selectedCustomer = null;

    let salesPeriod = 7;

    // ============================================================
    // HELPER
    // ============================================================

    const $ = (id) => document.getElementById(id);

    const safeNumber = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    };

    const escapeHTML = (value) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const formatPrice = (value) => {
        return "₹" + safeNumber(value).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (value) => {

        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getOrderDate = (order) => {
        return (
            order.created_at ||
            order.order_date ||
            order.created ||
            order.date ||
            null
        );
    };

    const getOrderAmount = (order) => {
        return safeNumber(
            order.total ??
            order.total_amount ??
            order.amount ??
            order.grand_total ??
            order.price
        );
    };

    const getOrderStatus = (order) => {
        return String(
            order.status ||
            order.order_status ||
            "Confirmed"
        );
    };

    const getCustomerName = (customer) => {
        return (
            customer.name ||
            customer.full_name ||
            customer.username ||
            customer.email ||
            "Customer"
        );
    };

    const getCustomerEmail = (customer) => {
        return (
            customer.email ||
            customer.user_email ||
            "-"
        );
    };

    const getCustomerPhone = (customer) => {
        return (
            customer.phone ||
            customer.phone_number ||
            customer.mobile ||
            "-"
        );
    };

    // ============================================================
    // SUPABASE CHECK
    // ============================================================

    if (typeof supabaseClient === "undefined") {

        console.error("supabaseClient is not defined.");

        alert(
            "Supabase is not connected.\n\n" +
            "Please check that supabase.js is loaded before admin.js."
        );

        return;
    }

    // ============================================================
    // DOM ELEMENTS
    // ============================================================

    const adminLoading = $("adminLoading");

    const adminUserInfo = $("adminUserInfo");
    const adminLogout = $("adminLogout");

    const productCount = $("productCount");
    const orderCount = $("orderCount");
    const customerCount = $("customerCount");
    const salesCount = $("salesCount");

    const sidebarProductBadge = $("sidebarProductBadge");
    const sidebarOrderBadge = $("sidebarOrderBadge");

    const adminProductList = $("adminProductList");
    const adminOrders = $("adminOrders");
    const customersContainer = $("customersContainer");

    const productSearch = $("productSearch");
    const productCategoryFilter = $("productCategoryFilter");
    const productSort = $("productSort");

    const orderSearch = $("orderSearch");
    const orderStatusFilter = $("orderStatusFilter");
    const orderSort = $("orderSort");

    const customerSearch = $("customerSearch");
    const customerSort = $("customerSort");

    const productModal = $("productModal");
    const productModalTitle = $("productModalTitle");
    const closeProductModal = $("closeProductModal");
    const cancelProductBtn = $("cancelProductBtn");

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

    // ============================================================
    // TOAST
    // ============================================================

    let toastTimer = null;

    function showToast(message, type = "success") {

        if (!toast) {
            alert(message);
            return;
        }

        clearTimeout(toastTimer);

        toast.textContent = message;

        toast.classList.remove(
            "show",
            "success",
            "error",
            "warning"
        );

        toast.classList.add("show", type);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // ============================================================
    // LOADING SCREEN
    // ============================================================

    function hideLoadingScreen() {

        if (!adminLoading) {
            return;
        }

        adminLoading.classList.add("hidden");

        setTimeout(() => {
            adminLoading.style.display = "none";
        }, 400);
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

            if (!session || !session.user) {

                window.location.replace("admin-login.html");

                return false;
            }

            const email = String(
                session.user.email || ""
            )
                .trim()
                .toLowerCase();

            if (
                email !== ADMIN_EMAIL.toLowerCase()
            ) {

                await supabaseClient.auth.signOut();

                alert(
                    "Admin access required.\n\n" +
                    "Please login using the administrator account."
                );

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            if (adminUserInfo) {

                adminUserInfo.textContent =
                    "Logged in as: " + email;
            }

            const settingsEmail = $("settingsAdminEmail");

            if (settingsEmail) {
                settingsEmail.value = email;
            }

            return true;

        } catch (error) {

            console.error(
                "Admin authentication error:",
                error
            );

            alert(
                error.message ||
                "Unable to verify admin session."
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

    if (adminLogout) {

        adminLogout.addEventListener(
            "click",
            async () => {

                const confirmed = confirm(
                    "Are you sure you want to logout?"
                );

                if (!confirmed) {
                    return;
                }

                try {

                    await supabaseClient.auth.signOut();

                    window.location.replace(
                        "admin-login.html"
                    );

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    showToast(
                        error.message ||
                        "Unable to logout.",
                        "error"
                    );
                }
            }
        );
    }

    // ============================================================
    // NAVIGATION
    // ============================================================

    const navItems =
        document.querySelectorAll(".nav-item");

    const sections =
        document.querySelectorAll(".admin-section");

    const pageTitle = $("pageTitle");
    const pageBreadcrumb = $("pageBreadcrumb");

    const sectionTitles = {

        dashboard: "Dashboard Overview",
        products: "Products",
        orders: "Orders",
        customers: "Customers",
        inventory: "Inventory",
        payments: "Payments",
        marketing: "Marketing",
        reviews: "Reviews & Ratings",
        analytics: "Analytics & Reports",
        settings: "Settings"
    };

    function openSection(sectionName) {

        if (!sectionName) {
            return;
        }

        navItems.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );
        });

        sections.forEach(section => {

            section.classList.toggle(
                "active",
                section.id ===
                "section-" + sectionName
            );
        });

        const title =
            sectionTitles[sectionName] ||
            "Dashboard";

        if (pageTitle) {
            pageTitle.textContent = title;
        }

        if (pageBreadcrumb) {
            pageBreadcrumb.textContent =
                "FASHION / " +
                sectionName.toUpperCase();
        }

        closeMobileSidebar();

        if (sectionName === "dashboard") {
            updateDashboard();
        }

        if (sectionName === "products") {
            renderProducts();
        }

        if (sectionName === "orders") {
            renderOrders();
        }

        if (sectionName === "customers") {
            renderCustomers();
        }

        if (sectionName === "inventory") {
            renderInventory();
        }

        if (sectionName === "payments") {
            renderPayments();
        }

        if (sectionName === "analytics") {
            renderAnalytics();
        }
    }

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            openSection(
                item.dataset.section
            );
        });
    });

    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (
                button.classList.contains("nav-item")
            ) {
                return;
            }

            button.addEventListener(
                "click",
                () => {

                    openSection(
                        button.dataset.section
                    );
                }
            );
        });

    // ============================================================
    // SIDEBAR
    // ============================================================

    const sidebar =
        $("adminSidebar");

    const sidebarOverlay =
        $("sidebarOverlay");

    const sidebarOpen =
        $("sidebarOpen");

    const sidebarClose =
        $("sidebarClose");

    function openMobileSidebar() {

        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }

        document.body.classList.add(
            "sidebar-open"
        );
    }

    function closeMobileSidebar() {

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

        document.body.classList.remove(
            "sidebar-open"
        );
    }

    if (sidebarOpen) {
        sidebarOpen.addEventListener(
            "click",
            openMobileSidebar
        );
    }

    if (sidebarClose) {
        sidebarClose.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    // ============================================================
    // THEME
    // ============================================================

    const themeToggle = $("themeToggle");
    const themeIcon = $("themeIcon");
    const themeText = $("themeText");

    const settingsThemeToggle =
        $("settingsThemeToggle");

    function applyTheme(theme) {

        if (theme === "light") {

            document.body.classList.add(
                "light-mode"
            );

            document.body.classList.remove(
                "dark-mode"
            );

            if (themeIcon) {
                themeIcon.textContent = "☀";
            }

            if (themeText) {
                themeText.textContent =
                    "Light Mode";
            }

        } else {

            document.body.classList.add(
                "dark-mode"
            );

            document.body.classList.remove(
                "light-mode"
            );

            if (themeIcon) {
                themeIcon.textContent = "☾";
            }

            if (themeText) {
                themeText.textContent =
                    "Dark Mode";
            }
        }

        localStorage.setItem(
            "fashionAdminTheme",
            theme
        );
    }

    function toggleTheme() {

        const current =
            localStorage.getItem(
                "fashionAdminTheme"
            ) || "dark";

        applyTheme(
            current === "dark"
                ? "light"
                : "dark"
        );
    }

    const savedTheme =
        localStorage.getItem(
            "fashionAdminTheme"
        ) || "dark";

    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener(
            "click",
            toggleTheme
        );
    }

    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener(
            "click",
            toggleTheme
        );
    }

    // ============================================================
    // COMPACT SIDEBAR
    // ============================================================

    const settingsCompactToggle =
        $("settingsCompactToggle");

    function toggleCompactSidebar() {

        document.body.classList.toggle(
            "compact-sidebar"
        );

        localStorage.setItem(
            "fashionAdminCompact",
            document.body.classList.contains(
                "compact-sidebar"
            )
                ? "true"
                : "false"
        );
    }

    if (
        localStorage.getItem(
            "fashionAdminCompact"
        ) === "true"
    ) {
        document.body.classList.add(
            "compact-sidebar"
        );
    }

    if (settingsCompactToggle) {
        settingsCompactToggle.addEventListener(
            "click",
            toggleCompactSidebar
        );
    }

    // ============================================================
    // LOAD PRODUCTS
    // ============================================================

    async function loadProducts() {

        if (adminProductList) {

            adminProductList.innerHTML =
                `<div class="loading">
                    Loading products...
                </div>`;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("products")
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

            products = Array.isArray(data)
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

            if (adminProductList) {

                adminProductList.innerHTML =
                    `<div class="empty">
                        <strong>
                            Unable to load products
                        </strong>
                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>
                    </div>`;
            }
        }
    }

    // ============================================================
    // PRODUCT SORT
    // ============================================================

    function sortProducts(list) {

        const sort =
            productSort
                ? productSort.value
                : "newest";

        return [...list].sort(
            (a, b) => {

                if (sort === "name_asc") {

                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(b.name || "")
                    );
                }

                if (sort === "name_desc") {

                    return String(
                        b.name || ""
                    ).localeCompare(
                        String(a.name || "")
                    );
                }

                if (sort === "price_low") {

                    return safeNumber(a.price) -
                        safeNumber(b.price);
                }

                if (sort === "price_high") {

                    return safeNumber(b.price) -
                        safeNumber(a.price);
                }

                if (sort === "stock_low") {

                    return safeNumber(a.stock) -
                        safeNumber(b.stock);
                }

                const dateA =
                    new Date(
                        a.created_at || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.created_at || 0
                    ).getTime();

                return sort === "oldest"
                    ? dateA - dateB
                    : dateB - dateA;
            }
        );
    }

    // ============================================================
    // RENDER PRODUCTS
    // ============================================================

    function renderProducts() {

        if (!adminProductList) {
            return;
        }

        const search =
            productSearch
                ? productSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const category =
            productCategoryFilter
                ? productCategoryFilter.value
                : "all";

        let filtered =
            products.filter(product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const productCategory =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const gender =
                    String(
                        product.gender || ""
                    ).toLowerCase();

                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();

                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    productCategory.includes(search) ||
                    gender.includes(search) ||
                    description.includes(search);

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

                return (
                    matchesSearch &&
                    matchesCategory
                );
            });

        filtered = sortProducts(filtered);

        updateProductMiniStats();

        if (!filtered.length) {

            adminProductList.innerHTML =
                `<div class="empty">
                    <strong>
                        No products found
                    </strong>
                    <p>
                        Add a product or change your filters.
                    </p>
                </div>`;

            return;
        }

        adminProductList.innerHTML =
            filtered.map(product => {

                const stock =
                    safeNumber(product.stock);

                let stockClass = "healthy";

                if (stock <= 0) {
                    stockClass = "out";
                } else if (
                    stock <= LOW_STOCK_LIMIT
                ) {
                    stockClass = "low";
                }

                const image =
                    product.image || "";

                return `
                    <article class="product-card">

                        <div class="product-image">

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(
                                                product.name ||
                                                "Product"
                                            )}"
                                            loading="lazy"
                                            onerror="
                                                this.style.display='none';
                                            "
                                        >
                                    `
                                    : `
                                        <div style="
                                            height:100%;
                                            min-height:160px;
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
                                ${formatPrice(
                                    product.price
                                )}
                            </strong>

                            <p>
                                Stock:
                                <b class="${stockClass}">
                                    ${stock}
                                </b>
                            </p>

                            <p>
                                Gender:
                                ${escapeHTML(
                                    product.gender ||
                                    "-"
                                )}
                            </p>

                            <p>
                                Sizes:
                                ${escapeHTML(
                                    product.sizes ||
                                    "-"
                                )}
                            </p>

                            ${
                                product.is_new
                                    ? `
                                        <span class="product-new-badge">
                                            NEW
                                        </span>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="product-actions">

                            <button
                                type="button"
                                class="primary-btn edit-product"
                                data-id="${escapeHTML(
                                    product.id
                                )}"
                            >
                                EDIT
                            </button>

                            <button
                                type="button"
                                class="danger-btn delete-product"
                                data-id="${escapeHTML(
                                    product.id
                                )}"
                            >
                                DELETE
                            </button>

                        </div>

                    </article>
                `;

            }).join("");

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
    // PRODUCT MINI STATS
    // ============================================================

    function updateProductMiniStats() {

        const total =
            products.length;

        const inStock =
            products.filter(
                p => safeNumber(p.stock) > LOW_STOCK_LIMIT
            ).length;

        const lowStock =
            products.filter(
                p =>
                    safeNumber(p.stock) > 0 &&
                    safeNumber(p.stock) <= LOW_STOCK_LIMIT
            ).length;

        const outStock =
            products.filter(
                p => safeNumber(p.stock) <= 0
            ).length;

        const map = {

            productsTotalMini: total,
            productsInStockMini: inStock,
            productsLowStockMini: lowStock,
            productsOutStockMini: outStock
        };

        Object.entries(map).forEach(
            ([id, value]) => {

                const element = $(id);

                if (element) {
                    element.textContent =
                        value;
                }
            }
        );

        if (sidebarProductBadge) {
            sidebarProductBadge.textContent =
                total;
        }
    }

    // ============================================================
    // ADD PRODUCT
    // ============================================================

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
            productStock.value = "0";
        }

        if (productIsNew) {
            productIsNew.checked = false;
        }

        if (productModal) {

            productModal.classList.add(
                "show"
            );

            productModal.style.display =
                "flex";
        }

        setTimeout(() => {

            if (productName) {
                productName.focus();
            }

        }, 100);
    }

    // ============================================================
    // EDIT PRODUCT
    // ============================================================

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

        editingProductId =
            product.id;

        if (productModalTitle) {
            productModalTitle.textContent =
                "Edit Product";
        }

        if (productId) {
            productId.value =
                product.id;
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

            productModal.classList.add(
                "show"
            );

            productModal.style.display =
                "flex";
        }
    }

    // ============================================================
    // CLOSE PRODUCT MODAL
    // ============================================================

    function closeProductModalFunction() {

        if (productModal) {

            productModal.classList.remove(
                "show"
            );

            productModal.style.display =
                "";
        }

        editingProductId = null;
    }

    if (closeProductModal) {

        closeProductModal.addEventListener(
            "click",
            closeProductModalFunction
        );
    }

    if (cancelProductBtn) {

        cancelProductBtn.addEventListener(
            "click",
            closeProductModalFunction
        );
    }

    if (productModal) {

        productModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    productModal
                ) {
                    closeProductModalFunction();
                }
            }
        );
    }

    // ============================================================
    // ADD PRODUCT BUTTONS
    // ============================================================

    const addProductBtn =
        $("addProductBtn");

    const dashboardAddProduct =
        $("dashboardAddProduct");

    if (addProductBtn) {

        addProductBtn.addEventListener(
            "click",
            openAddProduct
        );
    }

    if (dashboardAddProduct) {

        dashboardAddProduct.addEventListener(
            "click",
            openAddProduct
        );
    }

    // ============================================================
    // SAVE PRODUCT
    // ============================================================

    if (productForm) {

        productForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const name =
                    productName?.value.trim();

                const price =
                    safeNumber(
                        productPrice?.value
                    );

                const stock =
                    Math.max(
                        0,
                        Math.floor(
                            safeNumber(
                                productStock?.value
                            )
                        )
                    );

                const category =
                    productCategory?.value;

                if (!name) {

                    showToast(
                        "Product name is required.",
                        "error"
                    );

                    productName?.focus();

                    return;
                }

                if (price < 0) {

                    showToast(
                        "Price cannot be negative.",
                        "error"
                    );

                    return;
                }

                if (!category) {

                    showToast(
                        "Please select a category.",
                        "error"
                    );

                    return;
                }

                const payload = {

                    name: name,

                    price: price,

                    image:
                        productImage?.value.trim() ||
                        null,

                    category: category,

                    description:
                        productDescription?.value.trim() ||
                        null,

                    sizes:
                        productSizes?.value.trim() ||
                        null,

                    stock: stock,

                    gender:
                        productGender?.value ||
                        null,

                    is_new:
                        productIsNew?.checked === true
                };

                const originalText =
                    saveProductBtn
                        ? saveProductBtn.textContent
                        : "SAVE PRODUCT";

                try {

                    if (saveProductBtn) {

                        saveProductBtn.disabled =
                            true;

                        saveProductBtn.textContent =
                            "SAVING...";
                    }

                    let result;

                    if (editingProductId) {

                        result =
                            await supabaseClient
                                .from("products")
                                .update(payload)
                                .eq(
                                    "id",
                                    editingProductId
                                );

                    } else {

                        result =
                            await supabaseClient
                                .from("products")
                                .insert([
                                    payload
                                ]);
                    }

                    if (result.error) {
                        throw result.error;
                    }

                    showToast(
                        editingProductId
                            ? "Product updated successfully."
                            : "Product added successfully."
                    );

                    closeProductModalFunction();

                    await loadProducts();

                } catch (error) {

                    console.error(
                        "Save product error:",
                        error
                    );

                    showToast(
                        error.message ||
                        "Unable to save product.",
                        "error"
                    );

                } finally {

                    if (saveProductBtn) {

                        saveProductBtn.disabled =
                            false;

                        saveProductBtn.textContent =
                            originalText;
                    }
                }
            }
        );
    }

    // ============================================================
    // DELETE PRODUCT
    // ============================================================

    async function deleteProduct(id) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!product) {
            return;
        }

        const confirmed =
            confirm(
                `Delete "${product.name}"?\n\n` +
                "This action cannot be undone."
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

            showToast(
                error.message ||
                "Unable to delete product.",
                "error"
            );
        }
    }

    // ============================================================
    // BULK UPLOAD
    // ============================================================

    const bulkUploadBtn =
        $("bulkUploadBtn");

    const bulkUploadModal =
        $("bulkUploadModal");

    const closeBulkUploadModal =
        $("closeBulkUploadModal");

    const cancelBulkUpload =
        $("cancelBulkUpload");

    const processBulkUpload =
        $("processBulkUpload");

    const bulkProductFile =
        $("bulkProductFile");

    function openBulkUpload() {

        if (!bulkUploadModal) {
            return;
        }

        bulkUploadModal.classList.add(
            "show"
        );

        bulkUploadModal.style.display =
            "flex";
    }

    function closeBulkUpload() {

        if (!bulkUploadModal) {
            return;
        }

        bulkUploadModal.classList.remove(
            "show"
        );

        bulkUploadModal.style.display =
            "";
    }

    if (bulkUploadBtn) {
        bulkUploadBtn.addEventListener(
            "click",
            openBulkUpload
        );
    }

    if (closeBulkUploadModal) {
        closeBulkUploadModal.addEventListener(
            "click",
            closeBulkUpload
        );
    }

    if (cancelBulkUpload) {
        cancelBulkUpload.addEventListener(
            "click",
            closeBulkUpload
        );
    }

    if (bulkUploadModal) {

        bulkUploadModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    bulkUploadModal
                ) {
                    closeBulkUpload();
                }
            }
        );
    }

    function parseCSV(text) {

        const rows = [];

        let row = [];
        let value = "";
        let insideQuotes = false;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const char =
                text[i];

            const next =
                text[i + 1];

            if (
                char === '"' &&
                insideQuotes &&
                next === '"'
            ) {

                value += '"';
                i++;

                continue;
            }

            if (char === '"') {

                insideQuotes =
                    !insideQuotes;

                continue;
            }

            if (
                char === "," &&
                !insideQuotes
            ) {

                row.push(value.trim());
                value = "";

                continue;
            }

            if (
                (char === "\n" ||
                    char === "\r") &&
                !insideQuotes
            ) {

                if (
                    char === "\r" &&
                    next === "\n"
                ) {
                    i++;
                }

                row.push(value.trim());

                if (
                    row.some(
                        cell =>
                            cell !== ""
                    )
                ) {
                    rows.push(row);
                }

                row = [];
                value = "";

                continue;
            }

            value += char;
        }

        row.push(value.trim());

        if (
            row.some(
                cell => cell !== ""
            )
        ) {
            rows.push(row);
        }

        if (!rows.length) {
            return [];
        }

        const headers =
            rows[0].map(
                header =>
                    header
                        .trim()
                        .toLowerCase()
            );

        return rows
            .slice(1)
            .map(row => {

                const object = {};

                headers.forEach(
                    (header, index) => {
                        object[header] =
                            row[index] ?? "";
                    }
                );

                return object;
            });
    }

    if (processBulkUpload) {

        processBulkUpload.addEventListener(
            "click",
            async () => {

                const file =
                    bulkProductFile?.files?.[0];

                if (!file) {

                    showToast(
                        "Please choose a CSV file.",
                        "error"
                    );

                    return;
                }

                try {

                    processBulkUpload.disabled =
                        true;

                    processBulkUpload.textContent =
                        "IMPORTING...";

                    const text =
                        await file.text();

                    const rows =
                        parseCSV(text);

                    if (!rows.length) {
                        throw new Error(
                            "CSV file is empty."
                        );
                    }

                    const payload =
                        rows.map(row => ({

                            name:
                                row.name || "",

                            price:
                                safeNumber(
                                    row.price
                                ),

                            image:
                                row.image || null,

                            category:
                                row.category || null,

                            description:
                                row.description ||
                                null,

                            sizes:
                                row.sizes || null,

                            stock:
                                Math.max(
                                    0,
                                    Math.floor(
                                        safeNumber(
                                            row.stock
                                        )
                                    )
                                ),

                            gender:
                                row.gender || null,

                            is_new:
                                [
                                    "true",
                                    "1",
                                    "yes",
                                    "y"
                                ].includes(
                                    String(
                                        row.is_new || ""
                                    )
                                        .toLowerCase()
                                        .trim()
                                )
                        }))
                        .filter(
                            product =>
                                product.name
                        );

                    if (!payload.length) {
                        throw new Error(
                            "No valid products found in CSV."
                        );
                    }

                    const {
                        error
                    } = await supabaseClient
                        .from("products")
                        .insert(payload);

                    if (error) {
                        throw error;
                    }

                    showToast(
                        `${payload.length} product(s) imported successfully.`
                    );

                    closeBulkUpload();

                    if (bulkProductFile) {
                        bulkProductFile.value = "";
                    }

                    await loadProducts();

                } catch (error) {

                    console.error(
                        "Bulk upload error:",
                        error
                    );

                    showToast(
                        error.message ||
                        "Bulk upload failed.",
                        "error"
                    );

                } finally {

                    processBulkUpload.disabled =
                        false;

                    processBulkUpload.textContent =
                        "Import Products";
                }
            }
        );
    }

    // ============================================================
    // LOAD ORDERS
    // ============================================================

    async function loadOrders() {

        if (adminOrders) {

            adminOrders.innerHTML =
                `<div class="loading">
                    Loading orders...
                </div>`;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("orders")
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

            orders = Array.isArray(data)
                ? data
                : [];

            renderOrders();
            updateDashboard();

            renderPayments();
            renderAnalytics();

        } catch (error) {

            console.error(
                "Orders loading error:",
                error
            );

            if (adminOrders) {

                adminOrders.innerHTML =
                    `<div class="empty">
                        <strong>
                            Unable to load orders
                        </strong>
                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>
                    </div>`;
            }
        }
    }

    // ============================================================
    // ORDER SORT
    // ============================================================

    function sortOrders(list) {

        const sort =
            orderSort
                ? orderSort.value
                : "newest";

        return [...list].sort(
            (a, b) => {

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

                const dateA =
                    new Date(
                        getOrderDate(a) || 0
                    ).getTime();

                const dateB =
                    new Date(
                        getOrderDate(b) || 0
                    ).getTime();

                return sort === "oldest"
                    ? dateA - dateB
                    : dateB - dateA;
            }
        );
    }

    // ============================================================
    // RENDER ORDERS
    // ============================================================

    function renderOrders() {

        if (!adminOrders) {
            return;
        }

        const search =
            orderSearch
                ? orderSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const status =
            orderStatusFilter
                ? orderStatusFilter.value
                : "all";

        let filtered =
            orders.filter(order => {

                const orderIdText =
                    String(
                        order.id || ""
                    ).toLowerCase();

                const name =
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

                const phone =
                    String(
                        order.customer_phone ||
                        order.phone ||
                        ""
                    ).toLowerCase();

                const currentStatus =
                    getOrderStatus(order);

                const matchesSearch =
                    !search ||
                    orderIdText.includes(search) ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search);

                const matchesStatus =
                    status === "all" ||
                    currentStatus === status;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            });

        filtered =
            sortOrders(filtered);

        updateOrderMiniStats();

        if (!filtered.length) {

            adminOrders.innerHTML =
                `<div class="empty">
                    <strong>
                        No orders found
                    </strong>
                    <p>
                        No orders match your current filters.
                    </p>
                </div>`;

            return;
        }

        adminOrders.innerHTML =
            filtered.map(order => {

                const name =
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

                const currentStatus =
                    getOrderStatus(order);

                const amount =
                    getOrderAmount(order);

                return `
                    <article class="order-card">

                        <div class="order-main">

                            <div class="order-id">
                                #${escapeHTML(
                                    order.id
                                )}
                            </div>

                            <h3>
                                ${escapeHTML(name)}
                            </h3>

                            <p>
                                ${escapeHTML(email)}
                            </p>

                            <p>
                                ${escapeHTML(phone)}
                            </p>

                            <small>
                                ${formatDate(
                                    getOrderDate(order)
                                )}
                            </small>

                        </div>

                        <div class="order-amount">
                            <strong>
                                ${formatPrice(amount)}
                            </strong>
                        </div>

                        <div class="order-status">
                            <span class="
                                order-status-badge
                                ${currentStatus
                                    .toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        "-"
                                    )}
                            ">
                                ${escapeHTML(
                                    currentStatus
                                )}
                            </span>
                        </div>

                        <div class="order-actions">

                            <button
                                type="button"
                                class="primary-btn view-order"
                                data-id="${escapeHTML(
                                    order.id
                                )}"
                            >
                                VIEW
                            </button>

                            <select
                                class="order-status-select"
                                data-id="${escapeHTML(
                                    order.id
                                )}"
                            >

                                ${[
                                    "Confirmed",
                                    "Processing",
                                    "Shipped",
                                    "Delivered",
                                    "Cancelled",
                                    "Returned"
                                ]
                                    .map(
                                        option => `
                                            <option
                                                value="${option}"
                                                ${
                                                    currentStatus ===
                                                    option
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${option}
                                            </option>
                                        `
                                    )
                                    .join("")}

                            </select>

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

        document
            .querySelectorAll(
                ".order-status-select"
            )
            .forEach(select => {

                select.addEventListener(
                    "change",
                    () => {

                        updateOrderStatus(
                            select.dataset.id,
                            select.value
                        );
                    }
                );
            });
    }

    // ============================================================
    // ORDER MINI STATS
    // ============================================================

    function updateOrderMiniStats() {

        const countStatus = status =>
            orders.filter(
                order =>
                    getOrderStatus(order) ===
                    status
            ).length;

        const map = {

            ordersTotalMini:
                orders.length,

            ordersConfirmedMini:
                countStatus("Confirmed"),

            ordersProcessingMini:
                countStatus("Processing"),

            ordersDeliveredMini:
                countStatus("Delivered")
        };

        Object.entries(map).forEach(
            ([id, value]) => {

                const element = $(id);

                if (element) {
                    element.textContent =
                        value;
                }
            }
        );

        if (sidebarOrderBadge) {
            sidebarOrderBadge.textContent =
                orders.length;
        }
    }

    // ============================================================
    // UPDATE ORDER STATUS
    // ============================================================

    async function updateOrderStatus(
        id,
        status
    ) {

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

            const order =
                orders.find(
                    item =>
                        String(item.id) ===
                        String(id)
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

            showToast(
                error.message ||
                "Unable to update order status.",
                "error"
            );

            await loadOrders();
        }
    }

    // ============================================================
    // ORDER MODAL
    // ============================================================

    const orderModal =
        $("orderModal");

    const orderModalContent =
        $("orderModalContent");

    const closeOrderModal =
        $("closeOrderModal");

    const closeOrderModalBottom =
        $("closeOrderModalBottom");

    function openOrderModal(id) {

        const order =
            orders.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!order) {
            return;
        }

        selectedOrder = order;

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

        const items =
            order.items ||
            order.products ||
            order.order_items ||
            [];

        let itemsHTML = "";

        if (Array.isArray(items)) {

            itemsHTML =
                items.map(item => {

                    const itemName =
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
                                ${escapeHTML(
                                    itemName
                                )}
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

        } else if (typeof items === "string") {

            itemsHTML =
                `<p>
                    ${escapeHTML(items)}
                </p>`;

        } else {

            itemsHTML =
                `<p>
                    No item details available.
                </p>`;
        }

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
                        ${escapeHTML(
                            customerName
                        )}
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
                    <span>
                        ${escapeHTML(
                            getOrderStatus(order)
                        )}
                    </span>
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

        if (orderModal) {

            orderModal.classList.add(
                "show"
            );

            orderModal.style.display =
                "flex";
        }
    }

    function closeOrderModalFunction() {

        if (orderModal) {

            orderModal.classList.remove(
                "show"
            );

            orderModal.style.display =
                "";
        }

        selectedOrder = null;
    }

    if (closeOrderModal) {

        closeOrderModal.addEventListener(
            "click",
            closeOrderModalFunction
        );
    }

    if (closeOrderModalBottom) {

        closeOrderModalBottom.addEventListener(
            "click",
            closeOrderModalFunction
        );
    }

    if (orderModal) {

        orderModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    orderModal
                ) {
                    closeOrderModalFunction();
                }
            }
        );
    }

    // ============================================================
    // PRINT INVOICE
    // ============================================================

    const printInvoiceBtn =
        $("printInvoiceBtn");

    if (printInvoiceBtn) {

        printInvoiceBtn.addEventListener(
            "click",
            () => {

                if (!selectedOrder) {
                    return;
                }

                const customerName =
                    selectedOrder.customer_name ||
                    selectedOrder.name ||
                    selectedOrder.full_name ||
                    "Customer";

                const invoiceWindow =
                    window.open(
                        "",
                        "_blank",
                        "width=900,height=700"
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

                        <title>
                            FASHION Invoice
                        </title>

                        <style>

                            body {
                                font-family: Arial, sans-serif;
                                padding: 40px;
                                color: #111;
                            }

                            h1 {
                                margin-bottom: 5px;
                            }

                            .header {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 40px;
                            }

                            .box {
                                border: 1px solid #ddd;
                                padding: 20px;
                                margin-bottom: 20px;
                            }

                            .total {
                                text-align: right;
                                font-size: 22px;
                                font-weight: bold;
                                margin-top: 30px;
                            }

                        </style>

                    </head>

                    <body>

                        <div class="header">

                            <div>
                                <h1>FASHION</h1>
                                <p>Official Invoice</p>
                            </div>

                            <div>
                                <strong>
                                    Order #${escapeHTML(
                                        selectedOrder.id
                                    )}
                                </strong>

                                <p>
                                    ${formatDate(
                                        getOrderDate(
                                            selectedOrder
                                        )
                                    )}
                                </p>
                            </div>

                        </div>

                        <div class="box">

                            <strong>
                                Customer
                            </strong>

                            <p>
                                ${escapeHTML(
                                    customerName
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    selectedOrder.customer_email ||
                                    selectedOrder.email ||
                                    "-"
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    selectedOrder.customer_phone ||
                                    selectedOrder.phone ||
                                    "-"
                                )}
                            </p>

                        </div>

                        <div class="box">

                            <strong>
                                Status:
                            </strong>

                            ${escapeHTML(
                                getOrderStatus(
                                    selectedOrder
                                )
                            )}

                        </div>

                        <div class="total">

                            Total:
                            ${formatPrice(
                                getOrderAmount(
                                    selectedOrder
                                )
                            )}

                        </div>

                    </body>

                    </html>
                `);

                invoiceWindow.document.close();

                invoiceWindow.focus();

                setTimeout(
                    () => {
                        invoiceWindow.print();
                    },
                    300
                );
            }
        );
    }

    // ============================================================
    // LOAD CUSTOMERS
    // ============================================================

    async function loadCustomers() {

        if (customersContainer) {

            customersContainer.innerHTML =
                `<div class="loading">
                    Loading customers...
                </div>`;
        }

        try {

            let result =
                await supabaseClient
                    .from("customers")
                    .select("*");

            /*
             * If a customers table does not exist,
             * build customer information from orders.
             */

            if (result.error) {

                console.warn(
                    "Customers table unavailable. " +
                    "Building customers from orders."
                );

                customers =
                    buildCustomersFromOrders();

            } else {

                customers =
                    Array.isArray(result.data)
                        ? result.data
                        : [];

                /*
                 * If the table is empty but orders exist,
                 * use order information.
                 */

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
                "Customers loading error:",
                error
            );

            customers =
                buildCustomersFromOrders();

            renderCustomers();
            updateDashboard();
        }
    }

    // ============================================================
    // BUILD CUSTOMERS FROM ORDERS
    // ============================================================

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
                ).trim();

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

    // ============================================================
    // RENDER CUSTOMERS
    // ============================================================

    function renderCustomers() {

        if (!customersContainer) {
            return;
        }

        const search =
            customerSearch
                ? customerSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        let filtered =
            customers.filter(customer => {

                const name =
                    getCustomerName(
                        customer
                    ).toLowerCase();

                const email =
                    getCustomerEmail(
                        customer
                    ).toLowerCase();

                const phone =
                    getCustomerPhone(
                        customer
                    ).toLowerCase();

                return (
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search)
                );
            });

        const sort =
            customerSort
                ? customerSort.value
                : "newest";

        filtered.sort(
            (a, b) => {

                if (
                    sort === "name_asc"
                ) {

                    return getCustomerName(a)
                        .localeCompare(
                            getCustomerName(b)
                        );
                }

                if (
                    sort === "name_desc"
                ) {

                    return getCustomerName(b)
                        .localeCompare(
                            getCustomerName(a)
                        );
                }

                return new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                );
            }
        );

        if (!filtered.length) {

            customersContainer.innerHTML =
                `<div class="empty">

                    <strong>
                        No customers found
                    </strong>

                    <p>
                        Customer information will appear here.
                    </p>

                </div>`;

            return;
        }

        customersContainer.innerHTML =
            filtered.map(customer => {

                const orderCount =
                    customer.order_count ??
                    orders.filter(
                        order =>
                            (
                                order.customer_email ||
                                order.email ||
                                ""
                            ).toLowerCase() ===
                            (
                                customer.email ||
                                ""
                            ).toLowerCase()
                    ).length;

                const totalSpent =
                    customer.total_spent ??
                    0;

                return `
                    <article
                        class="customer-card"
                    >

                        <div class="customer-avatar">
                            ${escapeHTML(
                                getCustomerName(
                                    customer
                                )
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>

                        <div class="customer-info">

                            <h3>
                                ${escapeHTML(
                                    getCustomerName(
                                        customer
                                    )
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    getCustomerEmail(
                                        customer
                                    )
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    getCustomerPhone(
                                        customer
                                    )
                                )}
                            </p>

                        </div>

                        <div class="customer-stats">

                            <span>
                                Orders
                            </span>

                            <strong>
                                ${orderCount}
                            </strong>

                        </div>

                        <div class="customer-stats">

                            <span>
                                Spent
                            </span>

                            <strong>
                                ${formatPrice(
                                    totalSpent
                                )}
                            </strong>

                        </div>

                        <button
                            type="button"
                            class="primary-btn view-customer"
                            data-id="${escapeHTML(
                                customer.id
                            )}"
                        >
                            VIEW
                        </button>

                    </article>
                `;

            }).join("");

        document
            .querySelectorAll(
                ".view-customer"
            )
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

    // ============================================================
    // CUSTOMER MODAL
    // ============================================================

    const customerModal =
        $("customerModal");

    const customerModalContent =
        $("customerModalContent");

    const closeCustomerModal =
        $("closeCustomerModal");

    const closeCustomerModalBottom =
        $("closeCustomerModalBottom");

    function openCustomerModal(id) {

        const customer =
            customers.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!customer) {
            return;
        }

        selectedCustomer =
            customer;

        const email =
            getCustomerEmail(customer);

        const customerOrders =
            orders.filter(order => {

                const orderEmail =
                    String(
                        order.customer_email ||
                        order.email ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                return (
                    email !== "-" &&
                    email !== "" &&
                    orderEmail ===
                    email.toLowerCase()
                );
            });

        const totalSpent =
            customerOrders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        customerModalContent.innerHTML = `

            <div class="customer-profile">

                <div class="customer-large-avatar">

                    ${escapeHTML(
                        getCustomerName(
                            customer
                        )
                            .charAt(0)
                            .toUpperCase()
                    )}

                </div>

                <h3>
                    ${escapeHTML(
                        getCustomerName(
                            customer
                        )
                    )}
                </h3>

                <p>
                    ${escapeHTML(email)}
                </p>

            </div>

            <div class="customer-detail-grid">

                <div>
                    <strong>
                        Email
                    </strong>

                    <span>
                        ${escapeHTML(email)}
                    </span>
                </div>

                <div>
                    <strong>
                        Phone
                    </strong>

                    <span>
                        ${escapeHTML(
                            getCustomerPhone(
                                customer
                            )
                        )}
                    </span>
                </div>

                <div>
                    <strong>
                        Orders
                    </strong>

                    <span>
                        ${customerOrders.length}
                    </span>
                </div>

                <div>
                    <strong>
                        Total Spent
                    </strong>

                    <span>
                        ${formatPrice(
                            totalSpent
                        )}
                    </span>
                </div>

            </div>

            <div>

                <h3>
                    Recent Orders
                </h3>

                ${
                    customerOrders.length
                        ? customerOrders
                            .slice(0, 10)
                            .map(
                                order => `
                                    <div
                                        class="customer-order-row"
                                    >

                                        <span>
                                            #${escapeHTML(
                                                order.id
                                            )}
                                        </span>

                                        <span>
                                            ${formatPrice(
                                                getOrderAmount(
                                                    order
                                                )
                                            )}
                                        </span>

                                        <span>
                                            ${escapeHTML(
                                                getOrderStatus(
                                                    order
                                                )
                                            )}
                                        </span>

                                    </div>
                                `
                            )
                            .join("")
                        : `
                            <p>
                                No orders found.
                            </p>
                        `
                }

            </div>
        `;

        if (customerModal) {

            customerModal.classList.add(
                "show"
            );

            customerModal.style.display =
                "flex";
        }
    }

    function closeCustomerModalFunction() {

        if (customerModal) {

            customerModal.classList.remove(
                "show"
            );

            customerModal.style.display =
                "";
        }

        selectedCustomer = null;
    }

    if (closeCustomerModal) {

        closeCustomerModal.addEventListener(
            "click",
            closeCustomerModalFunction
        );
    }

    if (closeCustomerModalBottom) {

        closeCustomerModalBottom.addEventListener(
            "click",
            closeCustomerModalFunction
        );
    }

    if (customerModal) {

        customerModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    customerModal
                ) {
                    closeCustomerModalFunction();
                }
            }
        );
    }

    // ============================================================
    // INVENTORY
    // ============================================================

    const inventoryContainer =
        $("inventoryContainer");

    const inventoryFilter =
        $("inventoryFilter");

    function renderInventory() {

        if (!inventoryContainer) {
            return;
        }

        const filter =
            inventoryFilter
                ? inventoryFilter.value
                : "all";

        const healthy =
            products.filter(
                p =>
                    safeNumber(p.stock) >
                    LOW_STOCK_LIMIT
            );

        const low =
            products.filter(
                p =>
                    safeNumber(p.stock) > 0 &&
                    safeNumber(p.stock) <=
                    LOW_STOCK_LIMIT
            );

        const out =
            products.filter(
                p =>
                    safeNumber(p.stock) <= 0
            );

        const healthyElement =
            $("inventoryHealthy");

        const lowElement =
            $("inventoryLow");

        const outElement =
            $("inventoryOut");

        if (healthyElement) {
            healthyElement.textContent =
                healthy.length;
        }

        if (lowElement) {
            lowElement.textContent =
                low.length;
        }

        if (outElement) {
            outElement.textContent =
                out.length;
        }

        let filtered =
            products.filter(product => {

                const stock =
                    safeNumber(
                        product.stock
                    );

                if (filter === "healthy") {
                    return stock >
                        LOW_STOCK_LIMIT;
                }

                if (filter === "low") {
                    return (
                        stock > 0 &&
                        stock <=
                        LOW_STOCK_LIMIT
                    );
                }

                if (filter === "out") {
                    return stock <= 0;
                }

                return true;
            });

        if (!filtered.length) {

            inventoryContainer.innerHTML =
                `<div class="empty">

                    <strong>
                        No products found
                    </strong>

                    <p>
                        Inventory information will appear here.
                    </p>

                </div>`;

            return;
        }

        inventoryContainer.innerHTML =
            filtered.map(product => {

                const stock =
                    safeNumber(
                        product.stock
                    );

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
                    <div class="inventory-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    "-"
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${stock}
                            </strong>

                            <span>
                                units
                            </span>

                        </div>

                        <div>

                            <span class="
                                inventory-status
                                ${statusClass}
                            ">
                                ${status}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="secondary-btn inventory-edit"
                            data-id="${escapeHTML(
                                product.id
                            )}"
                        >
                            EDIT
                        </button>

                    </div>
                `;

            }).join("");

        document
            .querySelectorAll(
                ".inventory-edit"
            )
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
    }

    // ============================================================
    // PAYMENTS
    // ============================================================

    function renderPayments() {

        const container =
            $("paymentsContainer");

        if (!container) {
            return;
        }

        const revenue =
            orders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        const successfulOrders =
            orders.filter(order => {

                const status =
                    getOrderStatus(
                        order
                    );

                return (
                    status === "Confirmed" ||
                    status === "Processing" ||
                    status === "Shipped" ||
                    status === "Delivered"
                );
            });

        const refunds =
            orders
                .filter(
                    order =>
                        getOrderStatus(
                            order
                        ) === "Returned"
                )
                .reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        getOrderAmount(
                            order
                        ),
                    0
                );

        const paymentRevenue =
            $("paymentRevenue");

        const paymentSuccessful =
            $("paymentSuccessful");

        const paymentRefunds =
            $("paymentRefunds");

        if (paymentRevenue) {
            paymentRevenue.textContent =
                formatPrice(revenue);
        }

        if (paymentSuccessful) {
            paymentSuccessful.textContent =
                successfulOrders.length;
        }

        if (paymentRefunds) {
            paymentRefunds.textContent =
                formatPrice(refunds);
        }

        if (!orders.length) {

            container.innerHTML =
                `<div class="empty">

                    <strong>
                        No transactions
                    </strong>

                    <p>
                        Payment information will appear after orders are created.
                    </p>

                </div>`;

            return;
        }

        container.innerHTML =
            sortOrders(orders)
                .slice(0, 50)
                .map(order => {

                    return `
                        <div
                            class="payment-row"
                        >

                            <div>

                                <strong>
                                    #${escapeHTML(
                                        order.id
                                    )}
                                </strong>

                                <span>
                                    ${formatDate(
                                        getOrderDate(
                                            order
                                        )
                                    )}
                                </span>

                            </div>

                            <div>

                                <strong>
                                    ${formatPrice(
                                        getOrderAmount(
                                            order
                                        )
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    ${escapeHTML(
                                        getOrderStatus(
                                            order
                                        )
                                    )}
                                </span>

                            </div>

                        </div>
                    `;

                }).join("");
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    function updateDashboard() {

        const totalRevenue =
            orders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

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

        if (salesCount) {
            salesCount.textContent =
                formatPrice(
                    totalRevenue
                );
        }

        if (sidebarProductBadge) {
            sidebarProductBadge.textContent =
                products.length;
        }

        if (sidebarOrderBadge) {
            sidebarOrderBadge.textContent =
                orders.length;
        }

        renderRecentOrders();
        renderTopProducts();
        renderOrderStatusChart();
        renderSalesChart();
    }

    // ============================================================
    // RECENT ORDERS
    // ============================================================

    function renderRecentOrders() {

        const container =
            $("recentOrders");

        if (!container) {
            return;
        }

        const recent =
            sortOrders(orders)
                .slice(0, 5);

        if (!recent.length) {

            container.innerHTML =
                `<div class="empty">

                    <strong>
                        No orders yet
                    </strong>

                    <p>
                        New orders will appear here.
                    </p>

                </div>`;

            return;
        }

        container.innerHTML =
            recent.map(order => {

                const name =
                    order.customer_name ||
                    order.name ||
                    order.full_name ||
                    "Customer";

                return `
                    <div
                        class="recent-order-row"
                    >

                        <div>

                            <strong>
                                #${escapeHTML(
                                    order.id
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    name
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatPrice(
                                    getOrderAmount(
                                        order
                                    )
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    getOrderStatus(
                                        order
                                    )
                                )}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");
    }

    // ============================================================
    // TOP PRODUCTS
    // ============================================================

    function renderTopProducts() {

        const container =
            $("topProducts");

        if (!container) {
            return;
        }

        if (!products.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>
                        No products
                    </strong>
                    <p>
                        Add products to see them here.
                    </p>
                </div>`;

            return;
        }

        const topProducts =
            products
                .slice()
                .sort(
                    (
                        a,
                        b
                    ) =>
                        safeNumber(
                            b.stock
                        ) -
                        safeNumber(
                            a.stock
                        )
                )
                .slice(0, 5);

        container.innerHTML =
            topProducts.map(
                product => {

                    return `
                        <div
                            class="top-product-row"
                        >

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        product.category ||
                                        "-"
                                    )}
                                </span>

                            </div>

                            <strong>
                                ${formatPrice(
                                    product.price
                                )}
                            </strong>

                        </div>
                    `;

                }
            ).join("");
    }

    // ============================================================
    // ORDER STATUS CHART
    // ============================================================

    function renderOrderStatusChart() {

        const chart =
            $("orderStatusChart");

        const legend =
            $("orderStatusLegend");

        if (!chart) {
            return;
        }

        const statuses = [
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Returned"
        ];

        const values =
            statuses.map(
                status =>
                    orders.filter(
                        order =>
                            getOrderStatus(
                                order
                            ) === status
                    ).length
            );

        const total =
            values.reduce(
                (a, b) =>
                    a + b,
                0
            );

        if (!total) {

            chart.innerHTML =
                `<div class="chart-empty">
                    No order data
                </div>`;

            if (legend) {
                legend.innerHTML = "";
            }

            return;
        }

        const radius = 45;

        const circumference =
            2 *
            Math.PI *
            radius;

        let offset = 0;

        const segments =
            values
                .map(
                    (
                        value,
                        index
                    ) => {

                        if (!value) {
                            return "";
                        }

                        const length =
                            (
                                value /
                                total
                            ) *
                            circumference;

                        const segment = `
                            <circle
                                cx="60"
                                cy="60"
                                r="${radius}"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="18"
                                stroke-dasharray="
                                    ${length}
                                    ${circumference - length}
                                "
                                stroke-dashoffset="${-offset}"
                            ></circle>
                        `;

                        offset += length;

                        return segment;
                    }
                )
                .join("");

        chart.innerHTML = `

            <div
                class="donut-visual"
                style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                "
            >

                <svg
                    width="150"
                    height="150"
                    viewBox="0 0 120 120"
                    style="transform:rotate(-90deg);"
                >

                    <circle
                        cx="60"
                        cy="60"
                        r="${radius}"
                        fill="none"
                        stroke="currentColor"
                        stroke-opacity=".12"
                        stroke-width="18"
                    ></circle>

                    ${segments}

                </svg>

                <div
                    style="
                        position:absolute;
                        text-align:center;
                    "
                >

                    <strong>
                        ${total}
                    </strong>

                    <small>
                        Orders
                    </small>

                </div>

            </div>
        `;

        if (legend) {

            legend.innerHTML =
                statuses.map(
                    (
                        status,
                        index
                    ) => {

                        return `
                            <div
                                class="legend-item"
                            >

                                <span>
                                    ${escapeHTML(
                                        status
                                    )}
                                </span>

                                <strong>
                                    ${values[index]}
                                </strong>

                            </div>
                        `;
                    }
                ).join("");
        }
    }

    // ============================================================
    // SALES CHART
    // ============================================================

    function renderSalesChart() {

        const container =
            $("salesChart");

        if (!container) {
            return;
        }

        const days =
            Number(salesPeriod) || 7;

        const data = [];

        for (
            let i = days - 1;
            i >= 0;
            i--
        ) {

            const date =
                new Date();

            date.setHours(
                0,
                0,
                0,
                0
            );

            date.setDate(
                date.getDate() - i
            );

            const next =
                new Date(date);

            next.setDate(
                next.getDate() + 1
            );

            const revenue =
                orders
                    .filter(order => {

                        const orderDate =
                            new Date(
                                getOrderDate(
                                    order
                                )
                            );

                        return (
                            orderDate >=
                            date &&
                            orderDate <
                            next
                        );
                    })
                    .reduce(
                        (
                            total,
                            order
                        ) =>
                            total +
                            getOrderAmount(
                                order
                            ),
                        0
                    );

            data.push({
                date,
                revenue
            });
        }

        const max =
            Math.max(
                ...data.map(
                    item =>
                        item.revenue
                ),
                1
            );

        const width =
            700;

        const height =
            260;

        const padding =
            35;

        const graphWidth =
            width -
            padding * 2;

        const graphHeight =
            height -
            padding * 2;

        const points =
            data.map(
                (
                    item,
                    index
                ) => {

                    const x =
                        padding +
                        (
                            index /
                            Math.max(
                                data.length - 1,
                                1
                            )
                        ) *
                        graphWidth;

                    const y =
                        height -
                        padding -
                        (
                            item.revenue /
                            max
                        ) *
                        graphHeight;

                    return {
                        x,
                        y,
                        item
                    };
                }
            );

        const path =
            points
                .map(
                    (
                        point,
                        index
                    ) =>
                        (
                            index === 0
                                ? "M"
                                : "L"
                        ) +
                        `${point.x} ${point.y}`
                )
                .join(" ");

        container.innerHTML = `

            <div
                style="
                    width:100%;
                    overflow-x:auto;
                "
            >

                <svg
                    viewBox="0 0 ${width} ${height}"
                    width="100%"
                    height="260"
                    preserveAspectRatio="none"
                >

                    <line
                        x1="${padding}"
                        y1="${height - padding}"
                        x2="${width - padding}"
                        y2="${height - padding}"
                        stroke="currentColor"
                        opacity=".2"
                    ></line>

                    <line
                        x1="${padding}"
                        y1="${padding}"
                        x2="${padding}"
                        y2="${height - padding}"
                        stroke="currentColor"
                        opacity=".2"
                    ></line>

                    <path
                        d="${path}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                    ></path>

                    ${
                        points.map(
                            point =>
                                `
                                    <circle
                                        cx="${point.x}"
                                        cy="${point.y}"
                                        r="4"
                                        fill="currentColor"
                                    ></circle>
                                `
                        ).join("")
                    }

                </svg>

            </div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    overflow:hidden;
                    font-size:12px;
                "
            >

                ${data.map(
                    item =>
                        `
                            <span>
                                ${item.date.toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short"
                                    }
                                )}
                            </span>
                        `
                ).join("")}

            </div>
        `;
    }

    // ============================================================
    // ANALYTICS
    // ============================================================

    function renderAnalytics() {

        const revenueChart =
            $("analyticsRevenueChart");

        const categoryChart =
            $("categoryChart");

        const analyticsSummary =
            $("analyticsSummary");

        const revenue =
            orders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        const averageOrder =
            orders.length
                ? revenue /
                    orders.length
                : 0;

        const categoryMap =
            {};

        products.forEach(product => {

            const category =
                product.category ||
                "Other";

            categoryMap[category] =
                (
                    categoryMap[category] ||
                    0
                ) + 1;
        });

        if (revenueChart) {

            revenueChart.innerHTML =
                `<div class="chart-empty">
                    Total Revenue:
                    <strong>
                        ${formatPrice(
                            revenue
                        )}
                    </strong>
                </div>`;
        }

        if (categoryChart) {

            const entries =
                Object.entries(
                    categoryMap
                );

            if (!entries.length) {

                categoryChart.innerHTML =
                    `<div class="chart-empty">
                        No category data
                    </div>`;

            } else {

                categoryChart.innerHTML =
                    entries.map(
                        (
                            [category, count]
                        ) => {

                            const percentage =
                                products.length
                                    ? (
                                        count /
                                        products.length
                                    ) * 100
                                    : 0;

                            return `
                                <div
                                    style="
                                        margin-bottom:14px;
                                    "
                                >

                                    <div
                                        style="
                                            display:flex;
                                            justify-content:space-between;
                                            margin-bottom:5px;
                                        "
                                    >

                                        <span>
                                            ${escapeHTML(
                                                category
                                            )}
                                        </span>

                                        <strong>
                                            ${count}
                                        </strong>

                                    </div>

                                    <div
                                        style="
                                            height:8px;
                                            background:rgba(127,127,127,.15);
                                            border-radius:10px;
                                            overflow:hidden;
                                        "
                                    >

                                        <div
                                            style="
                                                width:${percentage}%;
                                                height:100%;
                                                background:currentColor;
                                            "
                                        ></div>

                                    </div>

                                </div>
                            `;
                        }
                    ).join("");
            }
        }

        if (analyticsSummary) {

            analyticsSummary.innerHTML = `

                <div class="analytics-summary-card">

                    <span>
                        Total Revenue
                    </span>

                    <strong>
                        ${formatPrice(
                            revenue
                        )}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Total Orders
                    </span>

                    <strong>
                        ${orders.length}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Average Order
                    </span>

                    <strong>
                        ${formatPrice(
                            averageOrder
                        )}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Products
                    </span>

                    <strong>
                        ${products.length}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Customers
                    </span>

                    <strong>
                        ${customers.length}
                    </strong>

                </div>
            `;
        }
    }

    // ============================================================
    // SALES PERIOD
    // ============================================================

    const salesPeriodSelect =
        $("salesPeriod");

    if (salesPeriodSelect) {

        salesPeriodSelect.addEventListener(
            "change",
            () => {

                salesPeriod =
                    Number(
                        salesPeriodSelect.value
                    ) || 7;

                renderSalesChart();
            }
        );
    }

    // ============================================================
    // SEARCH EVENTS
    // ============================================================

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

    if (productSort) {

        productSort.addEventListener(
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

    if (orderSort) {

        orderSort.addEventListener(
            "change",
            renderOrders
        );
    }

    if (customerSearch) {

        customerSearch.addEventListener(
            "input",
            renderCustomers
        );
    }

    if (customerSort) {

        customerSort.addEventListener(
            "change",
            renderCustomers
        );
    }

    if (inventoryFilter) {

        inventoryFilter.addEventListener(
            "change",
            renderInventory
        );
    }

    // ============================================================
    // REFRESH BUTTONS
    // ============================================================

    const refreshDashboard =
        $("refreshDashboard");

    const refreshOrders =
        $("refreshOrders");

    const refreshCustomers =
        $("refreshCustomers");

    const inventoryRefresh =
        $("inventoryRefresh");

    if (refreshDashboard) {

        refreshDashboard.addEventListener(
            "click",
            async () => {

                showToast(
                    "Refreshing dashboard..."
                );

                await Promise.all([
                    loadProducts(),
                    loadOrders(),
                    loadCustomers()
                ]);

                showToast(
                    "Dashboard refreshed."
                );
            }
        );
    }

    if (refreshOrders) {

        refreshOrders.addEventListener(
            "click",
            async () => {

                await loadOrders();

                showToast(
                    "Orders refreshed."
                );
            }
        );
    }

    if (refreshCustomers) {

        refreshCustomers.addEventListener(
            "click",
            async () => {

                await loadCustomers();

                showToast(
                    "Customers refreshed."
                );
            }
        );
    }

    if (inventoryRefresh) {

        inventoryRefresh.addEventListener(
            "click",
            async () => {

                await loadProducts();

                showToast(
                    "Inventory refreshed."
                );
            }
        );
    }

    // ============================================================
    // GLOBAL SEARCH
    // ============================================================

    const headerSearchBtn =
        $("headerSearchBtn");

    const globalSearch =
        $("globalSearch");

    const globalSearchInput =
        $("globalSearchInput");

    const closeGlobalSearch =
        $("closeGlobalSearch");

    if (headerSearchBtn) {

        headerSearchBtn.addEventListener(
            "click",
            () => {

                if (globalSearch) {

                    globalSearch.classList.add(
                        "show"
                    );
                }

                if (globalSearchInput) {
                    globalSearchInput.focus();
                }
            }
        );
    }

    if (closeGlobalSearch) {

        closeGlobalSearch.addEventListener(
            "click",
            () => {

                globalSearch?.classList.remove(
                    "show"
                );
            }
        );
    }

    if (globalSearchInput) {

        globalSearchInput.addEventListener(
            "input",
            () => {

                const query =
                    globalSearchInput.value
                        .trim()
                        .toLowerCase();

                if (!query) {
                    return;
                }

                const productMatch =
                    products.find(
                        product =>
                            String(
                                product.name ||
                                ""
                            )
                                .toLowerCase()
                                .includes(query)
                    );

                if (productMatch) {

                    openSection(
                        "products"
                    );

                    if (productSearch) {

                        productSearch.value =
                            query;

                        renderProducts();
                    }

                    return;
                }

                const orderMatch =
                    orders.find(
                        order =>
                            String(
                                order.id ||
                                ""
                            )
                                .toLowerCase()
                                .includes(query) ||
                            String(
                                order.customer_name ||
                                order.name ||
                                ""
                            )
                                .toLowerCase()
                                .includes(query)
                    );

                if (orderMatch) {

                    openSection(
                        "orders"
                    );

                    if (orderSearch) {

                        orderSearch.value =
                            query;

                        renderOrders();
                    }
                }
            }
        );
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    const notificationBtn =
        $("notificationBtn");

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                const lowStock =
                    products.filter(
                        product =>
                            safeNumber(
                                product.stock
                            ) <=
                            LOW_STOCK_LIMIT
                    ).length;

                const pendingOrders =
                    orders.filter(
                        order => {

                            const status =
                                getOrderStatus(
                                    order
                                );

                            return (
                                status ===
                                    "Confirmed" ||
                                status ===
                                    "Processing"
                            );
                        }
                    ).length;

                alert(
                    "FASHION Notifications\n\n" +
                    `Low stock products: ${lowStock}\n` +
                    `Pending orders: ${pendingOrders}`
                );
            }
        );
    }

    // ============================================================
    // MARKETING BUTTONS
    // ============================================================

    const createCouponBtn =
        $("createCouponBtn");

    const marketingCouponAction =
        $("marketingCouponAction");

    const bannerManagementBtn =
        $("bannerManagementBtn");

    const marketingNotificationBtn =
        $("marketingNotificationBtn");

    if (createCouponBtn) {

        createCouponBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Coupon module is ready. Connect a coupons table to enable live coupons.",
                    "warning"
                );
            }
        );
    }

    if (marketingCouponAction) {

        marketingCouponAction.addEventListener(
            "click",
            () => {

                showToast(
                    "Coupon management requires a coupons table.",
                    "warning"
                );
            }
        );
    }

    if (bannerManagementBtn) {

        bannerManagementBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Banner management can be connected to your storefront.",
                    "warning"
                );
            }
        );
    }

    if (marketingNotificationBtn) {

        marketingNotificationBtn.addEventListener(
            "click",
            () => {

                openSection(
                    "settings"
                );
            }
        );
    }

    // ============================================================
    // REVIEWS
    // ============================================================

    async function loadReviews() {

        const container =
            $("reviewsContainer");

        if (!container) {
            return;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("reviews")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {

                container.innerHTML =
                    `<div class="empty">

                        <strong>
                            Reviews module ready
                        </strong>

                        <p>
                            Connect a reviews table in Supabase to enable live moderation.
                        </p>

                    </div>`;

                return;
            }

            const reviews =
                Array.isArray(data)
                    ? data
                    : [];

            const reviewCount =
                $("reviewCount");

            const averageRating =
                $("averageRating");

            const pendingReviews =
                $("pendingReviews");

            if (reviewCount) {
                reviewCount.textContent =
                    reviews.length;
            }

            const ratings =
                reviews
                    .map(
                        review =>
                            safeNumber(
                                review.rating
                            )
                    )
                    .filter(
                        rating =>
                            rating > 0
                    );

            const average =
                ratings.length
                    ? ratings.reduce(
                        (
                            a,
                            b
                        ) =>
                            a + b,
                        0
                    ) /
                    ratings.length
                    : 0;

            if (averageRating) {

                averageRating.textContent =
                    average
                        ? average.toFixed(1)
                        : "0.0";
            }

            const pending =
                reviews.filter(
                    review =>
                        String(
                            review.status ||
                            ""
                        ).toLowerCase() ===
                        "pending"
                ).length;

            if (pendingReviews) {
                pendingReviews.textContent =
                    pending;
            }

            if (!reviews.length) {

                container.innerHTML =
                    `<div class="empty">

                        <strong>
                            No reviews yet
                        </strong>

                        <p>
                            Customer reviews will appear here.
                        </p>

                    </div>`;

                return;
            }

            container.innerHTML =
                reviews.map(
                    review => {

                        return `
                            <div
                                class="review-row"
                            >

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            review.name ||
                                            review.customer_name ||
                                            "Customer"
                                        )}
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            review.comment ||
                                            review.review ||
                                            ""
                                        )}
                                    </p>

                                </div>

                                <div>
                                    ★
                                    ${safeNumber(
                                        review.rating
                                    )}
                                </div>

                            </div>
                        `;
                    }
                ).join("");

        } catch (error) {

            console.error(
                "Reviews error:",
                error
            );
        }
    }

    // ============================================================
    // SETTINGS
    // ============================================================

    const saveSettingsBtn =
        $("saveSettingsBtn");

    const settingsAdminName =
        $("settingsAdminName");

    const newOrderNotifications =
        $("newOrderNotifications");

    const lowStockNotifications =
        $("lowStockNotifications");

    const marketingNotifications =
        $("marketingNotifications");

    const savedAdminName =
        localStorage.getItem(
            "fashionAdminName"
        );

    if (
        savedAdminName &&
        settingsAdminName
    ) {
        settingsAdminName.value =
            savedAdminName;
    }

    if (saveSettingsBtn) {

        saveSettingsBtn.addEventListener(
            "click",
            () => {

                const name =
                    settingsAdminName
                        ?.value
                        .trim() ||
                    "Administrator";

                localStorage.setItem(
                    "fashionAdminName",
                    name
                );

                showToast(
                    "Settings saved successfully."
                );
            }
        );
    }

    function loadNotificationSettings() {

        const settings =
            JSON.parse(
                localStorage.getItem(
                    "fashionAdminNotifications"
                ) ||
                "{}"
            );

        if (
            newOrderNotifications &&
            typeof settings.newOrders ===
            "boolean"
        ) {

            newOrderNotifications.checked =
                settings.newOrders;
        }

        if (
            lowStockNotifications &&
            typeof settings.lowStock ===
            "boolean"
        ) {

            lowStockNotifications.checked =
                settings.lowStock;
        }

        if (
            marketingNotifications &&
            typeof settings.marketing ===
            "boolean"
        ) {

            marketingNotifications.checked =
                settings.marketing;
        }
    }

    function saveNotificationSettings() {

        localStorage.setItem(
            "fashionAdminNotifications",
            JSON.stringify({

                newOrders:
                    newOrderNotifications
                        ?.checked ??
                    true,

                lowStock:
                    lowStockNotifications
                        ?.checked ??
                    true,

                marketing:
                    marketingNotifications
                        ?.checked ??
                    false
            })
        );
    }

    [
        newOrderNotifications,
        lowStockNotifications,
        marketingNotifications
    ]
        .forEach(
            checkbox => {

                checkbox?.addEventListener(
                    "change",
                    saveNotificationSettings
                );
            }
        );

    loadNotificationSettings();

    // ============================================================
    // EXPORT CSV
    // ============================================================

    const exportReportBtn =
        $("exportReportBtn");

    function downloadCSV(
        filename,
        rows
    ) {

        if (!rows.length) {

            showToast(
                "No data available to export.",
                "warning"
            );

            return;
        }

        const headers =
            Object.keys(
                rows[0]
            );

        const csvRows = [
            headers.join(",")
        ];

        rows.forEach(row => {

            csvRows.push(
                headers.map(
                    header => {

                        const value =
                            String(
                                row[header] ??
                                ""
                            );

                        return `"${value
                            .replace(
                                /"/g,
                                '""'
                            )}"`;
                    }
                ).join(",")
            );
        });

        const blob =
            new Blob(
                [
                    csvRows.join("\n")
                ],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;
        link.download = filename;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url
        );
    }

    if (exportReportBtn) {

        exportReportBtn.addEventListener(
            "click",
            () => {

                const rows =
                    orders.map(
                        order => ({

                            order_id:
                                order.id,

                            customer:
                                order.customer_name ||
                                order.name ||
                                order.full_name ||
                                "",

                            email:
                                order.customer_email ||
                                order.email ||
                                "",

                            phone:
                                order.customer_phone ||
                                order.phone ||
                                "",

                            amount:
                                getOrderAmount(
                                    order
                                ),

                            status:
                                getOrderStatus(
                                    order
                                ),

                            date:
                                getOrderDate(
                                    order
                                )
                        })
                    );

                downloadCSV(
                    "fashion-orders-report.csv",
                    rows
                );

                showToast(
                    "CSV report exported."
                );
            }
        );
    }

    // ============================================================
    // KEYBOARD SHORTCUTS
    // ============================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeProductModalFunction();
                closeOrderModalFunction();
                closeCustomerModalFunction();
                closeBulkUpload();

                globalSearch?.classList.remove(
                    "show"
                );

                closeMobileSidebar();
            }

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                globalSearch?.classList.add(
                    "show"
                );

                globalSearchInput?.focus();
            }
        }
    );

    // ============================================================
    // WINDOW RESIZE
    // ============================================================

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                900
            ) {
                closeMobileSidebar();
            }
        }
    );

    // ============================================================
    // SUPABASE AUTH STATE
    // ============================================================

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            if (
                event === "SIGNED_OUT"
            ) {

                window.location.replace(
                    "admin-login.html"
                );
            }

            if (
                event === "SIGNED_IN" &&
                session?.user?.email
            ) {

                const email =
                    session.user.email
                        .toLowerCase();

                if (
                    email !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    supabaseClient.auth.signOut();

                    window.location.replace(
                        "admin-login.html"
                    );
                }
            }
        }
    );

    // ============================================================
    // INITIALIZE DASHBOARD
    // ============================================================

    try {

        const authenticated =
            await checkAdminSession();

        if (!authenticated) {
            return;
        }

        await Promise.all([
            loadProducts(),
            loadOrders()
        ]);

        await loadCustomers();

        await loadReviews();

        updateDashboard();

        renderInventory();

        renderPayments();

        renderAnalytics();

        hideLoadingScreen();

        console.log(
            "FASHION Admin Dashboard initialized successfully."
        );

    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

        hideLoadingScreen();

        showToast(
            error.message ||
            "Dashboard initialization failed.",
            "error"
        );
    }

});