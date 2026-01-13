// server.js – Node + Express + Multer
const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { category, class: cls } = req.body;
    const dir = path.join(__dirname, '../SmartStudyLibrary/books', category, cls);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname === 'cover' ? `cover_${Date.now()}${ext}` : file.originalname;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload-book', upload.fields([{ name: 'cover' }, { name: 'pdf' }]), (req, res) => {
  try {
    const { name, class: cls, subject, board, category } = req.body;
    const coverPath = `books/${category}/${cls}/${req.files.cover[0].filename}`;
    const pdfPath   = `books/${category}/${cls}/${req.files.pdf[0].filename}`;

    // Update books.json
    const booksFile = path.join(__dirname, '../SmartStudyLibrary/data/books.json');
    const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    books.books.push({
      id: Date.now(),
      name,
      class: cls,
      subject,
      board,
      category,
      cover: coverPath,
      pdf: pdfPath
    });
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

    res.json({ success: true });
  } catch (err) {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
}
});


function requireAdmin(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token || token !== 'admin-token-007') return res.status(403).json({ success: false, msg: 'Forbidden' });
  next();
}

// DELETE book
app.delete('/admin/book/:id', requireAdmin, (req, res) => {
  try {
    const booksFile = path.join(__dirname, '../SmartStudyLibrary/data/books.json');
    const data = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    const bookIndex = data.books.findIndex(b => b.id == req.params.id);
    if (bookIndex === -1) return res.status(404).json({ success: false });

    const book = data.books[bookIndex];
    // delete files
    if (fs.existsSync(book.cover)) fs.unlinkSync(book.cover);
    if (fs.existsSync(book.pdf)) fs.unlinkSync(book.pdf);

    data.books.splice(bookIndex, 1);
    fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// UPDATE cover only
app.post('/admin/book/:id/cover', requireAdmin, upload.single('newCover'), (req, res) => {
  try {
    const booksFile = path.join(__dirname, '../SmartStudyLibrary/data/books.json');
    const data = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    const book = data.books.find(b => b.id == req.params.id);
    if (!book) return res.status(404).json({ success: false });

    // delete old cover
    if (fs.existsSync(book.cover)) fs.unlinkSync(book.cover);
    // new path
    const ext = path.extname(req.file.originalname);
    const newCoverPath = `books/${book.category}/${book.class}/cover_${Date.now()}${ext}`;
    fs.renameSync(req.file.path, path.join(__dirname, '../SmartStudyLibrary', newCoverPath));
    book.cover = newCoverPath;
    fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
    res.json({ success: true, cover: newCoverPath });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server ready → http://localhost:${PORT}`));

// Upload to DRAFT (no JSON entry)
const draftUpload = multer({ dest: 'uploads/draft/' });
app.post('/admin/draft-upload', draftUpload.fields([{ name: 'cover' }, { name: 'pdf' }]), (req, res) => {
  try {
    const { originalname, path, mimetype } = req.files.pdf[0];
    const draft = {
      id: Date.now(),
      name: path.split('/').pop(), // unique name
      originalName: originalname,
      path: path,
      mimetype: mimetype,
      cover: req.files.cover ? req.files.cover[0].path : null,
      board: null, class: null, subject: null, finalized: false
    };
    const draftFile = path.join(__dirname, '../SmartStudyLibrary/data/draft.json');
    const drafts = JSON.parse(fs.readFileSync(draftFile, 'utf-8'));
    drafts.push(draft);
    fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));
    res.json({ success: true, draft });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Get all drafts
app.get('/admin/drafts', requireAdmin, (req, res) => {
  try {
    const draftFile = path.join(__dirname, '../SmartStudyLibrary/data/draft.json');
    const drafts = JSON.parse(fs.readFileSync(draftFile, 'utf-8'));
    res.json(drafts);
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Finalize draft → move to real + JSON entry
app.post('/admin/draft-finalize/:id', requireAdmin, (req, res) => {
  try {
    const { board, class: cls, subject, name } = req.body;
    if (!board || !cls || !subject || !name) return res.status(400).json({ success: false, msg: 'Missing fields' });

    const draftFile = path.join(__dirname, '../SmartStudyLibrary/data/draft.json');
    const drafts = JSON.parse(fs.readFileSync(draftFile, 'utf-8'));
    const draftIndex = drafts.findIndex(d => d.id == req.params.id);
    if (draftIndex === -1) return res.status(404).json({ success: false });

    const draft = drafts[draftIndex];

    // create folder structure
    const baseDir = path.join(__dirname, '../SmartStudyLibrary/books', board, cls, subject);
    fs.mkdirSync(baseDir, { recursive: true });

    // move files
    const ext = path.extname(draft.originalName);
    const newPdfName = `${name}${ext}`;
    const newCoverName = `cover_${Date.now()}.jpg`;
    const pdfFinal = path.join(baseDir, newPdfName);
    const coverFinal = path.join(baseDir, newCoverName);
    fs.renameSync(draft.path, pdfFinal);
    if (draft.cover) fs.renameSync(draft.cover, coverFinal);

    // add to books.json
    const booksFile = path.join(__dirname, '../SmartStudyLibrary/data/books.json');
    const booksData = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    booksData.books.push({
      id: Date.now(),
      name,
      class: cls,
      subject,
      board,
      category: board,
      cover: `books/${board}/${cls}/${subject}/${newCoverName}`,
      pdf: `books/${board}/${cls}/${subject}/${newPdfName}`
    });
    fs.writeFileSync(booksFile, JSON.stringify(booksData, null, 2));

    // remove from draft
    drafts.splice(draftIndex, 1);
    fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));

    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Delete draft
app.delete('/admin/draft/:id', requireAdmin, (req, res) => {
  try {
    const draftFile = path.join(__dirname, '../SmartStudyLibrary/data/draft.json');
    const drafts = JSON.parse(fs.readFileSync(draftFile, 'utf-8'));
    const index = drafts.findIndex(d => d.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false });
    const draft = drafts[index];
    if (fs.existsSync(draft.path)) fs.unlinkSync(draft.path);
    if (draft.cover && fs.existsSync(draft.cover)) fs.unlinkSync(draft.cover);
    drafts.splice(index, 1);
    fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});