// =====================================================
// ADMIN PRODUCT MANAGEMENT
// SUPABASE STORAGE + SUPABASE DATABASE
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    // =====================================================
    // CHECK SUPABASE
    // =====================================================

    if (
        typeof supabaseClient === "undefined"
    ) {

        console.error(
            "supabaseClient is not defined."
        );

        alert(
            "Supabase is not connected. Please check supabase.js."
        );

        return;

    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const addProductBtn =
        document.getElementById(
            "addProductBtn"
        );

    const adminProductList =
        document.getElementById(
            "adminProductList"
        );


    // =====================================================
    // PRODUCTS
    // =====================================================

    let products = [];


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    async function loadProducts() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("products")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                console.error(
                    "Product loading error:",
                    error
                );

                alert(
                    "Products could not be loaded: " +
                    error.message
                );

                return;

            }


            products =
                Array.isArray(data)
                    ? data
                    : [];


            displayProducts();


        } catch (error) {

            console.error(
                "Unexpected loading error:",
                error
            );

            alert(
                "Something went wrong while loading products."
            );

        }

    }


    // =====================================================
    // DISPLAY PRODUCTS
    // =====================================================

    function displayProducts() {

        if (!adminProductList) {
            return;
        }


        adminProductList.innerHTML = "";


        if (products.length === 0) {

            adminProductList.innerHTML = `

                <div class="admin-empty">

                    <h3>
                        No products yet
                    </h3>

                    <p>
                        Click "+ ADD PRODUCT" to add your first product.
                    </p>

                </div>

            `;

            return;

        }


        products.forEach(function (product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-product-card";


            // =========================
            // SIZES
            // =========================

            let sizes = [];


            if (Array.isArray(product.sizes)) {

                sizes =
                    product.sizes;

            } else if (
                typeof product.sizes === "string"
            ) {

                try {

                    sizes =
                        JSON.parse(
                            product.sizes
                        );

                } catch (error) {

                    sizes = [];

                }

            }


            // =========================
            // PRICE
            // =========================

            const price =
                Number(
                    product.price || 0
                );


            // =========================
            // CARD
            // =========================

            card.innerHTML = `

                <div class="admin-product-image">

                    <img
                        src="${product.image || ""}"
                        alt="${product.name || "Product"}"
                    >

                </div>


                <div class="admin-product-info">

                    <span class="admin-product-category">

                        ${product.gender || "Unisex"}

                        ·

                        ${product.category || "Fashion"}

                    </span>


                    <h3>
                        ${product.name || "Product"}
                    </h3>


                    <strong>
                        ₹${price.toLocaleString("en-IN")}
                    </strong>


                    <p>
                        Stock:
                        ${product.stock || 0}
                    </p>


                    <p>

                        Sizes:

                        ${
                            sizes.length
                                ? sizes.join(", ")
                                : "Not specified"
                        }

                    </p>

                </div>


                <div class="admin-product-actions">

                    <button
                        type="button"
                        class="edit-product-btn"
                        data-id="${product.id}"
                    >
                        EDIT
                    </button>


                    <button
                        type="button"
                        class="delete-product-btn"
                        data-id="${product.id}"
                    >
                        DELETE
                    </button>

                </div>

            `;


            adminProductList.appendChild(
                card
            );

        });


        attachProductEvents();

    }


    // =====================================================
    // OPEN ADD PRODUCT FORM
    // =====================================================

    function openAddProductForm() {

        const oldModal =
            document.getElementById(
                "productModal"
            );


        if (oldModal) {
            oldModal.remove();
        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "productModal";


        modal.className =
            "product-modal";


        modal.innerHTML = `

            <div class="product-modal-box">


                <!-- HEADER -->

                <div class="product-modal-header">

                    <div>

                        <p>
                            CATALOG
                        </p>

                        <h2>
                            Add New Product
                        </h2>

                    </div>


                    <button
                        type="button"
                        id="closeProductModal"
                        class="product-modal-close"
                    >
                        ×
                    </button>

                </div>


                <!-- FORM -->

                <form id="productForm">


                    <!-- PRODUCT NAME -->

                    <div class="product-form-group">

                        <label for="productName">
                            Product Name
                        </label>

                        <input
                            type="text"
                            id="productName"
                            placeholder="Example: Premium Hoodie"
                            required
                        >

                    </div>


                    <!-- PRICE + STOCK -->

                    <div class="product-form-row">

                        <div class="product-form-group">

                            <label for="productPrice">
                                Price
                            </label>

                            <input
                                type="number"
                                id="productPrice"
                                placeholder="2499"
                                min="1"
                                required
                            >

                        </div>


                        <div class="product-form-group">

                            <label for="productStock">
                                Stock
                            </label>

                            <input
                                type="number"
                                id="productStock"
                                placeholder="20"
                                min="0"
                                required
                            >

                        </div>

                    </div>


                    <!-- GENDER -->

                    <div class="product-form-group">

                        <label for="productGender">
                            Gender
                        </label>

                        <select
                            id="productGender"
                            required
                        >

                            <option value="">
                                Select Gender
                            </option>

                            <option value="men">
                                Men
                            </option>

                            <option value="women">
                                Women
                            </option>

                            <option value="unisex">
                                Unisex
                            </option>

                        </select>

                    </div>


                    <!-- CATEGORY -->

                    <div class="product-form-group">

                        <label for="productCategory">
                            Category
                        </label>

                        <select
                            id="productCategory"
                            required
                        >

                            <option value="">
                                Select Category
                            </option>

                            <option value="T-Shirts">
                                T-Shirts
                            </option>

                            <option value="Shirts">
                                Shirts
                            </option>

                            <option value="Hoodies">
                                Hoodies
                            </option>

                            <option value="Jackets">
                                Jackets
                            </option>

                            <option value="Jeans">
                                Jeans
                            </option>

                            <option value="Trousers">
                                Trousers
                            </option>

                            <option value="Dresses">
                                Dresses
                            </option>

                            <option value="Skirts">
                                Skirts
                            </option>

                            <option value="Tops">
                                Tops
                            </option>

                            <option value="Accessories">
                                Accessories
                            </option>

                        </select>

                    </div>


                    <!-- PRODUCT IMAGE -->

                    <div class="product-form-group">

                        <label for="productImageFile">
                            Product Image
                        </label>

                        <input
                            type="file"
                            id="productImageFile"
                            accept="image/*"
                            required
                        >

                        <small>
                            Choose product image from your computer.
                        </small>

                        <div
                            id="imagePreview"
                            class="product-image-preview"
                        ></div>

                    </div>


                    <!-- SIZES -->

                    <div class="product-form-group">

                        <label>
                            Available Sizes
                        </label>


                        <div class="product-size-options">

                            <label>
                                <input
                                    type="checkbox"
                                    value="XS"
                                    class="product-size"
                                >
                                XS
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    value="S"
                                    class="product-size"
                                >
                                S
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    value="M"
                                    class="product-size"
                                >
                                M
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    value="L"
                                    class="product-size"
                                >
                                L
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    value="XL"
                                    class="product-size"
                                >
                                XL
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    value="XXL"
                                    class="product-size"
                                >
                                XXL
                            </label>

                        </div>

                    </div>


                    <!-- NEW ARRIVAL -->

                    <div class="product-form-group">

                        <label>

                            <input
                                type="checkbox"
                                id="productNewArrival"
                            >

                            Mark as New Arrival

                        </label>

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="product-form-group">

                        <label for="productDescription">
                            Description
                        </label>


                        <textarea
                            id="productDescription"
                            rows="4"
                            placeholder="Write product description..."
                        ></textarea>

                    </div>


                    <!-- BUTTONS -->

                    <div class="product-form-actions">

                        <button
                            type="button"
                            id="cancelProduct"
                            class="admin-secondary-btn"
                        >
                            CANCEL
                        </button>


                        <button
                            type="submit"
                            class="admin-primary-btn"
                        >
                            SAVE PRODUCT
                        </button>

                    </div>


                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        // =================================================
        // CLOSE
        // =================================================

        const closeBtn =
            document.getElementById(
                "closeProductModal"
            );


        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closeProductForm
            );

        }


        // =================================================
        // CANCEL
        // =================================================

        const cancelBtn =
            document.getElementById(
                "cancelProduct"
            );


        if (cancelBtn) {

            cancelBtn.addEventListener(
                "click",
                closeProductForm
            );

        }


        // =================================================
        // IMAGE PREVIEW
        // =================================================

        const imageInput =
            document.getElementById(
                "productImageFile"
            );


        if (imageInput) {

            imageInput.addEventListener(
                "change",
                previewProductImage
            );

        }


        // =================================================
        // FORM SUBMIT
        // =================================================

        const form =
            document.getElementById(
                "productForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                saveNewProduct
            );

        }

    }


    // =====================================================
    // IMAGE PREVIEW
    // =====================================================

    function previewProductImage(event) {

        const file =
            event.target.files[0];


        const preview =
            document.getElementById(
                "imagePreview"
            );


        if (!preview) {
            return;
        }


        if (!file) {

            preview.innerHTML = "";

            return;

        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );

            event.target.value = "";

            preview.innerHTML = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function () {

                preview.innerHTML = `

                    <img
                        src="${reader.result}"
                        alt="Product Preview"
                    >

                `;

            };


        reader.readAsDataURL(
            file
        );

    }


    // =====================================================
    // GET SELECTED SIZES
    // =====================================================

    function getSelectedSizes() {

        return Array
            .from(
                document.querySelectorAll(
                    ".product-size:checked"
                )
            )
            .map(
                function (checkbox) {

                    return checkbox.value;

                }
            );

    }


    // =====================================================
    // UPLOAD IMAGE TO SUPABASE
    // =====================================================

    async function uploadProductImage(
        imageFile
    ) {

        const fileExtension =
            imageFile.name
                .split(".")
                .pop()
                .toLowerCase();


        const filePath =
            "products/" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10) +
            "." +
            fileExtension;


        const {
            error
        } =
            await supabaseClient
                .storage
                .from("product-images")
                .upload(
                    filePath,
                    imageFile,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );


        if (error) {

            throw error;

        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from("product-images")
                .getPublicUrl(
                    filePath
                );


        return {
            url:
                data.publicUrl,

            path:
                filePath
        };

    }


    // =====================================================
    // SAVE NEW PRODUCT
    // =====================================================

    async function saveNewProduct(event) {

        event.preventDefault();


        // =================================================
        // GET VALUES
        // =================================================

        const name =
            document
                .getElementById(
                    "productName"
                )
                .value
                .trim();


        const price =
            Number(
                document
                    .getElementById(
                        "productPrice"
                    )
                    .value
            );


        const stock =
            Number(
                document
                    .getElementById(
                        "productStock"
                    )
                    .value
            );


        const gender =
            document
                .getElementById(
                    "productGender"
                )
                .value;


        const category =
            document
                .getElementById(
                    "productCategory"
                )
                .value;


        const description =
            document
                .getElementById(
                    "productDescription"
                )
                .value
                .trim();


        const isNew =
            document
                .getElementById(
                    "productNewArrival"
                )
                .checked;


        const imageInput =
            document.getElementById(
                "productImageFile"
            );


        const imageFile =
            imageInput.files[0];


        const sizes =
            getSelectedSizes();


        // =================================================
        // VALIDATION
        // =================================================

        if (!name) {

            alert(
                "Please enter product name."
            );

            return;

        }


        if (!price || price < 1) {

            alert(
                "Please enter a valid price."
            );

            return;

        }


        if (stock < 0) {

            alert(
                "Stock cannot be negative."
            );

            return;

        }


        if (!gender) {

            alert(
                "Please select Men, Women or Unisex."
            );

            return;

        }


        if (!category) {

            alert(
                "Please select a category."
            );

            return;

        }


        if (!imageFile) {

            alert(
                "Please select a product image."
            );

            return;

        }


        // =================================================
        // BUTTON LOADING
        // =================================================

        const submitButton =
            document.querySelector(
                "#productForm button[type='submit']"
            );


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "UPLOADING...";

        }


        try {

            // =============================================
            // UPLOAD IMAGE
            // =============================================

            const uploadedImage =
                await uploadProductImage(
                    imageFile
                );


            console.log(
                "Image uploaded:",
                uploadedImage.url
            );


            // =============================================
            // SAVE PRODUCT TO SUPABASE
            // =============================================

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("products")
                    .insert([
                        {
                            name:
                                name,

                            price:
                                price,

                            image:
                                uploadedImage.url,

                            category:
                                category,

                            description:
                                description,

                            sizes:
                                sizes,

                            stock:
                                stock,

                            gender:
                                gender,

                            is_new:
                                isNew
                        }
                    ])
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Product save error:",
                    error
                );


                alert(
                    "Product could not be saved: " +
                    error.message
                );


                return;

            }


            console.log(
                "Product saved:",
                data
            );


            alert(
                "Product added successfully!"
            );


            closeProductForm();


            // =============================================
            // RELOAD PRODUCTS
            // =============================================

            await loadProducts();


        } catch (error) {

            console.error(
                "Product save error:",
                error
            );


            alert(
                "Something went wrong: " +
                error.message
            );


        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "SAVE PRODUCT";

            }

        }

    }


    // =====================================================
    // CLOSE PRODUCT FORM
    // =====================================================

    function closeProductForm() {

        const modal =
            document.getElementById(
                "productModal"
            );


        if (modal) {

            modal.remove();

        }

    }


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async function deleteProduct(
        productId
    ) {

        const product =
            products.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        productId
                    );

                }
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        const confirmDelete =
            confirm(
                `Delete "${product.name}"?`
            );


        if (!confirmDelete) {
            return;
        }


        try {

            // =============================================
            // DELETE DATABASE PRODUCT
            // =============================================

            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "id",
                        productId
                    );


            if (error) {

                console.error(
                    "Delete product error:",
                    error
                );

                alert(
                    "Product could not be deleted: " +
                    error.message
                );

                return;

            }


            // =============================================
            // DELETE IMAGE FROM STORAGE
            // =============================================

            if (product.image) {

                try {

                    const imageUrl =
                        new URL(
                            product.image
                        );


                    const bucketName =
                        "product-images";


                    const marker =
                        "/" +
                        bucketName +
                        "/";


                    const imagePath =
                        imageUrl.pathname
                            .split(marker)[1];


                    if (imagePath) {

                        await supabaseClient
                            .storage
                            .from(
                                bucketName
                            )
                            .remove([
                                imagePath
                            ]);

                    }

                } catch (
                    imageError
                ) {

                    console.warn(
                        "Image delete warning:",
                        imageError
                    );

                }

            }


            alert(
                "Product deleted successfully!"
            );


            await loadProducts();


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Something went wrong: " +
                error.message
            );

        }

    }


    // =====================================================
    // EDIT PRODUCT
    // =====================================================

    function editProduct(
        productId
    ) {

        const product =
            products.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        productId
                    );

                }
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        openAddProductForm();


        // =============================================
        // TITLE
        // =============================================

        const heading =
            document.querySelector(
                "#productModal h2"
            );


        if (heading) {

            heading.textContent =
                "Edit Product";

        }


        // =============================================
        // FORM VALUES
        // =============================================

        document.getElementById(
            "productName"
        ).value =
            product.name || "";


        document.getElementById(
            "productPrice"
        ).value =
            product.price || "";


        document.getElementById(
            "productStock"
        ).value =
            product.stock || 0;


        document.getElementById(
            "productGender"
        ).value =
            product.gender || "unisex";


        document.getElementById(
            "productCategory"
        ).value =
            product.category || "";


        document.getElementById(
            "productDescription"
        ).value =
            product.description || "";


        document.getElementById(
            "productNewArrival"
        ).checked =
            product.is_new === true ||
            product.isNew === true;


        // =============================================
        // EXISTING IMAGE
        // =============================================

        const preview =
            document.getElementById(
                "imagePreview"
            );


        if (
            preview &&
            product.image
        ) {

            preview.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.name || "Product"}"
                >

                <p>
                    Current image. Select a new image only if you want to change it.
                </p>

            `;

        }


        // =============================================
        // IMAGE OPTIONAL
        // =============================================

        const imageInput =
            document.getElementById(
                "productImageFile"
            );


        imageInput.required =
            false;


        // =============================================
        // SIZES
        // =============================================

        let productSizes = [];


        if (
            Array.isArray(
                product.sizes
            )
        ) {

            productSizes =
                product.sizes;

        } else if (
            typeof product.sizes ===
            "string"
        ) {

            try {

                productSizes =
                    JSON.parse(
                        product.sizes
                    );

            } catch (error) {

                productSizes = [];

            }

        }


        document
            .querySelectorAll(
                ".product-size"
            )
            .forEach(
                function (checkbox) {

                    checkbox.checked =
                        productSizes.includes(
                            checkbox.value
                        );

                }
            );


        // =============================================
        // FORM
        // =============================================

        const form =
            document.getElementById(
                "productForm"
            );


        form.onsubmit =
            async function (event) {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "productName"
                        )
                        .value
                        .trim();


                const price =
                    Number(
                        document
                            .getElementById(
                                "productPrice"
                            )
                            .value
                    );


                const stock =
                    Number(
                        document
                            .getElementById(
                                "productStock"
                            )
                            .value
                    );


                const gender =
                    document
                        .getElementById(
                            "productGender"
                        )
                        .value;


                const category =
                    document
                        .getElementById(
                            "productCategory"
                        )
                        .value;


                const description =
                    document
                        .getElementById(
                            "productDescription"
                        )
                        .value
                        .trim();


                const isNew =
                    document
                        .getElementById(
                            "productNewArrival"
                        )
                        .checked;


                const sizes =
                    getSelectedSizes();


                const newImage =
                    imageInput.files[0];


                // =========================================
                // VALIDATION
                // =========================================

                if (!name) {

                    alert(
                        "Please enter product name."
                    );

                    return;

                }


                if (!price || price < 1) {

                    alert(
                        "Please enter a valid price."
                    );

                    return;

                }


                if (stock < 0) {

                    alert(
                        "Stock cannot be negative."
                    );

                    return;

                }


                // =========================================
                // BUTTON
                // =========================================

                const submitButton =
                    form.querySelector(
                        "button[type='submit']"
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "UPDATING...";

                }


                try {

                    let imageUrl =
                        product.image || "";


                    // =====================================
                    // NEW IMAGE
                    // =====================================

                    if (newImage) {

                        const uploadedImage =
                            await uploadProductImage(
                                newImage
                            );


                        imageUrl =
                            uploadedImage.url;

                    }


                    // =====================================
                    // UPDATE DATABASE
                    // =====================================

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("products")
                            .update(
                                {
                                    name:
                                        name,

                                    price:
                                        price,

                                    image:
                                        imageUrl,

                                    category:
                                        category,

                                    description:
                                        description,

                                    sizes:
                                        sizes,

                                    stock:
                                        stock,

                                    gender:
                                        gender,

                                    is_new:
                                        isNew
                                }
                            )
                            .eq(
                                "id",
                                product.id
                            );


                    if (error) {

                        console.error(
                            "Update error:",
                            error
                        );

                        alert(
                            "Product could not be updated: " +
                            error.message
                        );

                        return;

                    }


                    alert(
                        "Product updated successfully!"
                    );


                    closeProductForm();


                    await loadProducts();


                } catch (error) {

                    console.error(
                        "Edit error:",
                        error
                    );


                    alert(
                        "Something went wrong: " +
                        error.message
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "SAVE PRODUCT";

                    }

                }

            };

    }


    // =====================================================
    // PRODUCT EVENTS
    // =====================================================

    function attachProductEvents() {


        // =============================================
        // DELETE
        // =============================================

        document
            .querySelectorAll(
                ".delete-product-btn"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            deleteProduct(
                                button.dataset.id
                            );

                        }
                    );

                }
            );


        // =============================================
        // EDIT
        // =============================================

        document
            .querySelectorAll(
                ".edit-product-btn"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            editProduct(
                                button.dataset.id
                            );

                        }
                    );

                }
            );

    }


    // =====================================================
    // ADD PRODUCT BUTTON
    // =====================================================

    if (addProductBtn) {

        addProductBtn.addEventListener(
            "click",
            openAddProductForm
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadProducts();

});