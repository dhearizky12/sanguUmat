import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

function Profile() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  }
  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <button onClick={handleLogout}>Logout</button>
      <Link to="/edit-profile">Edit Profile</Link>
      <Footer />
    </div>
  );
}

export default Profile;
