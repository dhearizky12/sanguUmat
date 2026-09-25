import { useState } from "react";
import { API_URL } from "../../lib/api";
import Button from "../Button";
import { FieldLabel, TextArea } from "../Field";

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
    <section className="border border-stone-line bg-paper p-[clamp(20px,3vw,28px)] flex flex-col gap-4">
      <FieldLabel htmlFor="answer-body">Tulis jawaban</FieldLabel>
      <TextArea
        id="answer-body"
        rows="10"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Tulis jawaban terbaik…"
      />
      <div className="flex justify-end">
        <Button onClick={submitAnswer} className="px-6 py-3.5">
          Kirim jawaban
        </Button>
      </div>
    </section>
  );
}

export default AnswerForm;
