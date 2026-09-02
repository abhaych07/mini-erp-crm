import { useEffect, useState } from "react";
import {
    createCustomer,
    updateCustomer
} from "../services/api";

function CustomerForm({
    customer,
    onSuccess,
    onCancel
}) {

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        email: "",
        businessName: "",
        gstNumber: "",
        customerType: "RETAIL",
        address: "",
        status: "LEAD",
        followUpDate: "",
        notes: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (customer) {

            setForm({
                name: customer.name || "",
                mobile: customer.mobile || "",
                email: customer.email || "",
                businessName: customer.businessName || "",
                gstNumber: customer.gstNumber || "",
                customerType:
                    customer.customerType || "RETAIL",
                address: customer.address || "",
                status:
                    customer.status || "LEAD",
                followUpDate:
                    customer.followUpDate
                        ? customer.followUpDate.slice(0, 16)
                        : "",
                notes: customer.notes || ""
            });
        }

    }, [customer]);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            if (customer) {

                await updateCustomer(
                    customer.id,
                    form
                );

            } else {

                await createCustomer(form);
            }

            onSuccess();

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="customer-form-container">

            <div className="form-header">

                <h2>
                    {customer
                        ? "Edit Customer"
                        : "Add Customer"}
                </h2>

                <button
                    type="button"
                    className="close-button"
                    onClick={onCancel}
                >
                    ×
                </button>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            <form
                className="customer-form"
                onSubmit={handleSubmit}
            >

                <div className="form-grid">

                    <div className="form-group">

                        <label>
                            Customer Name *
                        </label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Mobile *
                        </label>

                        <input
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Business Name *
                        </label>

                        <input
                            name="businessName"
                            value={form.businessName}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            GST Number
                        </label>

                        <input
                            name="gstNumber"
                            value={form.gstNumber}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Customer Type *
                        </label>

                        <select
                            name="customerType"
                            value={form.customerType}
                            onChange={handleChange}
                            required
                        >

                            <option value="RETAIL">
                                Retail
                            </option>

                            <option value="WHOLESALE">
                                Wholesale
                            </option>

                            <option value="DISTRIBUTOR">
                                Distributor
                            </option>

                        </select>

                    </div>


                    <div className="form-group">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >

                            <option value="LEAD">
                                Lead
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>

                        </select>

                    </div>


                    <div className="form-group">

                        <label>
                            Follow-up Date
                        </label>

                        <input
                            type="datetime-local"
                            name="followUpDate"
                            value={form.followUpDate}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group full-width">

                        <label>
                            Address *
                        </label>

                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows="3"
                            required
                        />

                    </div>


                    <div className="form-group full-width">

                        <label>
                            Notes
                        </label>

                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows="3"
                        />

                    </div>

                </div>


                <div className="form-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : customer
                                ? "Update Customer"
                                : "Create Customer"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default CustomerForm;