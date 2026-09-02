import { useEffect, useState } from "react";

import {
    getProducts,
    createStockMovement,
    getStockMovements
} from "../services/api";


function Stock() {

    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);

    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        productId: "",
        quantity: "",
        type: "IN",
        reason: ""
    });


    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {

        try {

            const result = await getProducts();

            const productList =
                Array.isArray(result?.data?.products)
                    ? result.data.products
                    : [];

            setProducts(productList);

            return productList;

        } catch (error) {

            console.error(
                "Failed to load products:",
                error
            );

            setProducts([]);

            throw error;
        }
    };


    // =========================
    // LOAD STOCK MOVEMENTS
    // =========================

    const loadMovements = async (productList) => {

        try {

            let allMovements = [];

            for (const product of productList) {

                try {

                    const result =
                        await getStockMovements(
                            product.id
                        );

                    const productMovements =
                        Array.isArray(
                            result?.data?.movements
                        )
                            ? result.data.movements
                            : [];

                    /*
                     * Backend movement response contains
                     * movement information.
                     *
                     * Add product information manually
                     * so the table can display the name.
                     */

                    const movementsWithProduct =
                        productMovements.map(
                            (movement) => ({
                                ...movement,
                                product
                            })
                        );

                    allMovements.push(
                        ...movementsWithProduct
                    );

                } catch (error) {

                    console.error(
                        `Failed to load movements for product ${product.id}:`,
                        error
                    );
                }
            }


            // Newest movements first

            allMovements.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


            setMovements(allMovements);

        } catch (error) {

            console.error(
                "Failed to load stock movements:",
                error
            );

            setMovements([]);
        }
    };


    // =========================
    // LOAD EVERYTHING
    // =========================

    const loadData = async () => {

    try {

        const productResult = await getProducts();

        const productList =
            Array.isArray(productResult.data)
                ? productResult.data
                : [];

        setProducts(productList);

        // Load movements for selected product
        if (form.productId) {

            const movementResult =
                await getStockMovements(form.productId);

            setMovements(
                Array.isArray(movementResult.data?.movements)
                    ? movementResult.data.movements
                    : []
            );

        } else {

            setMovements([]);
        }

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
};

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        loadData();

    }, []);


    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = async (e) => {

    const { name, value } = e.target;

    setForm({
        ...form,
        [name]: value
    });

    if (name === "productId" && value) {

        try {

            const result =
                await getStockMovements(Number(value));

            setMovements(
                Array.isArray(result.data?.movements)
                    ? result.data.movements
                    : []
            );

        } catch (error) {

            console.error(error);

            setMovements([]);
        }
    }

    if (name === "productId" && !value) {
        setMovements([]);
    }
};


    // =========================
    // CREATE STOCK MOVEMENT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            if (!form.productId) {

                alert(
                    "Please select a product"
                );

                return;
            }


            if (!form.quantity) {

                alert(
                    "Please enter quantity"
                );

                return;
            }


            if (!form.reason.trim()) {

                alert(
                    "Please enter a reason"
                );

                return;
            }


            await createStockMovement(
    Number(form.productId),
    {
        quantity: Number(form.quantity),
        type: form.type,
        reason: form.reason
    }
);


            alert(
                `Stock ${
                    form.type === "IN"
                        ? "added"
                        : "removed"
                } successfully`
            );


            // Reset form

            setForm({

                productId: "",

                quantity: "",

                type: "IN",

                reason: ""

            });


            // Reload data

            await loadData();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Failed to create stock movement"
            );
        }
    };


    return (

        <div className="page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="page-header">

                <div>

                    <h1>
                        Stock / Inventory
                    </h1>

                    <p>
                        Manage stock movements.
                    </p>

                </div>

            </div>


            {/* =========================
                STOCK MOVEMENT FORM
            ========================= */}

            <div className="form-card">

                <h2>
                    Stock Movement
                </h2>


                <form
                    onSubmit={handleSubmit}
                >


                    {/* PRODUCT */}

                    <select
                        name="productId"
                        value={form.productId}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Product
                        </option>


                        {products.map(
                            (product) => (

                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name} -{" "}
                                    {product.sku}
                                </option>

                            )
                        )}

                    </select>


                    {/* TYPE */}

                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                    >

                        <option value="IN">
                            Stock IN
                        </option>

                        <option value="OUT">
                            Stock OUT
                        </option>

                    </select>


                    {/* QUANTITY */}

                    <input
                        name="quantity"
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        required
                    />


                    {/* REASON */}

                    <input
                        name="reason"
                        placeholder="Reason"
                        value={form.reason}
                        onChange={handleChange}
                        required
                    />


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        Add Movement
                    </button>

                </form>

            </div>


            {/* =========================
                CURRENT STOCK
            ========================= */}

            <h2>
                Current Inventory
            </h2>


            {loading ? (

                <p>
                    Loading inventory...
                </p>

            ) : products.length === 0 ? (

                <p>
                    No products found.
                </p>

            ) : (

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Product
                                </th>

                                <th>
                                    SKU
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Current Stock
                                </th>

                                <th>
                                    Minimum Stock
                                </th>

                                <th>
                                    Warehouse
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.map(
                                (product) => (

                                    <tr
                                        key={
                                            product.id
                                        }
                                    >

                                        <td>
                                            {
                                                product.name
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.sku
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.category
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.currentStock
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.minStock
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.warehouse
                                            }
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =========================
                STOCK MOVEMENTS
            ========================= */}

            <h2>
                Stock Movements
            </h2>


            {movements.length === 0 ? (

                <p>
                    No stock movements found.
                </p>

            ) : (

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Reason
                                </th>

                                <th>
                                    Date
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {movements.map(
                                (movement) => (

                                    <tr
                                        key={
                                            movement.id
                                        }
                                    >

                                        <td>

                                            {
                                                movement
                                                    .product
                                                    ?.name ||
                                                movement
                                                    .productId
                                            }

                                        </td>


                                        <td>
                                            {
                                                movement.quantity
                                            }
                                        </td>


                                        <td>
                                            {
                                                movement.type
                                            }
                                        </td>


                                        <td>
                                            {
                                                movement.reason
                                            }
                                        </td>


                                        <td>

                                            {
                                                movement.createdAt
                                                    ? new Date(
                                                        movement.createdAt
                                                    ).toLocaleString()
                                                    : "-"
                                            }

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}


export default Stock;