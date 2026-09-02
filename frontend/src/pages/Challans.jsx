import { useEffect, useState } from "react";
import {
    getChallans,
    createChallan,
    updateChallan,
    getCustomers,
    getProducts
} from "../services/api";

function Challans() {

    const [challans, setChallans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingChallan, setEditingChallan] = useState(null);

    const loadData = async () => {

        try {

            setLoading(true);

            const challanResult = await getChallans();

            console.log("Challans API response:", challanResult);

            const challanData =
                challanResult?.data?.challans;

            setChallans(
                Array.isArray(challanData)
                    ? challanData
                    : []
            );


            const customerResult = await getCustomers();

            const customerData =
                customerResult?.data?.customers;

            setCustomers(
                Array.isArray(customerData)
                    ? customerData
                    : []
            );


            const productResult = await getProducts();

            const productData =
                productResult?.data?.products ||
                productResult?.data;

            setProducts(
                Array.isArray(productData)
                    ? productData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load challans:",
                error
            );

            alert(error.message);

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadData();

    }, []);


    const handleEdit = (challan) => {

        setEditingChallan(challan);
        setShowForm(true);
    };


    const handleSubmit = async (formData) => {

        try {

            if (editingChallan) {

                await updateChallan(
                    editingChallan.id,
                    formData
                );

            } else {

                await createChallan(formData);
            }

            setShowForm(false);
            setEditingChallan(null);

            await loadData();

        } catch (error) {

            console.error(error);

            alert(error.message);
        }
    };


    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <h1>Sales Challans</h1>

                    <p>
                        Create and manage sales challans.
                    </p>

                </div>


                <button
                    onClick={() => {

                        setEditingChallan(null);
                        setShowForm(true);

                    }}
                >
                    + Create Challan
                </button>

            </div>


            {showForm && (

                <ChallanForm
                    challan={editingChallan}
                    customers={customers}
                    products={products}
                    onSubmit={handleSubmit}
                    onCancel={() => {

                        setShowForm(false);
                        setEditingChallan(null);

                    }}
                />

            )}


            {loading ? (

                <p>Loading challans...</p>

            ) : challans.length === 0 ? (

                <p>No challans found.</p>

            ) : (

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>Challan No.</th>

                                <th>Customer</th>

                                <th>Status</th>

                                <th>Total Quantity</th>

                                <th>Created</th>

                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody>

                            {challans.map((challan) => (

                                <tr key={challan.id}>

                                    <td>
                                        {challan.challanNumber}
                                    </td>


                                    <td>
                                        {challan.customer?.name ||
                                            challan.customerId}
                                    </td>


                                    <td>
                                        {challan.status}
                                    </td>


                                    <td>
                                        {challan.totalQuantity}
                                    </td>


                                    <td>
                                        {challan.createdAt
                                            ? new Date(
                                                challan.createdAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>


                                    <td>

                                        <button
                                            onClick={() =>
                                                handleEdit(challan)
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


function ChallanForm({
    challan,
    customers,
    products,
    onSubmit,
    onCancel
}) {

    const [form, setForm] = useState({

        challanNumber:
            challan?.challanNumber || "",

        customerId:
            challan?.customerId || "",

        status:
            challan?.status || "DRAFT",

        items:
            challan?.items?.map((item) => ({

                productId: item.productId,
                quantity: item.quantity

            })) || [

                {
                    productId: "",
                    quantity: 1
                }

            ]

    });


    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });
    };


    const handleItemChange = (
        index,
        field,
        value
    ) => {

        const updatedItems = [...form.items];

        updatedItems[index] = {

            ...updatedItems[index],

            [field]: value

        };

        setForm({

            ...form,

            items: updatedItems

        });
    };


    const addItem = () => {

        setForm({

            ...form,

            items: [

                ...form.items,

                {
                    productId: "",
                    quantity: 1
                }

            ]

        });
    };


    const removeItem = (index) => {

        if (form.items.length === 1) {
            return;
        }

        const updatedItems =
            form.items.filter(
                (_, i) => i !== index
            );

        setForm({

            ...form,

            items: updatedItems

        });
    };


    const handleSubmit = (e) => {

        e.preventDefault();

        const payload = {

            challanNumber:
                form.challanNumber,

            customerId:
                Number(form.customerId),

            status:
                form.status,

            items:
                form.items.map((item) => ({

                    productId:
                        Number(item.productId),

                    quantity:
                        Number(item.quantity)

                }))

        };

        onSubmit(payload);
    };


    return (

        <div className="form-card">

            <h2>
                {challan
                    ? "Edit Challan"
                    : "Create Challan"}
            </h2>


            <form onSubmit={handleSubmit}>

                <input
                    name="challanNumber"
                    placeholder="Challan number"
                    value={form.challanNumber}
                    onChange={handleChange}
                    required
                />


                <select
                    name="customerId"
                    value={form.customerId}
                    onChange={handleChange}
                    required
                >

                    <option value="">
                        Select Customer
                    </option>


                    {customers.map((customer) => (

                        <option
                            key={customer.id}
                            value={customer.id}
                        >
                            {customer.name} -{" "}
                            {customer.businessName}
                        </option>

                    ))}

                </select>


                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                >

                    <option value="DRAFT">
                        Draft
                    </option>

                    <option value="CONFIRMED">
                        Confirmed
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>

                </select>


                <h3>Items</h3>


                {form.items.map((item, index) => (

                    <div
                        key={index}
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "10px"
                        }}
                    >

                        <select
                            value={item.productId}
                            onChange={(e) =>
                                handleItemChange(
                                    index,
                                    "productId",
                                    e.target.value
                                )
                            }
                            required
                        >

                            <option value="">
                                Select Product
                            </option>


                            {products.map((product) => (

                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name} -{" "}
                                    {product.sku}
                                </option>

                            ))}

                        </select>


                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                                handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                )
                            }
                            required
                        />


                        <button
                            type="button"
                            onClick={() =>
                                removeItem(index)
                            }
                        >
                            Remove
                        </button>

                    </div>

                ))}


                <button
                    type="button"
                    onClick={addItem}
                >
                    + Add Item
                </button>


                <div
                    style={{
                        marginTop: "20px"
                    }}
                >

                    <button type="submit">
                        Save Challan
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


export default Challans;