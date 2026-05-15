import {useState} from "react";

function Dashboard()
{
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [questions, setQuestions] = useState([]);

    const logout = () => {
        window.location.href = "http://localhost:5236/api/auth/logout";
    };

    const openProfile = () => {
        window.location.href = "/profile";
    }

    const submitQuestion = async () => {
        const response = await fetch(
            "http://localhost:5236/api/question",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    content
                })
            }
        );

        if(response.ok)
        {
            alert("Pertanyaan berhasil dibuat");
            await loadQuestions();

            setShowModal(false);
            setTitle("");
            setContent("");
        }
    };

    const loadQuestions = async () => {
        const response = await fetch(
            "http://localhost:5236/api/question",
            {
                credentials: "include"
            }
        );
        const data = await response.json();
        setQuestions(data);
    };

    return (
        <div style={{padding:40}}>
            <h1>Selamat anda berhasil login</h1>

            <h1>Dashboard</h1>

            <br/>
            
            <button onClick={() => setShowModal(true)}>Add Question</button>
            <br/>
            <br/>
            <button onClick={openProfile}>
                Lihat Profile
            </button>

            <br/>
            <br/>

            <button onClick={logout}>
                Logout
            </button>

            <br/>
            <br/>

            <h2>Daftar Pertanyaan</h2>
            {
                questions.map((question) => (
                <div
                    key={question.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 20,
                        borderRadius: 10,
                        marginBottom: 20
                    }}
                >

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10
                    }}
                >

                {
                    question.userPicture && (
                        <img
                            src={question.userPicture}
                            alt="Profile"
                            width="40"
                            height="40"
                            style={{
                                borderRadius: 999,
                                marginRight: 10
                            }}
                        />
                    )
                }

                <strong>
                    {question.userName}
                </strong>

            </div>

            <h3>
                {question.title}
            </h3>

            <p>
                {question.content}
            </p>

            <small>
                {question.createdAt}
            </small>

        </div>
    ))
            }

            {
                showModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <div
                            style={{
                                background: "white",
                                padding: 20,
                                width: 500,
                                borderRadius: 10
                            }}>
                                <h2>Add Question</h2>
                                <input
                                    type="text"
                                    placeholder="Judul Pertanyaan"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    style={{width: "100%",
                                        marginBottom: 10
                                    }}
                                    />
                                    <textarea
                                        placeholder="Isi Pertanyaan"
                                        value={content}
                                        onChange={(e) =>
                                            setContent(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            height: 150
                                        }}
                                    />

                                    <br/>
                                    <br/>

                                    <button onClick={submitQuestion}>
                                        Submit
                                    </button>

                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{marginLeft: 10}}> cancel</button>
                            </div>
                    </div>
                )
            }
        </div>
    );
}

export default Dashboard;