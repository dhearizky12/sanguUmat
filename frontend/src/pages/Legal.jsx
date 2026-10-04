import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";

// Syarat Layanan and Kebijakan Privasi: plain text, written for what the app does today.
// Edit the wording here; the routes are /syarat, /privasi and /kontak.
const DOCS = {
  syarat: {
    title: "Syarat Layanan",
    lead: "Aturan singkat memakai Sangu Umat.",
    sections: [
      ["Tentang layanan", "Sangu Umat adalah tempat bertanya kepada ustadz, membaca artikel, dan mengikuti kajian. Jawaban dan tulisan di sini bersifat pembelajaran umum, bukan pengganti fatwa resmi atau konsultasi langsung untuk keadaan pribadi Anda."],
      ["Akun", "Anda masuk dengan akun Google. Anda bertanggung jawab atas aktivitas di akun Anda."],
      ["Isi yang Anda kirim", "Pertanyaan dan komentar harus sopan, jujur, dan tidak mengandung ujaran kebencian, iklan, atau data pribadi orang lain. Pertanyaan yang dijawab dapat ditampilkan untuk umum, dan Anda dapat memilih agar nama Anda tidak ditampilkan."],
      ["Penghapusan", "Admin dapat menghapus pertanyaan, komentar, atau tulisan yang melanggar aturan ini atau dianggap tidak pantas, tanpa pemberitahuan lebih dulu."],
      ["Perubahan", "Syarat ini dapat berubah. Dengan terus memakai layanan, Anda menyetujui syarat yang berlaku."],
    ],
  },
  kontak: {
    title: "Hubungi Kami",
    lead: "Pertanyaan tentang situs, saran, atau laporan.",
    sections: [
      ["Email", "fatikhunnizam@gmail.com"],
      ["WhatsApp", "+62 823-3678-8323"],
      ["Untuk apa", "Laporkan isi yang tidak pantas, minta penghapusan akun atau data Anda, atau tanyakan hal teknis tentang Sangu Umat. Pertanyaan agama tetap diajukan lewat halaman Tanya Jawab."],
    ],
  },
  privasi: {
    title: "Kebijakan Privasi",
    lead: "Data apa yang kami simpan, dan untuk apa.",
    sections: [
      ["Data yang kami simpan", "Dari akun Google: nama, alamat email, dan foto profil. Dari Anda: nomor telepon dan alamat bila Anda mengisinya, serta pertanyaan, komentar, dan tulisan yang Anda kirim."],
      ["Untuk apa", "Untuk menampilkan profil Anda, menjawab pertanyaan Anda, mengirim notifikasi di dalam aplikasi, dan mengelola layanan. Kami tidak menjual data Anda dan tidak membagikannya kepada pihak lain untuk iklan."],
      ["Yang terlihat oleh orang lain", "Nama, foto, pertanyaan yang dijawab, dan komentar Anda dapat dilihat pengunjung. Email, nomor telepon, dan alamat tidak ditampilkan. Pertanyaan anonim tidak menampilkan nama Anda."],
      ["Penyimpanan di peramban", "Setelah masuk dengan Google, kami menyimpan token masuk di peramban Anda agar Anda tetap login selama 7 hari. Token dihapus saat Anda keluar. Kami tidak memakai cookie pelacak iklan."],
      ["Menghapus data", "Anda dapat mengubah data profil kapan saja di halaman profil. Anda juga dapat menghapus akun lewat tombol \"Hapus akun\" di halaman profil: nama, email, foto, nomor telepon, dan alamat Anda dihapus. Pertanyaan yang sudah dijawab, jawaban, komentar, dan artikel yang pernah Anda tulis tetap ada, tampil sebagai \"Hamba Allah\". Pertanyaan yang belum dijawab atau yang tidak boleh ditayangkan ikut dihapus. Bila butuh bantuan, hubungi kami lewat halaman Hubungi Kami."],
    ],
  },
};

function Legal({ doc }) {
  const { title, lead, sections } = DOCS[doc];
  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: title }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>{title}</PageTitle>
            <PageLead>{lead}</PageLead>
          </div>
        </PageHeader>
        <PageBody>
          <div className="max-w-[68ch] flex flex-col gap-7">
            {sections.map(([heading, text]) => (
              <section key={heading} className="flex flex-col gap-2">
                <h2 className="text-2xl font-normal tracking-[-0.01em]">{heading}</h2>
                <p className="text-base leading-relaxed text-ink-soft">{text}</p>
              </section>
            ))}
          </div>
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Legal;
