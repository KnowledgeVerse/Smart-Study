// server.js (Node + Express + Multer)
const multer  = require('multer');
const fs      = require('fs');
const upload  = multer({ dest: 'uploads/' });

app.post('/upload-book', upload.fields([{ name: 'cover' }, { name: 'pdf' }]), (req, res) => {
  const { name, class: cls, subject, board, category } = req.body;
  const coverPath = `books/${category}/${cls}/cover_${Date.now()}.jpg`;
  const pdfPath   = `books/${category}/${cls}/${req.files.pdf[0].originalname}`;

  // Move files
  fs.renameSync(req.files.cover[0].path, coverPath);
  fs.renameSync(req.files.pdf[0].path, pdfPath);

  // Update books.json
  const books = JSON.parse(fs.readFileSync('data/books.json'));
  books.books.push({ id: Date.now(), name, class: cls, subject, board, category, cover: coverPath, pdf: pdfPath });
  fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

  res.json({ success: true });
});