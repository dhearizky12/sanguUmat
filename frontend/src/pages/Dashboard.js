function Dashboard()
{
    const logout = () => {
        window.location.href = "http://localhost:5236/api/auth/logout";
    };

    const openProfile = () => {
        window.location.href = "/profile";
    }

    return (
        <div style={{padding:40}}>
            <h1>Selamat anda berhasil login</h1>

            <button onClick={openProfile}>
                Lihat Profile
            </button>

            <br/>

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;