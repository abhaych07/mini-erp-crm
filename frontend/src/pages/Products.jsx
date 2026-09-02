import { useEffect, useState } from "react";

import {
    getProducts,
    createProduct,
    updateProduct
} from "../services/api";


function Products() {

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);


    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {

        try {

            setLoading(true);

            const result = await getProducts(search);

            // Backend response:
            // {
            //     success: true,
            //     data: {
            //         products: [],
            //         pagination: {}
            //     }
            // }

            setProducts(
                Array.isArray(result?.data?.products)
                    ? result.data.products
                    : []
            );

        } catch (error) {

            console.error(error);

            alert(error.message || "Failed to fetch products");

            setProducts([]);

        } finally {

            setLoading(false);
        }
    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        loadProducts();

    }, []);


    // =========================
    // SEARCH
    // =========================

    const handleSearch = async (e) => {

        e.preventDefault();

        await loadProducts();
    };


    // =========================
    // EDIT PRODUCT
    // =========================

    const handleEdit = (product) => {

        setEditingProduct(product);

        setShowForm(true);
    };


    // =========================
    // ADD / UPDATE PRODUCT
    // =========================

    const handleSubmit = async (formData) => {

        try {

            if (editingProduct) {

                await updateProduct(
                    editingProduct.id,
                    formData
                );

            } else {

                await createProduct(formData);
            }


            // Close form

            setShowForm(false);

            setEditingProduct(null);


            // Refresh products

            await loadProducts();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to save product"
            );
        }
    };


    return (

        <div className="page">


            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>

                    <h1>Products</h1>

                    <p>
                        Manage products and inventory.
                    </p>

                </div>


                <button
                    onClick={() => {

                        setEditingProduct(null);

                        setShowForm(true);

                    }}
                >
                    + Add Product
                </button>

            </div>


            {/* =========================
                SEARCH
            ========================= */}

            <form
                onSubmit={handleSearch}
                className="search-bar"
            >

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search products..."
                />

                <button type="submit">
                    Search
                </button>

            </form>


            {/* =========================
                PRODUCT FORM
            ========================= */}

            {showForm && (

                <ProductForm

                    product={editingProduct}

                    onSubmit={handleSubmit}

                    onCancel={() => {

                        setShowForm(false);

                        setEditingProduct(null);

                    }}

                />

            )}


            {/* =========================
                LOADING
            ========================= */}

            {loading ? (

                <p>
                    Loading products...
                </p>

            ) : products.length === 0 ? (

                <p>
                    No products found.
                </p>

            ) : (


                /* =========================
                   PRODUCTS TABLE
                ========================= */

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Name
                                </th>

                                <th>
                                    SKU
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Stock
                                </th>

                                <th>
                                    Min Stock
                                </th>

                                <th>
                                    Warehouse
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.map((product) => (

                                <tr
                                    key={product.id}
                                >

                                    <td>
                                        {product.name}
                                    </td>

                                    <td>
                                        {product.sku}
                                    </td>

                                    <td>
                                        {product.category}
                                    </td>

                                    <td>
                                        ₹{product.unitPrice}
                                    </td>

                                    <td>
                                        {product.currentStock}
                                    </td>

                                    <td>
                                        {product.minStock}
                                    </td>

                                    <td>
                                        {product.warehouse}
                                    </td>

                                    <td>

                                        <button
                                            onClick={() =>
                                                handleEdit(product)
                                            }
                                        >
                                            Edit
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}


/* =====================================================
   PRODUCT FORM
===================================================== */


function ProductForm({
    product,
    onSubmit,
    onCancel
}) {


    const [form, setForm] = useState({

        name:
            product?.name ||
            "",

        sku:
            product?.sku ||
            "",

        category:
            product?.category ||
            "",

        unitPrice:
            product?.unitPrice ||
            "",

        currentStock:
            product?.currentStock ??
            0,

        minStock:
            product?.minStock ??
            0,

        warehouse:
            product?.warehouse ||
            ""

    });


    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));
    };


    // =========================
    // SUBMIT FORM
    // =========================

    const handleSubmit = (e) => {

        e.preventDefault();


        onSubmit({

            ...form,

            unitPrice:
                Number(form.unitPrice),

            currentStock:
                Number(form.currentStock),

            minStock:
                Number(form.minStock)

        });
    };


    return (

        <div className="form-card">


            <h2>

                {product
                    ? "Edit Product"
                    : "Add Product"}

            </h2>


            <form
                onSubmit={handleSubmit}
            >


                {/* PRODUCT NAME */}

                <input
                    name="name"
                    placeholder="Product name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />


                {/* SKU */}

                <input
                    name="sku"
                    placeholder="SKU"
                    value={form.sku}
                    onChange={handleChange}
                    required
                />


                {/* CATEGORY */}

                <input
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                    required
                />


                {/* UNIT PRICE */}

                <input
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit price"
                    value={form.unitPrice}
                    onChange={handleChange}
                    required
                />


                {/* CURRENT STOCK */}

                <input
                    name="currentStock"
                    type="number"
                    min="0"
                    placeholder="Current stock"
                    value={form.currentStock}
                    onChange={handleChange}
                />


                {/* MINIMUM STOCK */}

                <input
                    name="minStock"
                    type="number"
                    min="0"
                    placeholder="Minimum stock"
                    value={form.minStock}
                    onChange={handleChange}
                />


                {/* WAREHOUSE */}

                <input
                    name="warehouse"
                    placeholder="Warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    required
                />


                {/* BUTTONS */}

                <div>

                    <button
                        type="submit"
                    >
                        Save
                    </button>


                    <button
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                </div>


            </form>

        </div>
    );
}


export default Products;