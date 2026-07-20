-- Local dev seed data: 2 dummy "Guru" users, 2 dummy askers, and 10 answered Q&A pairs
-- spanning the 5 categories used by the frontend's client-side category filter (see
-- Dashboard.jsx / BE_PLAN.md Phase 4 — there's no real Category column yet).
--
-- Not idempotent — running this twice will insert duplicate rows, since GoogleId has no
-- unique constraint in the schema. Intended for a fresh/local dev database only, never prod.
--
-- Usage: psql -h localhost -p 5432 -U <user> -d sanguUmat -f seed-dummy-data.sql

BEGIN;

INSERT INTO "Users" ("GoogleId", "Email", "Name", "Picture", "Phone", "Address", "Role", "CreatedAt", "UpdatedAt", "LastLogin", "HasCompletedProfile")
VALUES
  ('seed-guru-fajar', 'ustadz.fajar@example.com', 'Ustadz Fajar Rahman', NULL, NULL, NULL, 'Guru', now(), now(), now(), true),
  ('seed-guru-hana', 'ustadzah.hana@example.com', 'Ustadzah Hana Wulandari', NULL, NULL, NULL, 'Guru', now(), now(), now(), true),
  ('seed-user-budi', 'budi.santoso@example.com', 'Budi Santoso', NULL, NULL, NULL, 'User', now(), now(), now(), true),
  ('seed-user-siti', 'siti.aminah@example.com', 'Siti Aminah', NULL, NULL, NULL, 'User', now(), now(), now(), true);

