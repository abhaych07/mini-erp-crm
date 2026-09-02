import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Challans from "./pages/Challans";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function Layout() {

    return (
        <div className="app-layout">

            <Sidebar />

            <div className="main-area">

                <Navbar />

                <main className="main-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* Login */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ========================= */}
                {/* ALL AUTHENTICATED USERS */}
                {/* ========================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "ADMIN",
                                "SALES",
                                "WAREHOUSE",
                                "ACCOUNTS"
                            ]}
                        />
                    }
                >

                    <Route element={<Layout />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                    </Route>

                </Route>


                {/* ========================= */}
                {/* ADMIN + SALES */}
                {/* ========================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "ADMIN",
                                "SALES"
                            ]}
                        />
                    }
                >

                    <Route element={<Layout />}>

                        <Route
                            path="/customers"
                            element={<Customers />}
                        />

                    </Route>

                </Route>


                {/* ========================= */}
                {/* ADMIN + WAREHOUSE */}
                {/* ========================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "ADMIN",
                                "WAREHOUSE"
                            ]}
                        />
                    }
                >

                    <Route element={<Layout />}>

                        <Route
                            path="/products"
                            element={<Products />}
                        />

                        <Route
                            path="/stock"
                            element={<Stock />}
                        />

                    </Route>

                </Route>


                {/* ========================= */}
                {/* ADMIN + SALES + ACCOUNTS */}
                {/* ========================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "ADMIN",
                                "SALES",
                                "ACCOUNTS"
                            ]}
                        />
                    }
                >

                    <Route element={<Layout />}>

                        <Route
                            path="/challans"
                            element={<Challans />}
                        />

                    </Route>

                </Route>


                {/* Default */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;