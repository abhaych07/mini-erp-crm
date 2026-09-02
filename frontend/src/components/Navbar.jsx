import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <header className="navbar">

            <div>
                <h3>Operations Portal</h3>
            </div>

            <div className="navbar-right">

                <span>
                    {user?.name}
                </span>

                <span>
                    {user?.role}
                </span>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>

        </header>
    );
}

export default Navbar;