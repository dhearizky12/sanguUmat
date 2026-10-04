import { useState } from "react";
import { API_URL } from "../../lib/api";
import Button from "../Button";
import LazyEditor from "../article/LazyEditor";
import { FieldLabel, FormError } from "../Field";

// The Guru's "Tulis jawaban" box under the answers: the article editor, so an answer can have
// headings, lists, bold and links. `#jawab` (the queue's "Jawab" button) scrolls here and puts
// the cursor in the editor.
function AnswerForm({ questionId }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submitAnswer = async () => {
    if (!answer) {
      setError("Jawaban tidak boleh kosong.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/answer/${questionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: answer, isHtml: true }),
      });

      if (response.ok) {
        alert("Jawaban berhasil dibuat");
        window.location.reload();
      } else {
        setError((response.status === 400 && (await response.text())) || "Gagal mengirim jawaban. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim jawaban. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="jawab" className="scroll-mt-24 border border-stone-line bg-paper p-[clamp(20px,3vw,28px)] flex flex-col gap-4">
      <FieldLabel as="div" id="answer-body-label">
        Tulis jawaban
      </FieldLabel>
      <LazyEditor
        value=""
        onChange={(html) => {
          setAnswer(html);
          setError("");
        }}
        labelledBy="answer-body-label"
        placeholder="Tulis jawaban terbaik…"
      />
      {error && <FormError>{error}</FormError>}
      <div className="flex justify-end">
        <Button onClick={submitAnswer} disabled={sending} className="px-6 py-3.5">
          {sending ? "Mengirim…" : "Kirim jawaban"}
        </Button>
      </div>
    </section>
  );
}

export default AnswerForm;
