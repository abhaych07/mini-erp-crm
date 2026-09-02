import { NavLink } from "react-router-dom";

function Sidebar() {
    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const role = user?.role;

    const allLinks = [
        {
            name: "Dashboard",
            path: "/dashboard",
            roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]
        },
        {
            name: "Customers",
            path: "/customers",
            roles: ["ADMIN", "SALES"]
        },
        {
            name: "Products",
            path: "/products",
            roles: ["ADMIN", "WAREHOUSE"]
        },
        {
            name: "Stock / Inventory",
            path: "/stock",
            roles: ["ADMIN", "WAREHOUSE"]
        },
        {
            name: "Challans",
            path: "/challans",
            roles: ["ADMIN", "SALES", "ACCOUNTS"]
        }
    ];

    const visibleLinks = allLinks.filter((link) =>
        link.roles.includes(role)
    );

    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <h2>Mini ERP + CRM</h2>
            </div>

            <nav className="sidebar-nav">

                {visibleLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        {link.name}
                    </NavLink>
                ))}

            </nav>

            <div className="sidebar-user">

                <strong>
                    {user?.name || "User"}
                </strong>

                <span>
                    {role || "USER"}
                </span>

            </div>

        </aside>
    );
}

export default Sidebar;