function Dashboard()
{
    const logout = () => {
        window.location.href = "http://localhost:5236/api/auth/logout";
    };

    return (
        <div style={{padding:40}}>
            <h1>Selamat anda berhasil login</h1>

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;