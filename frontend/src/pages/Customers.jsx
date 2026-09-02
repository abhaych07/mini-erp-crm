import { useEffect, useState } from "react";

import CustomerForm from "../components/CustomerForm";

import {
    getCustomers,
    getCustomer,
    createFollowUp
} from "../services/api";


function Customers() {

    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const [showForm, setShowForm] = useState(false);

    const [editingCustomer, setEditingCustomer] =
        useState(null);

    const [selectedCustomer, setSelectedCustomer] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(false);

    const [showFollowUp, setShowFollowUp] =
        useState(false);


    const loadCustomers = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await getCustomers(
                search,
                page,
                10
            );

            setCustomers(
                response.data.customers
            );

            setPagination(
                response.data.pagination
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadCustomers();

    }, [page, search]);


    const handleSearch = (e) => {

        setSearch(e.target.value);
        setPage(1);
    };


    const handleAdd = () => {

        setEditingCustomer(null);
        setShowForm(true);
    };


    const handleEdit = (customer) => {

        setEditingCustomer(customer);
        setShowForm(true);
    };


    const handleFormSuccess = () => {

        setShowForm(false);
        setEditingCustomer(null);

        loadCustomers();
    };


    const handleView = async (id) => {

        try {

            const response =
                await getCustomer(id);

            setSelectedCustomer(
                response.data
            );

            setShowDetails(true);

        } catch (error) {

            setError(error.message);
        }
    };


    const handleFollowUp = (customer) => {

        setSelectedCustomer(customer);
        setShowFollowUp(true);
    };


    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <h1>
                        Customers
                    </h1>

                    <p>
                        Manage your customers and follow-ups
                    </p>

                </div>

                <button
                    onClick={handleAdd}
                >
                    + Add Customer
                </button>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            <div className="search-bar">

                <input
                    type="text"
                    placeholder="Search by name, mobile or business..."
                    value={search}
                    onChange={handleSearch}
                />

            </div>


            {loading ? (

                <div className="loading">
                    Loading customers...
                </div>

            ) : customers.length === 0 ? (

                <div className="empty-state">
                    No customers found.
                </div>

            ) : (

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Mobile
                                </th>

                                <th>
                                    Business
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Follow-up
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {customers.map(
                                (customer) => (

                                    <tr
                                        key={customer.id}
                                    >

                                        <td>
                                            <strong>
                                                {customer.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {customer.mobile}
                                        </td>

                                        <td>
                                            {customer.businessName}
                                        </td>

                                        <td>
                                            {customer.customerType}
                                        </td>

                                        <td>

                                            <span
                                                className={`status ${customer.status.toLowerCase()}`}
                                            >
                                                {customer.status}
                                            </span>

                                        </td>

                                        <td>

                                            {customer.followUpDate
                                                ? new Date(
                                                    customer.followUpDate
                                                ).toLocaleDateString()
                                                : "—"}

                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="small-button"
                                                    onClick={() =>
                                                        handleView(
                                                            customer.id
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="small-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="small-button"
                                                    onClick={() =>
                                                        handleFollowUp(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    Follow-up
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>
            )}


            {pagination.totalPages > 1 && (

                <div className="pagination">

                    <button
                        disabled={page <= 1}
                        onClick={() =>
                            setPage(page - 1)
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {pagination.page} of{" "}
                        {pagination.totalPages}
                    </span>

                    <button
                        disabled={
                            page >=
                            pagination.totalPages
                        }
                        onClick={() =>
                            setPage(page + 1)
                        }
                    >
                        Next
                    </button>

                </div>
            )}


            {showForm && (

                <div className="modal-overlay">

                    <CustomerForm
                        customer={editingCustomer}
                        onSuccess={
                            handleFormSuccess
                        }
                        onCancel={() =>
                            setShowForm(false)
                        }
                    />

                </div>
            )}


            {showDetails &&
                selectedCustomer && (

                    <div className="modal-overlay">

                        <div className="modal">

                            <div className="form-header">

                                <h2>
                                    Customer Details
                                </h2>

                                <button
                                    className="close-button"
                                    onClick={() =>
                                        setShowDetails(false)
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="customer-details">

                                <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedCustomer.name}
                                </p>

                                <p>
                                    <strong>Mobile:</strong>{" "}
                                    {selectedCustomer.mobile}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {selectedCustomer.email || "—"}
                                </p>

                                <p>
                                    <strong>Business:</strong>{" "}
                                    {selectedCustomer.businessName}
                                </p>

                                <p>
                                    <strong>GST:</strong>{" "}
                                    {selectedCustomer.gstNumber || "—"}
                                </p>

                                <p>
                                    <strong>Type:</strong>{" "}
                                    {selectedCustomer.customerType}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    {selectedCustomer.status}
                                </p>

                                <p>
                                    <strong>Address:</strong>{" "}
                                    {selectedCustomer.address}
                                </p>

                                <p>
                                    <strong>Notes:</strong>{" "}
                                    {selectedCustomer.notes || "—"}
                                </p>


                                <h3>
                                    Follow-ups
                                </h3>

                                {selectedCustomer.followUps?.length
                                    ? selectedCustomer.followUps.map(
                                        (followUp) => (

                                            <div
                                                className="follow-up-item"
                                                key={followUp.id}
                                            >

                                                <strong>
                                                    {new Date(
                                                        followUp.followUpDate
                                                    ).toLocaleString()}
                                                </strong>

                                                <p>
                                                    {followUp.note}
                                                </p>

                                            </div>

                                        )
                                    )
                                    : (
                                        <p>
                                            No follow-ups yet.
                                        </p>
                                    )}

                            </div>

                        </div>

                    </div>
                )}


            {showFollowUp &&
                selectedCustomer && (

                    <FollowUpModal
                        customer={selectedCustomer}
                        onClose={() =>
                            setShowFollowUp(false)
                        }
                        onSuccess={() => {

                            setShowFollowUp(false);
                            handleView(
                                selectedCustomer.id
                            );

                        }}
                    />

                )}

        </div>
    );
}


function FollowUpModal({
    customer,
    onClose,
    onSuccess
}) {

    const [note, setNote] = useState("");

    const [followUpDate, setFollowUpDate] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            await createFollowUp(
                customer.id,
                {
                    note,
                    followUpDate
                }
            );

            onSuccess();

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="form-header">

                    <h2>
                        Add Follow-up
                    </h2>

                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                <p>
                    Customer:{" "}
                    <strong>
                        {customer.name}
                    </strong>
                </p>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Follow-up Date *
                        </label>

                        <input
                            type="datetime-local"
                            value={followUpDate}
                            onChange={(e) =>
                                setFollowUpDate(
                                    e.target.value
                                )
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Note *
                        </label>

                        <textarea
                            value={note}
                            onChange={(e) =>
                                setNote(e.target.value)
                            }
                            rows="4"
                            placeholder="Enter follow-up note"
                            required
                        />

                    </div>


                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Add Follow-up"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default Customers;