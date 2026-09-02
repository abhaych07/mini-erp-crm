import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function Dashboard() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response =
                    await apiRequest(
                        "/dashboard/overview"
                    );

                setData(response.data);

            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);
            }
        };

        loadDashboard();

    }, []);

    if (loading) {
        return (
            <div className="page">
                <h1>Loading dashboard...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="error-message">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Overview of your ERP operations
                    </p>
                </div>

            </div>

            <div className="dashboard-grid">

                <div className="stat-card">

                    <span>
                        Total Customers
                    </span>

                    <strong>
                        {data.customers.total}
                    </strong>

                    <small>
                        Active: {data.customers.active}
                    </small>

                </div>

                <div className="stat-card">

                    <span>
                        Total Products
                    </span>

                    <strong>
                        {data.products.total}
                    </strong>

                    <small>
                        Low Stock: {data.products.lowStock}
                    </small>

                </div>

                <div className="stat-card">

                    <span>
                        Total Challans
                    </span>

                    <strong>
                        {data.challans.total}
                    </strong>

                    <small>
                        Confirmed: {data.challans.confirmed}
                    </small>

                </div>

                <div className="stat-card">

                    <span>
                        Pending Follow-ups
                    </span>

                    <strong>
                        {data.followUps.pending}
                    </strong>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;