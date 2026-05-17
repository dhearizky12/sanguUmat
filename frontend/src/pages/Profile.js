import { useEffect, useState } from "react";

function Profile() {
    const [profile, setProfile] = useState(null);

    const backDashboard = () => {
        window.location.href = "/dashboard";
    };

    const [selectedFile, setSelectedFile] = useState(null);

    const uploadPicture = async() => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(
            "http://localhost:5236/api/auth/upload-picture",
            {
                method: "POST",
                credentials: "include",
                body: formData
            }
        );

        if ( response.ok)
        {
            alert("Foto profil berhasil diupload");
            window.location.reload();
        }
    };

    useEffect(() => {
        fetch("http://localhost:5236/api/auth/profile",{
            credentials: "include"
        })
        .then( res => res.json())
        .then(data => {
            setProfile(data);
        });
    }, []);

    if (!profile) 
    {
        return <h1>Loading Profile ...</h1>
    }

    return(
        <div style={{padding: 40}}>
            <h1>Profile</h1>
            <br/>
            {
                profile.picture && (
                    <img 
                        src={"http://localhost:5236/" + profile.picture}
                        alt="Profile"
                        width="120"
                        style={{borderRadius : 999}}
                    />

                )
            }

            <br />

            <input
            type="file"
            onChange={(e) =>
                setSelectedFile(e.target.files[0])
            }
            />

            <br />
            <br />

            <button onClick={uploadPicture}>
            Upload Foto
            </button>

            <br />
            <br />
            <br/>
            <br/>

            <p>
                <strong>Nama : </strong>
                {" "}
                {profile.name}
            </p>
            <p>
                <strong>Email: </strong>
                {" "}
                {profile.email}
            </p>
            <p>
                <strong>Nomor Telepon: </strong>
                {" "}
                {profile.phone}
            </p>
            <p>
                <strong>Alamat: </strong>
                {" "}
                {profile.address}   
            </p>
            <p>
                <strong>Role: </strong>
                {" "}
                {profile.role}
            </p>
            <p>
                <strong>Created At: </strong>
                {" "}
                {profile.createdAt}
            </p>
            <p>
                <strong>Updated At: </strong>
                {" "}
                {profile.updatedAt}
            </p>
            <p>
                <strong>Last Login: </strong>
                {" "}
                {profile.lastLogin}
            </p>

            <br/>
            <button onClick={backDashboard}>Kembali ke Dashboard</button>
        </div>
    );
}

export default Profile;