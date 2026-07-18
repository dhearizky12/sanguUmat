import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";

function DetailQuestion() 
{
  const [question, setQuestion] = useState(null);
  const [answer,setAnswer] = useState("");
  const {id} = useParams();
  const {me} = useAuth();

  const deleteAnswer = async(answerId) =>
  {
    const confirmDelete = window.confirm("Hapus jawaban ini?");
    if(!confirmDelete) return;

    const response = await fetch(
      `${API_URL}/api/answer/${answerId}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    );

    if (response.ok)
    {
      alert("Jawaban berhasil dihapus");
      window.location.reload();
    }
    else
    {
      alert("Gagal menghapus jawaban");
    }
  };

  useEffect(()=>
  {
    fetch(`${API_URL}/api/Question/${id}`)
    .then(res => res.json())
    .then(data => {
      setQuestion(data);
    });
  }, [id]);

  const submitAnswer = async () =>
  {
    const response = await fetch(
      `${API_URL}/api/answer/${id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({
          Content : answer
        })
      }
    );

    if(response.ok)
    {
      alert("Jawaban berhasil dibuat");
      window.location.reload();
    }
  };

  return (
    <div className="font-body-md min-h-screen flex flex-col bg-surface">

    <Header />
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1">
      {
        question && (
          <div className="space-y-6">
            {/* QUESTION CARD */}
            <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-8">
              <div className="flex items-start gap-4">
                <div
                  className="
                    w-14
                    h-14
                    rounded-full
                    overflow-hidden
                    bg-primary-container/10
                    flex
                    items-center
                    justify-center
                    border
                    border-outline-variant">
                      <img
                        src={
                          question.userPicture ? API_URL + "/" + question.userPicture : "/default-avatar.png"
                        }
                        alt="Foto profil"
                        onError={handleAvatarError}
                        className="
                        w-full
                        h-full
                        object-cover
                        rounded-full">
                      </img>
                </div>

                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-on-surface mb-4">
                    {question.title}
                  </h1>
                  <p className="text-on-surface-variant text-xl leading-relaxed">
                    {question.content}
                  </p>
                </div>
              </div>
            </div>

            {/* ANSWERS */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-on-surface">
                Jawaban
              </h2>
              {
                question.answers.length === 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 text-outline">
                    Belum ada jawaban
                  </div>
                )
              }
              {
                question.answers.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.userPicture
                              ? API_URL + "/" + item.userPicture
                              : "/default-avatar.png"
                          }
                          alt="Foto profil"
                          onError={handleAvatarError}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-lg text-on-surface">
                            {item.userName}
                          </strong>
                          {
                            item.role == "Guru" &&
                            (
                              <span className="material-symbols-outlined text-secondary-container text-[18px]">
                                verified
                            </span>
                            )
                          }
                        </div>
                        <p className="text-sm text-outline">
                          { item.role === "Guru" ? "Guru" : "Murid" }
                        </p>
                      </div>
                    </div>
                    {
                      (me?.id === item.userId && (me?.role === "Admin" || me?.role === "Guru"))&&
                      (
                        <button onClick = {() => 
                          deleteAnswer(item.id)
                        }
                        title="Hapus Jawaban"
                        className="
                          self-center
                          // mt-4
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-red-600
                          hover:bg-red-50
                          hover:text-red-700
                          transition
                          cursor-pointer">

                          <span
                            className="
                              material-symbols-outlined
                              text-[15px]"
                          >
                            delete
                          </span>
                        </button>
                        
                      )
                    }
                    </div>

                    <p className="text-on-surface-variant leading-relaxed text-lg">
                      {item.content}
                    </p>
                  </div>
                ))
              }
              
            </div>

            {/* FORM JAWABAN */}
            {
              me?.role === "Guru" && (
                <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 p-6">
                  <h3 className="text-2xl font-bold mb-4">
                    Tulis Jawaban
                  </h3>
                  <textarea
                    value={answer}
                    onChange={(e) =>
                      setAnswer(e.target.value)
                    }
                    placeholder="Tulis jawaban terbaik..."
                    className="w-full border border-outline-variant rounded-2xl p-4 min-h-[160px] outline-none focus:border-primary-container resize-none"
                  />

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={submitAnswer}
                      className="bg-primary-container text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
                    >
                      Kirim Jawaban
                    </button>
                  </div>
                </div>
              )
            }
            
          </div>
        )
      }

    </main>

    <Footer />

  </div>
  );
}

export default DetailQuestion;
