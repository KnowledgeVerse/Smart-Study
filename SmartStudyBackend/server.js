// server.js – Node + Express + Multer
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Helper to slugify text (lowercase, underscores)
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with _
    .replace(/[^\w\_]+/g, "") // Remove all non-word chars
    .replace(/\_\_+/g, "_") // Replace multiple _ with single _
    .replace(/^_+/, "") // Trim _ from start
    .replace(/_+$/, ""); // Trim _ from end
}

// Helper to determine folder path based on category and class
function getBookFolderPath(category, cls) {
  // 1. Pre-School (pre_books)
  const preMap = {
    PreNursery: "pre_nursery",
    Nursery: "nursery",
    LKG: "lkg",
    UKG: "ukg",
  };
  if (preMap[category]) {
    return path.join("books", "pre_books", preMap[category]);
  }

  // Fallback for generic preschool (user mentioned existing files are here)
  if (category === "Prebooks" || cls === "preschool") return "books/preschool";

  // Helper for class folder name (e.g., "1" -> "class1")
  const getClassFolder = (c) => (isNaN(c) ? c : `class${c}`);

  // 2. National Board
  const natMap = { NCERT: "ncert", CBSE: "cbse", ICSE: "icse_isc" };
  if (natMap[category]) {
    return path.join(
      "books",
      "national_board",
      natMap[category],
      getClassFolder(cls)
    );
  }

  // 3. State Board
  const stateMap = { Bihar: "bihar_board", UP: "up_board", MP: "mp_board" };
  if (stateMap[category]) {
    return path.join(
      "books",
      "state_board",
      stateMap[category],
      getClassFolder(cls)
    );
  }

  // 4. Comics
  const comicsMap = {
    KidsComics: "kids_comics",
    IndianClassics: "indian_classics",
    International: "international_comics",
    Learning: "learning_comics",
  };
  if (comicsMap[category]) {
    return path.join("books", "comics", comicsMap[category]);
  }

  // 5. Story Books
  const storyMap = {
    KidsStories: "kids_stories",
    MoralStories: "moral_stories",
    FolkTales: "folk_tales",
    ClassicStories: "classic_stories",
    ShortStories: "short_stories",
  };
  if (storyMap[category]) {
    return path.join("books", "story_books", storyMap[category]);
  }

  // 6. GK & Competitive
  const gkMap = {
    GK: "gk",
    Competitive: "competitive_exams",
    SchoolLevel: "school_level",
  };
  if (gkMap[category]) {
    return path.join("books", "gk_competitive", gkMap[category]);
  }

  return "books/others";
}

// Helper for Activity Logging
const activityLogFile = path.join(
  __dirname,
  "../SmartStudyLibrary/data/activity_log.json"
);

