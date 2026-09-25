import { useState } from "react";
import { API_URL } from "../../lib/api";

// The Guru's "Tulis Jawaban" box under the answers.
function AnswerForm({ questionId }) {
  const [answer, setAnswer] = useState("");

  const submitAnswer = async () => {
    const response = await fetch(`${API_URL}/api/answer/${questionId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Content: answer,
      }),
    });

    if (response.ok) {
      alert("Jawaban berhasil dibuat");
      window.location.reload();
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
      <h3 className="font-title-md text-title-md text-on-surface mb-4">Tulis Jawaban</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Tulis jawaban terbaik..."
        className="w-full border border-outline-variant rounded-2xl p-4 min-h-[160px] outline-none focus:border-primary-container resize-none font-body-md text-body-md"
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={submitAnswer}
          className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-semibold hover:bg-tertiary transition-colors"
        >
          Kirim Jawaban
        </button>
      </div>
    </div>
  );
}

export default AnswerForm;
