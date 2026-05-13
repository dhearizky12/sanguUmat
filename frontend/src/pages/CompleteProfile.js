import { useState } from "react";

function CompleteProfile() {
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");


    const saveProfile = async () => {
        const response = await fetch (
            "http://localhost:5236/api/auth/complete-profile",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone,
                    address
                })
            }
        );

        if (response.ok)
        {
            window.location.href = "/dashboard";
        }
    };
    return(
        <div style={{padding: 40}}>
        <h1>Lengkapi Profile</h1>
        <div>
            <input
                type="text"
                placeholder="Nomor Telepon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
        </div>

        <br />
        <div>
            <textarea
                placeholder="Alamat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
        </div>
        <br/>
        <button onClick={saveProfile}>Simpan</button>
        </div>
    );
}

export default CompleteProfile;