function logActivity(action, details) {
  try {
    let logs = [];
    if (fs.existsSync(activityLogFile)) {
      logs = JSON.parse(fs.readFileSync(activityLogFile, "utf-8"));
    }
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    logs.unshift(newLog); // Add to beginning
    // Keep only last 100 logs
    if (logs.length > 100) logs = logs.slice(0, 100);

    fs.writeFileSync(activityLogFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { category, class: cls } = req.body;
    if (!category || !cls) {
      // Fallback to temp dir if metadata is missing (e.g. cover update)
      const tempDir = path.join(__dirname, "uploads/temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      return cb(null, tempDir);
    }
    const relativePath = getBookFolderPath(category, cls);
    const dir = path.join(__dirname, "../SmartStudyLibrary", relativePath);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name =
      file.fieldname === "cover"
        ? `cover_${Date.now()}${ext}`
        : file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post(
  "/upload-book",
  upload.fields([{ name: "cover" }, { name: "pdf" }]),
  (req, res) => {
    try {
      // Ensure PDF is present
      if (!req.files || !req.files.pdf) {
        return res
          .status(400)
          .json({ success: false, error: "PDF file is required" });
      }

      const { name, class: cls, subject, board, category } = req.body;

      // Check if metadata is complete and cover exists
      const hasCover = req.files.cover && req.files.cover.length > 0;
      const isComplete =
        name && cls && subject && board && category && hasCover;

      if (!isComplete) {
        // === MOVE TO DRAFT ===
        const draftDir = path.join(__dirname, "uploads/draft");
        if (!fs.existsSync(draftDir))
          fs.mkdirSync(draftDir, { recursive: true });

        const pdfFile = req.files.pdf[0];
        const pdfFilename = `draft_${Date.now()}_${pdfFile.originalname}`;
        const newPdfPath = path.join(draftDir, pdfFilename);

        // Move PDF
        fs.renameSync(pdfFile.path, newPdfPath);

        let newCoverPath = null;
        if (hasCover) {
          const coverFile = req.files.cover[0];
          const coverFilename = `draft_cover_${Date.now()}${path.extname(
            coverFile.originalname
          )}`;
          newCoverPath = path.join(draftDir, coverFilename);
          fs.renameSync(coverFile.path, newCoverPath);
        }

        // Save to draft.json
        const draftFile = path.join(
          __dirname,
          "../SmartStudyLibrary/data/draft.json"
        );
        let drafts = [];
        if (fs.existsSync(draftFile)) {
          try {
            drafts = JSON.parse(fs.readFileSync(draftFile, "utf-8"));
          } catch (e) {}
        }

        drafts.push({
          id: Date.now(),
          name: name || pdfFile.originalname,
          originalName: pdfFile.originalname,
          path: newPdfPath,
          mimetype: pdfFile.mimetype,
          cover: newCoverPath,
          board: board || null,
          class: cls || null,
          subject: subject || null,
          finalized: false,
        });

        fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));
        return res.json({
          success: true,
          msg: "Saved as draft (incomplete details)",
        });
      }

      // === PUBLISH BOOK (Complete) ===
      const folderPath = getBookFolderPath(category, cls);
      const coverPath = `${folderPath}/${req.files.cover[0].filename}`.replace(
        /\\/g,
        "/"
      );
      const pdfPath = `${folderPath}/${req.files.pdf[0].filename}`.replace(
        /\\/g,
        "/"
      );

      // Update books.json
      const booksFile = path.join(
        __dirname,
        "../SmartStudyLibrary/data/books.json"
      );
      const books = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
      books.books.push({
        id: Date.now(),
        name,
        class: cls,
        subject,
        board,
        category,
        cover: coverPath,
        pdf: pdfPath,
      });
      fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

      logActivity("Upload", `Uploaded book: ${name} (${category})`);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

function requireAdmin(req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token || token !== "admin-token-007")
    return res.status(403).json({ success: false, msg: "Forbidden" });
  next();
}

// DELETE book
app.delete("/admin/book/:id", requireAdmin, (req, res) => {
  try {
    const booksFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/books.json"
    );
    const data = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
    const bookIndex = data.books.findIndex((b) => b.id == req.params.id);
    if (bookIndex === -1) return res.status(404).json({ success: false });

    const book = data.books[bookIndex];
    const bookName = book.name;
    // delete files
    // Fix: Resolve path relative to SmartStudyLibrary
    if (
      book.cover &&
      fs.existsSync(path.join(__dirname, "../SmartStudyLibrary", book.cover))
    )
      fs.unlinkSync(path.join(__dirname, "../SmartStudyLibrary", book.cover));
    if (
      book.pdf &&
      fs.existsSync(path.join(__dirname, "../SmartStudyLibrary", book.pdf))
    )
      fs.unlinkSync(path.join(__dirname, "../SmartStudyLibrary", book.pdf));

    data.books.splice(bookIndex, 1);
    fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
    logActivity("Delete", `Deleted book: ${bookName} (ID: ${req.params.id})`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE cover only
app.post(
  "/admin/book/:id/cover",
  requireAdmin,
  upload.single("newCover"),
  (req, res) => {
    try {
      const booksFile = path.join(
        __dirname,
        "../SmartStudyLibrary/data/books.json"
      );
      const data = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
      const book = data.books.find((b) => b.id == req.params.id);
      if (!book) return res.status(404).json({ success: false });

      // delete old cover
      const oldCoverPath = path.join(
        __dirname,
        "../SmartStudyLibrary",
        book.cover
      );
      if (fs.existsSync(oldCoverPath)) fs.unlinkSync(oldCoverPath);
      // new path
      const ext = path.extname(req.file.originalname);
      const folderPath = getBookFolderPath(book.category, book.class);
      const newCoverPath = `${folderPath}/cover_${Date.now()}${ext}`.replace(
        /\\/g,
        "/"
      );

      fs.renameSync(
        req.file.path,
        path.join(__dirname, "../SmartStudyLibrary", newCoverPath)
      );
      book.cover = newCoverPath;
      fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
      logActivity("Cover Update", `Updated cover for book: ${book.name}`);
      res.json({ success: true, cover: newCoverPath });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// EDIT Book Details (Move files if category/class changes)
app.post("/admin/book/:id/edit", requireAdmin, (req, res) => {
  try {
    const {
      name,
      class: newClass,
      subject: newSubject,
      category: newCategory,
    } = req.body;
    const booksFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/books.json"
    );
    const data = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
    const book = data.books.find((b) => b.id == req.params.id);

    if (!book)
      return res.status(404).json({ success: false, msg: "Book not found" });

    // Helper to sanitize folder name from subject (keep spaces, remove illegal chars)
    const safeSubject = newSubject.trim().replace(/[\\/:*?"<>|]/g, "");

    // Calculate new paths
    // We append subject folder to ensure scanner detects it correctly
    const baseFolder = getBookFolderPath(newCategory, newClass);
    const newFolder = path.join(baseFolder, safeSubject).replace(/\\/g, "/");
    const newAbsDir = path.join(__dirname, "../SmartStudyLibrary", newFolder);

    // Current paths
    const currentPdfPath = book.pdf;
    const currentCoverPath = book.cover;

    // New paths
    const pdfName = path.basename(currentPdfPath);
    const newPdfPath = `${newFolder}/${pdfName}`.replace(/\\/g, "/");

    let coverName = "";
    let newCoverPath = "";
    if (currentCoverPath) {
      coverName = path.basename(currentCoverPath);
      newCoverPath = `${newFolder}/${coverName}`.replace(/\\/g, "/");
    }

    // Check if we need to move files (if path changed)
    if (
      currentPdfPath !== newPdfPath ||
      (currentCoverPath && currentCoverPath !== newCoverPath)
    ) {
      if (!fs.existsSync(newAbsDir))
        fs.mkdirSync(newAbsDir, { recursive: true });

      // Move PDF
      const oldPdfAbs = path.join(
        __dirname,
        "../SmartStudyLibrary",
        currentPdfPath
      );
      if (fs.existsSync(oldPdfAbs)) {
        fs.renameSync(
          oldPdfAbs,
          path.join(__dirname, "../SmartStudyLibrary", newPdfPath)
        );
        book.pdf = newPdfPath;
      }

      // Move Cover
      if (currentCoverPath) {
        const oldCoverAbs = path.join(
          __dirname,
          "../SmartStudyLibrary",
          currentCoverPath
        );
        if (fs.existsSync(oldCoverAbs)) {
          fs.renameSync(
            oldCoverAbs,
            path.join(__dirname, "../SmartStudyLibrary", newCoverPath)
          );
          book.cover = newCoverPath;
        }
      }
    }

    // Update metadata
    book.name = name;
    book.class = newClass;
    book.subject = newSubject;
    book.category = newCategory;
    book.board = newCategory; // Assuming board maps to category for simplicity in display

    fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
    logActivity("Edit", `Edited details for book: ${name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ORGANIZE Book Files (Move to correct folder structure)
app.post("/admin/book/:id/organize", requireAdmin, (req, res) => {
  try {
    const booksFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/books.json"
    );
    const data = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
    const book = data.books.find((b) => b.id == req.params.id);

    if (!book)
      return res.status(404).json({ success: false, msg: "Book not found" });

    const newFolder = getBookFolderPath(book.category, book.class);
    const newAbsDir = path.join(__dirname, "../SmartStudyLibrary", newFolder);

    if (!fs.existsSync(newAbsDir)) fs.mkdirSync(newAbsDir, { recursive: true });

    let moved = false;

    // Move Cover
    if (
      book.cover &&
      fs.existsSync(path.join(__dirname, "../SmartStudyLibrary", book.cover))
    ) {
      const currentAbsPath = path.join(
        __dirname,
        "../SmartStudyLibrary",
        book.cover
      );
      const fileName = path.basename(book.cover);
      const newAbsPath = path.join(newAbsDir, fileName);

      // Only move if paths are different
      if (path.resolve(currentAbsPath) !== path.resolve(newAbsPath)) {
        fs.renameSync(currentAbsPath, newAbsPath);
        book.cover = `${newFolder}/${fileName}`.replace(/\\/g, "/");
        moved = true;
      }
    }

    // Move PDF
    if (
      book.pdf &&
      fs.existsSync(path.join(__dirname, "../SmartStudyLibrary", book.pdf))
    ) {
      const currentAbsPath = path.join(
        __dirname,
        "../SmartStudyLibrary",
        book.pdf
      );
      const fileName = path.basename(book.pdf);
      const newAbsPath = path.join(newAbsDir, fileName);

      if (path.resolve(currentAbsPath) !== path.resolve(newAbsPath)) {
        fs.renameSync(currentAbsPath, newAbsPath);
        book.pdf = `${newFolder}/${fileName}`.replace(/\\/g, "/");
        moved = true;
      }
    }

    if (moved) {
      fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
      res.json({ success: true, msg: "Files moved successfully" });
    } else {
      res.json({ success: true, msg: "Files already in correct folder" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// BULK EDIT Books (Change Category)
app.post("/admin/books/bulk-edit", requireAdmin, (req, res) => {
  try {
    const { bookIds, newCategory } = req.body;
    if (!bookIds || !Array.isArray(bookIds) || !newCategory) {
      return res.status(400).json({ success: false, msg: "Invalid data" });
    }

    const booksFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/books.json"
    );
    const data = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
    let updatedCount = 0;

    data.books.forEach((book) => {
      if (bookIds.includes(book.id.toString()) || bookIds.includes(book.id)) {
        if (book.category !== newCategory) {
          // Move files logic
          const oldFolder = getBookFolderPath(book.category, book.class);
          const newFolder = getBookFolderPath(newCategory, book.class);
          const newAbsDir = path.join(
            __dirname,
            "../SmartStudyLibrary",
            newFolder
          );

          if (!fs.existsSync(newAbsDir))
            fs.mkdirSync(newAbsDir, { recursive: true });

          // Move Cover
          if (
            book.cover &&
            fs.existsSync(
              path.join(__dirname, "../SmartStudyLibrary", book.cover)
            )
          ) {
            const coverName = path.basename(book.cover);
            const newCoverPath = path.join(newAbsDir, coverName);
            fs.renameSync(
              path.join(__dirname, "../SmartStudyLibrary", book.cover),
              newCoverPath
            );
            book.cover = `${newFolder}/${coverName}`.replace(/\\/g, "/");
          }

          // Move PDF
          if (
            book.pdf &&
            fs.existsSync(
              path.join(__dirname, "../SmartStudyLibrary", book.pdf)
            )
          ) {
            const pdfName = path.basename(book.pdf);
            const newPdfPath = path.join(newAbsDir, pdfName);
            fs.renameSync(
              path.join(__dirname, "../SmartStudyLibrary", book.pdf),
              newPdfPath
            );
            book.pdf = `${newFolder}/${pdfName}`.replace(/\\/g, "/");
          }

          book.category = newCategory;
          book.board = newCategory; // Sync board if needed
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      fs.writeFileSync(booksFile, JSON.stringify(data, null, 2));
    }

    logActivity(
      "Bulk Edit",
      `Updated category to ${newCategory} for ${updatedCount} books`
    );
    res.json({ success: true, updatedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NEW: Dynamic Book Scanner API
// Helper to format keys for display
function formatKey(key) {
  if (!key) return "";
  const lower = key.toLowerCase();
  const map = {
    ncert: "NCERT",
    cbse: "CBSE",
    icse_isc: "ICSE",
    bihar_board: "Bihar Board",
    up_board: "UP Board",
    mp_board: "MP Board",
    pre_nursery: "Pre-Nursery",
    nursery: "Nursery",
    lkg: "LKG",
    ukg: "UKG",
    gk: "GK",
    evs: "EVS",
    kids_comics: "Kids Comics",
    indian_classics: "Indian Classics",
    international_comics: "International Comics",
    learning_comics: "Learning Comics",
    kids_stories: "Kids Stories",
    moral_stories: "Moral Stories",
    folk_tales: "Folk Tales",
    classic_stories: "Classic Stories",
    short_stories: "Short Stories",
    competitive_exams: "Competitive Exams",
    school_level: "School Level",
  };
  if (map[lower]) return map[lower];
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Recursive Scanner: Finds ALL PDFs in any folder structure
const getAllBooksFromFolders = (dir, rootDir, fileList = []) => {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllBooksFromFolders(fullPath, rootDir, fileList);
    } else {
      if (path.extname(file).toLowerCase() === ".pdf") {
        const relativePath = path
          .relative(rootDir, fullPath)
          .replace(/\\/g, "/");
        const parts = relativePath.split("/");
        // parts[0] is 'books'

        let category = "General";
        let board = "General";
        let cls = "General";
        let subject = "General";
        let name = path.basename(file, ".pdf");

        // 1. Try to detect Class (looks for 'class12', 'preschool', etc.)
        const classPart = parts.find(
          (p) =>
            p.toLowerCase().startsWith("class") &&
            !isNaN(p.toLowerCase().replace("class", ""))
        );
        if (classPart) {
          cls = classPart.toLowerCase().replace("class", "");
        } else {
          const lowerPath = relativePath.toLowerCase();
          if (
            lowerPath.includes("preschool") ||
            lowerPath.includes("nursery") ||
            lowerPath.includes("lkg") ||
            lowerPath.includes("ukg")
          ) {
            cls = "preschool";
          }
        }

        // 2. Try to detect Board/Category (usually the folder after 'books')
        if (parts.length > 1) {
          const p1 = parts[1];
          // If structure is books/national_board/ncert...
          if (
            ["national_board", "state_board"].includes(p1.toLowerCase()) &&
            parts.length > 2
          ) {
            category = formatKey(p1);
            board = formatKey(parts[2]);
          } else {
            // If structure is books/preschool... or books/NCERT...
            category = formatKey(p1);
            board = formatKey(p1);
          }
        }

        // 3. Try to detect Subject
        // If parent folder is NOT class and NOT board, it is likely Subject
        const parentDir = parts[parts.length - 2];
        if (parts.length > 2) {
          const isParentClass =
            parentDir.toLowerCase().startsWith("class") ||
            parentDir.toLowerCase() === cls;
          const isParentBoard = parentDir === parts[1];

          if (!isParentClass && !isParentBoard && parentDir !== "books") {
            subject = formatKey(parentDir);
          } else {
            subject = formatKey(name); // Fallback to filename
          }
        } else {
          subject = formatKey(name);
        }

        // Cover Image Check
        const coverJpg = fullPath.replace(/\.pdf$/i, ".jpg");
        const coverPng = fullPath.replace(/\.pdf$/i, ".png");
        let cover = "";
        if (fs.existsSync(coverJpg))
          cover = path.relative(rootDir, coverJpg).replace(/\\/g, "/");
        else if (fs.existsSync(coverPng))
          cover = path.relative(rootDir, coverPng).replace(/\\/g, "/");

        fileList.push({
          id: relativePath,
          name: name,
          category: category,
          board: board,
          class: cls,
          subject: subject,
          pdf: relativePath,
          date: stat.birthtime || stat.mtime,
          cover: cover,
        });
      }
    }
  }
  return fileList;
};

// NEW: Rescan & Sync API (Cleans up missing files)
app.post("/admin/rescan", requireAdmin, (req, res) => {
  try {
    const rootDir = path.join(__dirname, "../SmartStudyLibrary");
    const booksDir = path.join(rootDir, "books");
    const booksFile = path.join(rootDir, "data/books.json");

    console.log("🔄 Rescanning Library...");

    // 1. Scan actual files
    const scannedBooks = getAllBooksFromFolders(booksDir, rootDir);

    // 2. Read existing JSON
    let existingBooks = [];
    if (fs.existsSync(booksFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(booksFile, "utf8"));
        existingBooks = data.books || [];
      } catch (e) {
        console.warn("⚠️ Could not read books.json, starting fresh.");
      }
    }

    // 3. Map existing books by PDF path for matching
    const existingMap = new Map();
    existingBooks.forEach((b) => {
      if (b.pdf) existingMap.set(b.pdf.replace(/\\/g, "/"), b);
    });

    // 4. Merge: Iterate over SCANNED books (Source of Truth)
    // This automatically drops any book from JSON that isn't in the scan.
    const mergedBooks = scannedBooks.map((scanned) => {
      const existing = existingMap.get(scanned.pdf);
      if (existing) {
        return {
          ...scanned, // Use scanned structure (correct path/category)
          name: existing.name || scanned.name, // Preserve custom name
          cover: existing.cover || scanned.cover, // Preserve custom cover
        };
      }
      return scanned; // New book
    });

    // 5. Write back to books.json
    fs.writeFileSync(
      booksFile,
      JSON.stringify({ books: mergedBooks }, null, 2)
    );

    console.log(`✅ Rescan complete. Synced ${mergedBooks.length} books.`);
    logActivity(
      "Rescan",
      `Library rescanned. Total books: ${mergedBooks.length}`
    );
    res.json({ success: true, count: mergedBooks.length });
  } catch (err) {
    console.error("❌ Rescan failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/books", (req, res) => {
  try {
    const rootDir = path.join(__dirname, "../SmartStudyLibrary");
    const booksDir = path.join(rootDir, "books");
    const booksFile = path.join(rootDir, "data/books.json");

    console.log("📂 Scanning books from:", booksDir);

    // Ensure books directory exists to prevent crash
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    // 1. Get Scanned Books
    const scannedBooks = getAllBooksFromFolders(booksDir, rootDir);

    // 2. Get Saved Books from JSON
    let savedBooks = [];
    if (fs.existsSync(booksFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(booksFile, "utf8"));
        savedBooks = data.books || [];
      } catch (e) {
        console.warn("⚠️ Could not read books.json");
      }
    }

    // 3. Merge: Create a map by ID (path) to avoid duplicates
    // Priority: Scanned > Saved (to ensure file existence check if needed, but here we want to show all)
    const bookMap = new Map();
    savedBooks.forEach((b) => bookMap.set(b.id, b)); // Add saved first
    scannedBooks.forEach((b) => bookMap.set(b.id, b)); // Overwrite with scanned (live status)

    const finalBooks = Array.from(bookMap.values());

    console.log(`✅ Serving ${finalBooks.length} books (Scanned + JSON)`);
    res.json({ books: finalBooks });
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// NEW: Get Activity Log
app.get("/admin/activity-log", requireAdmin, (req, res) => {
  try {
    if (fs.existsSync(activityLogFile)) {
      const logs = JSON.parse(fs.readFileSync(activityLogFile, "utf-8"));
      res.json({ success: true, logs });
    } else {
      res.json({ success: true, logs: [] });
    }
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server ready → http://localhost:${PORT}`)
);

// Upload to DRAFT (no JSON entry)
// Ensure draft directory exists
const draftDir = path.join(__dirname, "uploads/draft");
if (!fs.existsSync(draftDir)) {
  fs.mkdirSync(draftDir, { recursive: true });
}
const draftUpload = multer({ dest: "uploads/draft/" });
app.post(
  "/admin/draft-upload",
  draftUpload.fields([{ name: "cover" }, { name: "pdf" }]),
  (req, res) => {
    try {
      const { originalname, path, mimetype } = req.files.pdf[0];
      const draft = {
        id: Date.now(),
        name: path.split("/").pop(), // unique name
        originalName: originalname,
        path: path,
        mimetype: mimetype,
        cover: req.files.cover ? req.files.cover[0].path : null,
        board: null,
        class: null,
        subject: null,
        finalized: false,
      };
      const draftFile = path.join(
        __dirname,
        "../SmartStudyLibrary/data/draft.json"
      );
      const drafts = JSON.parse(fs.readFileSync(draftFile, "utf-8"));
      drafts.push(draft);
      fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));
      res.json({ success: true, draft });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// Update DRAFT cover
app.post(
  "/admin/draft/:id/cover",
  requireAdmin,
  draftUpload.single("cover"),
  (req, res) => {
    try {
      const draftFile = path.join(
        __dirname,
        "../SmartStudyLibrary/data/draft.json"
      );
      const drafts = JSON.parse(fs.readFileSync(draftFile, "utf-8"));
      const draft = drafts.find((d) => d.id == req.params.id);
      if (!draft)
        return res.status(404).json({ success: false, msg: "Draft not found" });

      if (draft.cover && fs.existsSync(draft.cover)) fs.unlinkSync(draft.cover);

      draft.cover = req.file.path;
      fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));
      res.json({ success: true, cover: req.file.path });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// Get all drafts
app.get("/admin/drafts", requireAdmin, (req, res) => {
  try {
    const draftFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/draft.json"
    );
    const drafts = JSON.parse(fs.readFileSync(draftFile, "utf-8"));
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Finalize draft → move to real + JSON entry
app.post("/admin/draft-finalize/:id", requireAdmin, (req, res) => {
  try {
    const { board, class: cls, subject, name } = req.body;
    if (!board || !cls || !subject || !name)
      return res.status(400).json({ success: false, msg: "Missing fields" });

    const draftFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/draft.json"
    );
    const drafts = JSON.parse(fs.readFileSync(draftFile, "utf-8"));
    const draftIndex = drafts.findIndex((d) => d.id == req.params.id);
    if (draftIndex === -1) return res.status(404).json({ success: false });

    const draft = drafts[draftIndex];

    // create folder structure
    const baseDir = path.join(
      __dirname,
      "../SmartStudyLibrary/books",
      board,
      cls,
      subject
    );
    fs.mkdirSync(baseDir, { recursive: true });

    // move files
    const ext = path.extname(draft.originalName);
    const newPdfName = `${name}${ext}`;
    const newCoverName = `cover_${Date.now()}.jpg`;
    const pdfFinal = path.join(baseDir, newPdfName);

    fs.renameSync(draft.path, pdfFinal);

    let finalCoverPath = "";
    if (draft.cover) {
      const coverFinal = path.join(baseDir, newCoverName);
      fs.renameSync(draft.cover, coverFinal);
      // Note: Draft finalize might need update to use getBookFolderPath logic if strict folder structure is needed here too.
      finalCoverPath =
        `books/${board}/${cls}/${subject}/${newCoverName}`.replace(/\\/g, "/");
    }

    // add to books.json
    const booksFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/books.json"
    );
    const booksData = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
    booksData.books.push({
      id: Date.now(),
      name,
      class: cls,
      subject,
      board,
      category: board,
      cover: finalCoverPath,
      pdf: `books/${board}/${cls}/${subject}/${newPdfName}`.replace(/\\/g, "/"),
    });
    fs.writeFileSync(booksFile, JSON.stringify(booksData, null, 2));

    // remove from draft
    drafts.splice(draftIndex, 1);
    fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));

    logActivity("Draft Finalized", `Finalized draft: ${name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete draft
app.delete("/admin/draft/:id", requireAdmin, (req, res) => {
  try {
    const draftFile = path.join(
      __dirname,
      "../SmartStudyLibrary/data/draft.json"
    );
    const drafts = JSON.parse(fs.readFileSync(draftFile, "utf-8"));
    const index = drafts.findIndex((d) => d.id == req.params.id);
    if (index === -1) return res.status(404).json({ success: false });
    const draft = drafts[index];
    if (fs.existsSync(draft.path)) fs.unlinkSync(draft.path);
    if (draft.cover && fs.existsSync(draft.cover)) fs.unlinkSync(draft.cover);
    drafts.splice(index, 1);
    fs.writeFileSync(draftFile, JSON.stringify(drafts, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