-- Questions, most recent first (CreatedAt staggered so ordering in the UI is sensible)
INSERT INTO "Questions" ("Title", "Content", "CreatedAt", "UserId")
SELECT * FROM (VALUES
  ('Apakah sah sholat jika imam berbicara bahasa selain Arab saat khutbah Jumat?',
   'Saya sering mendengar khutbah Jumat disampaikan dalam bahasa Indonesia. Apakah hal ini mempengaruhi keabsahan sholat Jumat?',
   now() - interval '1 day', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-budi')),

  ('Bagaimana hukum menjamak sholat karena alasan pekerjaan?',
   'Saya bekerja dengan jadwal shift yang padat sehingga sulit sholat tepat waktu. Apakah boleh menjamak sholat karena alasan pekerjaan?',
   now() - interval '2 days', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-siti')),

  ('Apakah menelan air liur membatalkan puasa?',
   'Saat berpuasa saya khawatir menelan air liur sendiri dapat membatalkan puasa. Apakah ini benar?',
   now() - interval '3 days', (SELECT "Id" FROM "Users" WHERE "Email" = 'fatikhunnizam@gmail.com' LIMIT 1)),

  ('Bolehkah berpuasa sunnah tanpa sahur?',
   'Terkadang saya bangun kesiangan dan tidak sempat sahur, apakah masih boleh melanjutkan niat puasa sunnah?',
   now() - interval '4 days', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-budi')),

  ('Bagaimana cara menghitung zakat penghasilan yang benar?',
   'Saya seorang karyawan dengan gaji bulanan. Bagaimana cara menghitung zakat penghasilan yang benar sesuai syariat?',
   now() - interval '5 days', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-siti')),

  ('Apakah harta warisan wajib dizakati?',
   'Saya baru menerima harta warisan dari orang tua. Apakah harta tersebut wajib dizakati?',
   now() - interval '6 days', (SELECT "Id" FROM "Users" WHERE "Email" = 'fatikhunnizam@gmail.com' LIMIT 1)),

  ('Apa saja syarat sah pernikahan menurut syariat Islam?',
   'Saya berencana menikah dalam waktu dekat. Apa saja rukun dan syarat yang wajib dipenuhi agar pernikahan sah secara syariat?',
   now() - interval '7 days', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-budi')),

  ('Bagaimana adab menjaga keharmonisan rumah tangga menurut Islam?',
   'Apa saja anjuran syariat untuk menjaga keharmonisan dan komunikasi yang baik antara suami istri?',
   now() - interval '8 days', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-siti')),

  ('Apakah diperbolehkan berinvestasi di reksa dana indeks yang memuat sebagian kecil saham tidak sesuai syariah?',
   'Saya ingin berinvestasi namun ragu karena sebagian portofolio reksa dana indeks berisi saham perusahaan yang kurang sesuai syariah.',
   now() - interval '9 days', (SELECT "Id" FROM "Users" WHERE "Email" = 'fatikhunnizam@gmail.com' LIMIT 1)),

  ('Bagaimana hukum jual beli dengan sistem cicilan (kredit) dalam Islam?',
   'Apakah jual beli secara kredit dengan tambahan harga dibanding harga tunai termasuk riba?',
   now() - interval '10 days', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-budi'))
) AS q(title, content, created_at, user_id);

-- Answers, one per seeded question above, alternating between the two dummy Guru users.
-- Written WhatsApp-style (JAWABAN/PENJELASAN/REFERENSI/KESIMPULAN) to match how real answers
-- in the actual group look — see the real example appended further below. No title/PERTANYAAN
-- restating the question here: the detail page already shows the question separately above
-- the answer list, so repeating it inside the answer content would just be redundant.
-- Arabic citations: 7 of 10 quote real, well-known, short Qur'an verses with accurate
-- surah:ayat citations (Al-Baqarah 183, At-Taubah 103, Ar-Rum 21, Al-Baqarah 275); the other
-- 3 (khutbah language, jamak sholat, air liur/puasa) use generic unattributed Arabic fiqh
-- commentary rather than a fabricated specific book+page citation — deliberately not claiming
-- a verified source for those, since this is illustrative mock data, not published guidance.
INSERT INTO "Answers" ("Content", "CreatedAt", "QuestionId", "UserId")
SELECT a.content, a.created_at,
  (SELECT "Id" FROM "Questions" WHERE "Title" = a.title),
  (SELECT "Id" FROM "Users" WHERE "GoogleId" = a.guru)
FROM (VALUES
  ('Apakah sah sholat jika imam berbicara bahasa selain Arab saat khutbah Jumat?',
   'JAWABAN
Khutbah Jumat tetap sah disampaikan dalam bahasa Indonesia, karena tujuan khutbah adalah menyampaikan nasihat dan peringatan yang harus dipahami oleh jamaah.

PENJELASAN
1. Tujuan Khutbah adalah Nasihat
Khutbah pada dasarnya adalah sarana menyampaikan nasihat dan peringatan, sehingga isinya perlu disampaikan dengan bahasa yang dipahami jamaah agar tujuannya tercapai.

2. Sebagian Lafaz Tetap Disunnahkan Berbahasa Arab
Sebagian ulama Syafi''iyyah berpendapat bahwa lafaz-lafaz tertentu seperti hamdalah, syahadat, dan shalawat sebaiknya tetap diucapkan dalam bahasa Arab, sedangkan isi nasihatnya boleh disampaikan dalam bahasa lain.

REFERENSI
المقصود من الخطبة هو الوعظ والتذكير، فإذا كان القوم لا يفهمون العربية جاز أن تكون الخطبة بلغتهم حتى يحصل المقصود منها

KESIMPULAN
1. Khutbah Jumat sah menggunakan bahasa Indonesia selama rukun-rukunnya terpenuhi.
2. Lafaz-lafaz pokok seperti hamdalah dan syahadat disunnahkan tetap berbahasa Arab menurut sebagian ulama.',
   now() - interval '20 hours', 'seed-guru-fajar'),

  ('Bagaimana hukum menjamak sholat karena alasan pekerjaan?',
   'JAWABAN
Menjamak sholat karena pekerjaan diperbolehkan oleh sebagian ulama apabila terdapat kesulitan nyata (masyaqqah) dalam menunaikannya tepat waktu, namun sebaiknya diusahakan sholat tepat waktu jika memungkinkan.

PENJELASAN
1. Jamak pada Dasarnya untuk Safar dan Uzur
Jamak sholat secara asal disyariatkan bagi musafir, namun sebagian ulama juga membolehkannya bagi orang yang mengalami hajat/uzur berat seperti pekerjaan yang benar-benar menyulitkan.

2. Bukan untuk Dijadikan Kebiasaan
Kemudahan ini tidak boleh dijadikan alasan untuk selalu menunda sholat tanpa uzur yang jelas, karena sholat tepat waktu tetap merupakan keutamaan yang dianjurkan.

REFERENSI
الجمع بين الصلاتين يجوز عند الحاجة الشديدة التي يشق معها أداء كل صلاة في وقتها، وهذا مذهب طائفة من أهل العلم استدلالا بحديث الجمع لغير سفر عند وجود الحاجة

KESIMPULAN
1. Jamak sholat karena pekerjaan yang sangat menyulitkan diperbolehkan menurut sebagian ulama.
2. Sholat tepat waktu tetap merupakan pilihan yang lebih utama jika memungkinkan.',
   now() - interval '1 day 12 hours', 'seed-guru-hana'),

  ('Apakah menelan air liur membatalkan puasa?',
   'JAWABAN
Menelan air liur sendiri tidak membatalkan puasa, selama air liur tersebut tidak bercampur dengan benda lain dari luar mulut.

PENJELASAN
1. Air Liur Bukan Termasuk yang Membatalkan Puasa
Para ulama sepakat bahwa air liur yang keluar secara alami dari mulut sendiri, kemudian ditelan kembali, tidak termasuk perkara yang membatalkan puasa karena sulit dihindari.

2. Berbeda Jika Bercampur Benda Lain
Jika air liur telah bercampur dengan sisa makanan, darah, atau benda lain yang cukup banyak, maka hukumnya dapat berbeda dan berpotensi membatalkan puasa.

REFERENSI
من ابتلع ريقه الخالص لم يفطر لأنه لا يمكن التحرز منه، بخلاف ما إذا خالطه غيره

KESIMPULAN
1. Menelan air liur sendiri tidak membatalkan puasa.
2. Jika air liur bercampur benda lain dari luar mulut, hukumnya perlu ditinjau lebih lanjut.',
   now() - interval '2 days 10 hours', 'seed-guru-fajar'),

  ('Bolehkah berpuasa sunnah tanpa sahur?',
   'JAWABAN
Puasa sunnah tetap sah meskipun tanpa sahur, karena sahur hukumnya sunnah dan bukan syarat sahnya puasa.

PENJELASAN
1. Sahur Hanya Dianjurkan, Bukan Wajib
Sahur merupakan amalan yang dianjurkan karena mengandung keberkahan, namun tidak menjadi syarat sah puasa, baik puasa wajib maupun puasa sunnah.

2. Niat Puasa Sunnah Boleh di Siang Hari
Khusus puasa sunnah, niat boleh dilakukan pada siang hari selama belum melakukan hal yang membatalkan puasa sejak fajar, berbeda dengan puasa wajib yang mensyaratkan niat di malam hari.

REFERENSI
قال تعالى: يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ (القرآن الكريم، سورة البقرة: ١٨٣)

KESIMPULAN
1. Sahur bukan syarat sah puasa, hanya amalan yang dianjurkan.
2. Puasa sunnah tetap sah meski tanpa sahur, bahkan bila niatnya dilakukan pada siang hari.',
   now() - interval '3 days 8 hours', 'seed-guru-hana'),

  ('Bagaimana cara menghitung zakat penghasilan yang benar?',
   'JAWABAN
Zakat penghasilan dihitung sebesar 2,5% dari total pendapatan bersih yang telah mencapai nisab, dan boleh dibayarkan setiap bulan atau diakumulasikan dalam setahun.

PENJELASAN
1. Nisab dan Kadar Zakat Penghasilan
Zakat penghasilan (zakat profesi) dianalogikan dengan zakat emas, dengan nisab setara 85 gram emas per tahun, dan kadar yang wajib dikeluarkan adalah 2,5%.

2. Boleh Dibayar Bulanan atau Tahunan
Untuk memudahkan, sebagian ulama kontemporer membolehkan zakat penghasilan dibayarkan setiap menerima gaji, dengan syarat total setahun telah mencapai nisab.

REFERENSI
قال تعالى: خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا (القرآن الكريم، سورة التوبة: ١٠٣)

KESIMPULAN
1. Zakat penghasilan wajib dikeluarkan sebesar 2,5% setelah mencapai nisab.
2. Pembayarannya boleh dilakukan bulanan maupun tahunan sesuai kemudahan.',
   now() - interval '4 days 6 hours', 'seed-guru-fajar'),

  ('Apakah harta warisan wajib dizakati?',
   'JAWABAN
Harta warisan wajib dizakati apabila telah mencapai nisab dan telah dimiliki selama satu tahun (haul) sejak diterima.

PENJELASAN
1. Warisan Diperlakukan Seperti Harta Simpanan
Harta warisan yang disimpan diperlakukan sama seperti harta simpanan lainnya, sehingga zakatnya wajib dikeluarkan jika telah mencapai nisab dan berlalu satu haul.

2. Jika Langsung Digunakan Tidak Wajib Zakat
Apabila harta warisan langsung digunakan untuk kebutuhan sebelum mencapai haul, maka tidak ada kewajiban zakat atasnya karena syarat haul belum terpenuhi.

REFERENSI
قال تعالى: خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا (القرآن الكريم، سورة التوبة: ١٠٣)

KESIMPULAN
1. Harta warisan wajib dizakati jika telah mencapai nisab dan haul.
2. Jika langsung digunakan sebelum haul, tidak ada kewajiban zakat.',
   now() - interval '5 days 4 hours', 'seed-guru-hana'),

  ('Apa saja syarat sah pernikahan menurut syariat Islam?',
   'JAWABAN
Pernikahan sah apabila terpenuhi rukunnya, yaitu adanya calon suami istri, wali, dua orang saksi, serta ijab kabul yang jelas.

PENJELASAN
1. Rukun Nikah yang Harus Terpenuhi
Rukun nikah meliputi calon mempelai, wali dari pihak perempuan, dua orang saksi yang adil, dan ijab kabul yang diucapkan dengan jelas dan tidak terputus.

2. Wali dan Saksi Tidak Boleh Diabaikan
Pernikahan tanpa wali atau tanpa saksi dianggap tidak sah menurut jumhur ulama, karena keduanya termasuk rukun yang menentukan keabsahan akad.

REFERENSI
قال تعالى: وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً (القرآن الكريم، سورة الروم: ٢١)

KESIMPULAN
1. Nikah sah apabila rukun-rukunnya terpenuhi: mempelai, wali, saksi, dan ijab kabul.
2. Wali dan saksi merupakan rukun yang tidak boleh ditinggalkan.',
   now() - interval '6 days 2 hours', 'seed-guru-fajar'),

  ('Bagaimana adab menjaga keharmonisan rumah tangga menurut Islam?',
   'JAWABAN
Islam menganjurkan suami istri untuk saling bermusyawarah, menjaga komunikasi, dan memenuhi hak serta kewajiban masing-masing dengan penuh kasih sayang.

PENJELASAN
1. Musyawarah dan Komunikasi
Suami istri dianjurkan untuk saling bermusyawarah dalam mengambil keputusan rumah tangga, agar tercipta saling pengertian dan menghindari kesalahpahaman.

2. Saling Memenuhi Hak dan Kewajiban
Baik suami maupun istri memiliki hak dan kewajiban masing-masing yang harus dipenuhi secara seimbang, sebagaimana dicontohkan Rasulullah ﷺ dalam rumah tangganya.

REFERENSI
قال تعالى: وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً (القرآن الكريم، سورة الروم: ٢١)

KESIMPULAN
1. Musyawarah dan komunikasi yang baik menjadi kunci keharmonisan rumah tangga.
2. Suami istri wajib saling memenuhi hak dan kewajiban dengan penuh kasih sayang.',
   now() - interval '7 days 1 hour', 'seed-guru-hana'),

  ('Apakah diperbolehkan berinvestasi di reksa dana indeks yang memuat sebagian kecil saham tidak sesuai syariah?',
   'JAWABAN
Investasi tetap diperbolehkan jika bisnis utama perusahaan halal, dengan syarat pendapatan yang tidak sesuai syariah dibersihkan melalui purifikasi.

PENJELASAN
1. Kaidah Purifikasi Pendapatan
Jika sebagian kecil pendapatan berasal dari transaksi yang tidak sesuai syariah, maka bagian tersebut wajib dipisahkan dan disalurkan sebagai sedekah, bukan dinikmati sebagai keuntungan pribadi.

2. Pilih Instrumen Bersertifikasi Syariah
Sebagai kehati-hatian, disarankan memilih reksa dana yang telah memiliki sertifikasi syariah resmi dari otoritas yang berwenang, agar proses screening lebih terjamin.

REFERENSI
قال تعالى: وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا (القرآن الكريم، سورة البقرة: ٢٧٥)

KESIMPULAN
1. Investasi pada bisnis yang mayoritas halal diperbolehkan dengan purifikasi pendapatan yang tidak sesuai syariah.
2. Memilih instrumen bersertifikasi syariah lebih utama untuk kehati-hatian.',
   now() - interval '8 days 6 hours', 'seed-guru-fajar'),

  ('Bagaimana hukum jual beli dengan sistem cicilan (kredit) dalam Islam?',
   'JAWABAN
Jual beli kredit dengan harga yang disepakati di awal akad diperbolehkan, karena perbedaan harga tunai dan kredit merupakan bagian dari harga jual, bukan riba.

PENJELASAN
1. Harga Disepakati di Awal Akad
Selama harga kredit disepakati secara jelas di awal dan tidak berubah-ubah setelah akad, transaksi tersebut termasuk jual beli yang sah, bukan riba.

2. Berbeda dengan Riba Nasi''ah
Riba terjadi ketika ada tambahan atas keterlambatan pembayaran setelah akad disepakati, sedangkan penetapan harga kredit di awal akad adalah bagian dari harga jual yang disepakati bersama.

REFERENSI
قال تعالى: وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا (القرآن الكريم، سورة البقرة: ٢٧٥)

KESIMPULAN
1. Jual beli kredit dengan harga disepakati di awal akad diperbolehkan dan bukan riba.
2. Riba terjadi pada tambahan akibat keterlambatan pembayaran setelah akad, bukan pada penetapan harga kredit di awal.',
   now() - interval '9 days 3 hours', 'seed-guru-hana')
) AS a(title, content, created_at, guru);

-- Real examples the user pasted from the actual Sangu Umat WhatsApp group, to test how the
-- detail page renders genuine long-form, WhatsApp-style structured answers (section labels,
-- numbered points, Arabic references) vs a short plain question left unanswered. The answer's
-- original title/PERTANYAAN preamble (restating this same question) was trimmed off for the
-- same reason as the other 10 answers above — the page already shows the question separately.

INSERT INTO "Questions" ("Title", "Content", "CreatedAt", "UserId")
VALUES
  ('Hukum Mengadakan Pernikahan di Bulan Muharram/Suro',
   'Bu Ustazah. Tolong dijelaskan hukum mengadakan acara pernikahan di bulan muharam atau suro? Apakah benar, dalam islam ada larangan tersebut?',
   now() - interval '6 hours', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-siti'));

INSERT INTO "Questions" ("Title", "Content", "CreatedAt", "UserId")
VALUES
  ('Hukum Suami Menolak Ajakan Istri untuk Berhubungan Intim',
   'Apakah suami berdosa jika menolak ajakan istrinya untuk berhubungan intim? Misalnya istri yang menginginkan hubungan intim, tetapi suami menolak karena capek, sibuk, atau alasan lainnya.',
   now() - interval '11 hours', (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-user-budi'));

INSERT INTO "Answers" ("Content", "CreatedAt", "QuestionId", "UserId")
VALUES
  ('JAWABAN
Suami tidak otomatis berdosa ketika menolak ajakan istri untuk berhubungan intim. Namun, jika penolakan tersebut dilakukan terus-menerus tanpa alasan yang dibenarkan hingga kebutuhan dan hak batin istri terabaikan, maka suami dapat berdosa karena tidak memenuhi kewajibannya terhadap istrinya.


PENJELASAN
1.⁠ ⁠Nafkah Batin Termasuk Kewajiban Suami
Sebagaimana istri memiliki kewajiban memenuhi hak suami, suami juga memiliki kewajiban memberikan nafkah batin kepada istrinya.

Karena itu, hubungan intim dalam Islam bukan hanya hak suami semata, tetapi juga merupakan hak istri yang harus diperhatikan dan dipenuhi secara patut.


2. Ulama Berbeda Pendapat Tentang Batas Minimalnya
Para ulama berbeda pendapat mengenai kadar minimal hubungan intim yang wajib dipenuhi suami.
➜ Sebagian ulama Syafi''iyyah berpendapat kewajiban minimalnya adalah sekali selama masa pernikahan.
➜ Ulama Hanafiyyah berpendapat minimal sekali dalam empat bulan.
➜ Ulama Hanabilah juga berpendapat wajib sekali dalam empat bulan apabila tidak ada udzur.
➜ Pendapat yang kuat dalam Malikiyyah menyatakan bahwa suami wajib memenuhi kebutuhan batin istrinya secara wajar sesuai kebutuhan dan kemampuan, serta tidak boleh mengabaikannya tanpa alasan yang dibenarkan.

Perbedaan ini menunjukkan bahwa para ulama memang berbeda dalam menentukan batas minimalnya, namun mereka sepakat bahwa istri memiliki hak yang tidak boleh diabaikan begitu saja.


3. Letak Permasalahannya Bukan Pada Sekali Menolak
Yang menjadi persoalan bukan sekadar suami pernah menolak ajakan istrinya. Sebab seseorang bisa saja menolak karena:
➜ kelelahan,
➜ sakit,
➜ stres,
➜ kondisi psikis yang terganggu,
➜ atau udzur lainnya yang dapat dibenarkan.

Dalam kondisi seperti ini, suami tidak berdosa. Yang tercela adalah apabila penolakan dilakukan terus-menerus tanpa alasan yang sah, sehingga kebutuhan biologis istri terbengkalai dan menimbulkan mudarat dalam rumah tangga.


4. Penerapan Pada Kasus yang Ditanyakan
Apabila istri mengajak suami berhubungan intim, lalu suami menolak karena benar-benar lelah setelah bekerja, sedang sakit, atau kondisi fisiknya tidak memungkinkan, maka hal tersebut tidak berdosa.

Namun apabila suami terus-menerus menolak tanpa alasan yang jelas, padahal ia mampu melakukannya, sementara istrinya membutuhkan nafkah batin tersebut, maka ia dapat dianggap telah mengabaikan hak istrinya dan berdosa karena kelalaiannya.


5. Berbeda Dengan Hadits Laknat Malaikat
Hadits tentang laknat malaikat secara khusus berbicara mengenai istri yang menolak ajakan suami tanpa udzur syar''i.

Adapun suami yang menolak ajakan istri tidak disebut dalam hadits tersebut.

Akan tetapi, bukan berarti suami bebas menolak atau mengabaikan kebutuhan biologis istrinya sesuka hati. Sebab hubungan intim juga merupakan hak istri yang diakui oleh syariat, dan nafkah batin termasuk kewajiban yang harus dipenuhi oleh suami.

Karena itu, meskipun tidak terdapat ancaman laknat sebagaimana dalam kasus istri, suami tetap tidak boleh mengabaikan kebutuhan batin istrinya tanpa alasan yang dibenarkan, terlebih jika sampai menimbulkan penderitaan atau mudarat bagi istrinya.


REFERENSI

١.⁠ ⁠وأما الوطء فقد قال صاحب القبس : الوطء واجب على الزوج للمرأة عند مالك إذا انتفى العذر , وقال ابن حنبل والأجهوري : يجب على الرجل وطء زوجته ويقضى عليه به حيث تضررت المرأة بتركه وقدر عليه الزوج , لأن الإنسان لا يكلف ما لا يطيقه , والراجح أنها إذا شكت قلة الوطء يقضى لها في كل أربع ليال بليلة , كما أن الصحيح إذا شكا الزوج من قلة الجماع أن يقضى له عليها بما تطيقه كالأجير , خلافا لمن قال : يقضى بأربع مرات في اليوم والليلة لاختلاف أحوال الناس فقد لا تطيق المرأة ذلك (الفواكه الدواني الجزء الخامس صحـ 131)

٢.⁠ ⁠فصل ( ويلزمه ) أي : الزوج ( وطء ) زوجته مسلمة كانت أو كافرة , حرة أو أمة بطلبها ( في كل ثلث سنة مرة إن قدر ) على الوطء نصا ; لأنه تعالى قدره في أربعة أشهر في حق المولى , وكذا في حق غيره ; لأن اليمين لا توجب ما حلف عليه فدل أن الوطء واجب بدونها ( و ) يلزمه ( مبيت ) في المضجع على ما ذكره في " نظم المفردات " و " الإقناع " واستدل عليه الشيخ تقي الدين بمواضع من كلامهم , وذكر في الفروع نصوصا تقتضيه ( بطلب عند ) زوجة ( حرة ليلة من أربع ) ليال إن لم يكن عذر ( كأنها واحدة ) (مطالب أولي النهى الجزء الخامس صحـ 265)

٣.⁠ ⁠واختلف العلماء فيمن كف عن جماع زوجته فقال مالك إن كان بغير ضرورة ألزم به أو يفرق بينهما ونحوه عن أحمد والمشهور عند الشافعية أنه لا يجب عليه وقيل يجب مرة وعن بعض السلف في أربع ليلة وعن بعضهم في كل طهر مرة (فتح البارئ الجزء التاسع صحـ 373)

KESIMPULAN
1.⁠ ⁠Nafkah batin merupakan salah satu kewajiban suami kepada istrinya.
2.⁠ ⁠Suami tidak berdosa jika menolak karena adanya udzur, seperti sakit, kelelahan berat, atau kondisi yang tidak memungkinkan.
3.⁠ ⁠Ulama berbeda pendapat mengenai batas minimal hubungan intim yang wajib dipenuhi suami.
4.⁠ ⁠Yang tercela adalah apabila suami terus-menerus mengabaikan kebutuhan biologis istrinya tanpa alasan yang dibenarkan.
5.⁠ ⁠Hadits laknat malaikat berlaku bagi istri yang menolak ajakan suami tanpa udzur, bukan bagi suami.
6.⁠ ⁠Meskipun demikian, suami tetap wajib memperhatikan dan memenuhi hak batin istrinya sesuai kemampuan dan keadaan yang wajar.',
   now() - interval '9 hours',
   (SELECT "Id" FROM "Questions" WHERE "Title" = 'Hukum Suami Menolak Ajakan Istri untuk Berhubungan Intim'),
   (SELECT "Id" FROM "Users" WHERE "GoogleId" = 'seed-guru-hana'));

COMMIT;
