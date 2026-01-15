/* ========== CORE APP VARIABLES ========== */
const classSelector = document.getElementById("classSelector");
const subjectFilter = document.getElementById("subjectFilter");
const bookGrid = document.getElementById("bookGrid");
const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const searchIconBtn = document.getElementById("searchIconBtn");
const searchBoxContainer = document.getElementById("searchBoxContainer");
const closeSearch = document.getElementById("closeSearch");
const bookSearch = document.getElementById("bookSearch");

// NEW: Dropdown elements
const mainLogo = document.getElementById("mainLogo");
const dropdownArrow = document.getElementById("dropdownArrow");
const dropdownMenu = document.getElementById("dropdownMenu");

// NEW: User Menu Elements
const userMenuContainer = document.getElementById("userMenuContainer");
const userProfileIcon = document.getElementById("userProfileIcon");
const userDropdownMenu = document.getElementById("userDropdownMenu");

const darkModeToggle = document.getElementById("darkModeToggle");
const backToTopBtn = document.getElementById("backToTopBtn");
const contactForm = document.getElementById("contactForm");

// NEW: About & Contact Modals
const aboutModal = document.getElementById("aboutModal");
const contactModal = document.getElementById("contactModal");
const closeAboutModal = document.getElementById("closeAboutModal");
const closeContactModal = document.getElementById("closeContactModal");

// NEW: Retry Modal Elements
const retryModal = document.getElementById("retryModal");
const retryMessage = document.getElementById("retryMessage");
const confirmRetryBtn = document.getElementById("confirmRetryBtn");
const cancelRetryBtn = document.getElementById("cancelRetryBtn");

// NEW: Edit Modal Elements
const editBookModal = document.getElementById("editBookModal");
const editBookForm = document.getElementById("editBookForm");
const closeEditModal = document.getElementById("closeEditModal");
const editBookName = document.getElementById("editBookName");
const editBookCategory = document.getElementById("editBookCategory");
const editBookClass = document.getElementById("editBookClass");
const editBookSubject = document.getElementById("editBookSubject");
const editBookId = document.getElementById("editBookId");

// NEW: Bulk Edit Elements
const bulkEditModal = document.getElementById("bulkEditModal");
const closeBulkEditModal = document.getElementById("closeBulkEditModal");
const bulkEditForm = document.getElementById("bulkEditForm");
const bulkEditCategory = document.getElementById("bulkEditCategory");
const bulkActionsBar = document.getElementById("bulkActionsBar");
const bulkCounter = document.getElementById("bulkCounter");

const API_BASE_URL = "http://127.0.0.1:3000";

let selectedClass = "preschool";
let selectedBoard = "NCERT";
let selectedSubject = "all";
let isAdmin = localStorage.getItem("isSignedIn") === "true";

let selectedBookIds = new Set();

// Pagination Variables
let allFetchedBooks = [];
let currentPage = 1;
const booksPerPage = 50;

/* ========== SUBJECTS MAPPING ========== */
const subjectsMap = {
  preschool: ["Alphabet", "Numbers", "Rhymes", "Picture Stories"],
  1: ["Maths", "English", "Hindi", "EVS"],
  2: ["Maths", "English", "Hindi", "EVS"],
  3: ["Maths", "English", "Hindi", "EVS", "Science"],
  4: ["Maths", "English", "Hindi", "EVS", "Science"],
  5: ["Maths", "English", "Hindi", "EVS", "Science"],
  6: ["Maths", "English", "Hindi", "Science", "Social Science", "Computer"],
  7: ["Maths", "English", "Hindi", "Science", "Social Science", "Computer"],
  8: ["Maths", "English", "Hindi", "Science", "Social Science", "Computer"],
  9: ["Maths", "English", "Hindi", "Science", "Social Science", "Computer"],
  10: ["Maths", "English", "Hindi", "Science", "Social Science", "Computer"],
  11: ["Maths", "English", "Physics", "Chemistry", "Biology", "Computer"],
  12: ["Maths", "English", "Physics", "Chemistry", "Biology", "Computer"],
};

/* ========== BACKGROUNDS ========== */
const scientificBackgrounds = {
  preschool:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
  1: "https://images.unsplash.com/photo-1454165833767-027eeaf196ce?q=80&w=2070",
  6: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070",
  10: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
  12: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
  default:
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2190",
};

/* ========== SIDEBAR TOGGLE ========== */
if (toggleSidebar) {
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const icon = toggleSidebar.querySelector("i");
    icon.className = sidebar.classList.contains("collapsed")
      ? "bx bx-chevron-right"
      : "bx bx-chevron-left";
  });
}

/* ========== DROPDOWN FUNCTIONALITY ========== */
function toggleDropdown() {
  dropdownMenu.classList.toggle("active");
  dropdownArrow.classList.toggle("active");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".logo-dropdown")) {
    dropdownMenu.classList.remove("active");
    dropdownArrow.classList.remove("active");
  }
});

// Logo and arrow click handlers
const logoDropdown = document.querySelector(".logo-dropdown");
if (logoDropdown) {
  logoDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
}

// User Menu Toggle (Clicking the Logo)
if (userProfileIcon && userDropdownMenu) {
  userProfileIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdownMenu.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (
      !userProfileIcon.contains(e.target) &&
      !userDropdownMenu.contains(e.target)
    ) {
      userDropdownMenu.classList.remove("active");
    }
  });
}

// Handle category selection from dropdown
function handleCategorySelection(category) {
  // Update active states
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelector(`[data-cat="${category}"]`)?.classList.add("active");

  // Update sidebar active state
  document.querySelectorAll(".sidebar nav a").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.cat === category) {
      link.classList.add("active");
    }
  });

  // Close dropdown
  dropdownMenu.classList.remove("active");
  dropdownArrow.classList.remove("active");

  // Load books for selected category
  selectedBoard = category;
  loadBooks();
}

// Dropdown item clicks
document.querySelectorAll(".dropdown-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const cat = e.target.closest(".dropdown-item").dataset.cat;
    if (cat) {
      handleCategorySelection(cat);
    }
  });
});

/* ========== DARK MODE TOGGLE ========== */
if (darkModeToggle) {
  // Check local storage
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  });
}

/* ========== BACK TO TOP ========== */
if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ========== ABOUT & CONTACT MODALS ========== */
const menuAbout = document.getElementById("menuAbout");
const menuContact = document.getElementById("menuContact");

if (menuAbout && aboutModal) {
  menuAbout.addEventListener("click", (e) => {
    e.preventDefault();
    aboutModal.style.display = "flex";
    if (userDropdownMenu) userDropdownMenu.classList.remove("active");
  });
}

if (closeAboutModal) {
  closeAboutModal.addEventListener("click", () => {
    aboutModal.style.display = "none";
  });
}

if (menuContact && contactModal) {
  menuContact.addEventListener("click", (e) => {
    e.preventDefault();
    contactModal.style.display = "flex";
    if (userDropdownMenu) userDropdownMenu.classList.remove("active");
  });
}

if (closeContactModal) {
  closeContactModal.addEventListener("click", () => {
    contactModal.style.display = "none";
  });
}

// Close modals on outside click
window.addEventListener("click", (e) => {
  if (e.target === aboutModal) aboutModal.style.display = "none";
  if (e.target === contactModal) contactModal.style.display = "none";
  if (e.target === loginModal) loginModal.style.display = "none";
});

if (closeEditModal) {
  closeEditModal.addEventListener("click", () => {
    editBookModal.style.display = "none";
  });
}

if (closeBulkEditModal) {
  closeBulkEditModal.addEventListener("click", () => {
    bulkEditModal.style.display = "none";
  });
}

/* ========== CONTACT FORM ========== */
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value;
    showToast(`Thank you, ${name}! Your message has been sent successfully.`);
    contactForm.reset();
    if (contactModal) {
      contactModal.style.display = "none";
    }
  });
}

/* ========== RETRY MODAL LOGIC ========== */
let retryAction = null;

if (confirmRetryBtn) {
  confirmRetryBtn.addEventListener("click", () => {
    if (retryModal) retryModal.style.display = "none";
    if (retryAction) retryAction();
  });
}

if (cancelRetryBtn) {
  cancelRetryBtn.addEventListener("click", () => {
    if (retryModal) retryModal.style.display = "none";
    retryAction = null;
  });
}

function showRetryAlert(msg, action) {
  if (retryMessage) retryMessage.textContent = msg;
  retryAction = action;
  if (retryModal) retryModal.style.display = "flex";
}

/* ========== TOAST NOTIFICATIONS ========== */
function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? "bx-check-circle" : "bx-error-circle";

  toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;

  container.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

/* ========== INITIAL LOAD ========== */
window.addEventListener("DOMContentLoaded", () => {
  buildSubjectFilter();
  injectNewArrivalsLink();
  loadBooks();
  initAuth();
  // REMOVED: Separate draft section loading
});

/* ========== CLASS / BOARD / SUBJECT HANDLERS ========== */
classSelector.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  selectedClass = e.target.dataset.class;
  document
    .querySelectorAll(".class-selector button")
    .forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  selectedSubject = "all";
  buildSubjectFilter();
  loadBooks();
});

subjectFilter.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  selectedSubject = e.target.dataset.sub;
  document
    .querySelectorAll(".subject-filter button")
    .forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  loadBooks();
});

function buildSubjectFilter() {
  subjectFilter.innerHTML =
    '<button data-sub="all" class="active">All</button>';
  const subjects = subjectsMap[selectedClass] || [];
  subjects.forEach((sub) => {
    const btn = document.createElement("button");
    btn.dataset.sub = sub;
    btn.textContent = sub;
    subjectFilter.appendChild(btn);
  });
}

function injectNewArrivalsLink() {
  const nav = document.querySelector(".sidebar nav");
  if (nav && !nav.querySelector('[data-cat="New Arrivals"]')) {
    const link = document.createElement("a");
    link.href = "#";
    link.dataset.cat = "New Arrivals";
    link.innerHTML = "<i class='bx bx-star'></i> New Arrivals";

    const allLink =
      nav.querySelector('[data-cat="AllCategories"]') ||
      nav.querySelector('[data-cat="all"]');
    if (allLink && allLink.nextSibling) {
      nav.insertBefore(link, allLink.nextSibling);
    } else {
      nav.appendChild(link);
    }

    link.addEventListener("click", (e) => {
      e.preventDefault();
      handleCategorySelection("New Arrivals");
    });
  }
}

/* ========== BOOK RENDERING ========== */
async function checkPdfExists(pdfPath) {
  try {
    const response = await fetch(pdfPath, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function updateBackground(cls) {
  // Clean background requested - removing image logic
  document.body.style.backgroundImage = "";
}

// Helper to normalize board names from folder structure to display names
function normalizeBoardName(folderName) {
  // Simple mapping or capitalization
  const map = {
    ncert: "NCERT",
    cbse: "CBSE",
    icse_isc: "ICSE",
    bihar_board: "Bihar",
    up_board: "UP",
    mp_board: "MP",
    pre_nursery: "PreNursery",
    nursery: "Nursery",
    lkg: "LKG",
    ukg: "UKG",
    kids_comics: "KidsComics",
    indian_classics: "IndianClassics",
    // Add others as needed, or just capitalize
  };
  return (
    map[folderName] ||
    folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/_/g, " ")
  );
}

async function renderBooks(list) {
  bookGrid.innerHTML = "";
  updateBackground(selectedClass);

  // Inject Badge CSS if not present
  if (!document.getElementById("new-badge-style")) {
    const style = document.createElement("style");
    style.id = "new-badge-style";
    style.innerHTML = `
      .new-badge {
        position: absolute;
        top: 10px; right: 10px;
        background: #ff4757; color: white;
        padding: 4px 8px; border-radius: 4px;
        font-size: 0.7rem; font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;
      }
      .book-card { position: relative; }
    `;
    document.head.appendChild(style);
  }

  if (!list.length) {
    bookGrid.innerHTML =
      '<p style="text-align:center;color:#888;margin-top:2rem;">No books available.</p>';
    return;
  }
  for (const b of list) {
    const pdfExists = await checkPdfExists(b.pdf);
    const card = document.createElement("div");
    card.className = "book-card";
    card.dataset.id = b.id;

    const coverHtml =
      b.cover && b.cover !== "" && b.cover !== "none"
        ? `<img src="${b.cover}" alt="${b.name}" onerror="this.src='https://via.placeholder.com/220x280/cccccc/000?text=No+Cover'">`
        : `<div class="book-cover-placeholder"><div class="placeholder-board">${b.board}</div><div class="placeholder-class">CLASS ${b.class}</div><div class="placeholder-subject">${b.subject}</div><div style="font-size:0.7rem;margin-top:10px;opacity:0.6;">${b.name}</div></div>`;

    // Check if book is new (added in last 7 days)
    const bookDate = b.date
      ? new Date(b.date)
      : typeof b.id === "number" && b.id > 1000000000000
      ? new Date(b.id)
      : null;
    const isNew = bookDate && new Date() - bookDate < 7 * 24 * 60 * 60 * 1000;
    const badgeHtml = isNew ? `<div class="new-badge">NEW</div>` : "";

    const category = b.category || b.board || "General";
    const cls = b.class || "General";
    // Use normalized board name for display if available, else raw
    const displayBoard = normalizeBoardName(b.board);

    let checkboxHtml = "";
    let adminPanel = "";
    if (isAdmin) {
      checkboxHtml = `<input type="checkbox" class="book-select-checkbox" data-id="${
        b.id
      }" ${selectedBookIds.has(b.id.toString()) ? "checked" : ""}>`;
      adminPanel = `
        <div class="admin-controls" style="margin-top:10px;">
          <input type="file" class="newCoverFile" data-id="${b.id}" accept="image/*" style="display:none;">
          <button class="btnChangeCover" data-id="${b.id}" data-category="${category}" data-class="${cls}" style="margin-left:8px;">Change Cover</button>
          <button class="btnEditBook" data-id="${b.id}" style="margin-left:8px;background:#f39c12;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Edit</button>
          <button class="btnMoveFolder" data-id="${b.id}" style="margin-left:8px;background:#3498db;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;" title="Move to correct folder">Move Files</button>
          <button class="btnDelete" data-id="${b.id}" style="margin-left:8px;background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Delete</button>
        </div>`;
    }

    card.innerHTML = `
      ${checkboxHtml}
      ${badgeHtml}
      ${coverHtml}
      <div class="info">
        <h4>${b.name}</h4>
        <div class="meta">${b.subject} • ${displayBoard}</div>
        <div class="actions">
          <button class="download" onclick="downloadBook('${b.pdf}')" ${
      !pdfExists ? 'disabled style="opacity:0.5;"' : ""
    }>${pdfExists ? "Download" : "Not Available"}</button>
          <button class="read" onclick="readBook('${b.pdf}')" ${
      !pdfExists ? 'disabled style="opacity:0.5;"' : ""
    }>${pdfExists ? "Read" : "Not Available"}</button>
          <button class="share" onclick="shareBook('${b.name.replace(
            /'/g,
            "\\'"
          )}', '${b.pdf}')" ${
      !pdfExists ? 'disabled style="opacity:0.5;"' : ""
    }><i class='bx bx-share-alt'></i></button>
        </div>
        ${adminPanel}
      </div>`;
    bookGrid.appendChild(card);
  }
}

async function loadBooks() {
  bookGrid.innerHTML =
    '<div class="spinner-wrapper"><div class="loading-spinner"></div></div>';
  try {
    // Fetch from new dynamic API
    const res = await fetch(`${API_BASE_URL}/api/books`);
    if (!res.ok) throw new Error("Failed to fetch books from server");
    const data = await res.json();

    // Store all books globally
    allFetchedBooks = data.books || [];

    // Reset to page 1 on new load/filter
    currentPage = 1;

    applyFiltersAndRender();
  } catch (error) {
    console.error("❌ Error loading books:", error);

    // Fallback: Try loading local JSON if server is offline
    try {
      console.warn(
        "⚠️ Server offline, attempting to load from local books.json..."
      );
      const res = await fetch("data/books.json");
      if (!res.ok) throw new Error("Local JSON not found");
      const data = await res.json();
      allFetchedBooks = data.books || [];
      currentPage = 1;
      applyFiltersAndRender();
      showToast("Server offline. Showing cached books.", "error");
    } catch (fallbackError) {
      bookGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
          <i class='bx bx-error-circle' style="font-size: 3rem; color: #ff4d4d; margin-bottom: 10px;"></i>
          <h3>Connection Failed</h3>
          <p>Could not connect to the server or local data.</p>
          <p style="font-size: 0.9rem; margin-top: 10px; color: #888;">
            1. Ensure <strong>server.js</strong> is running (<code>node server.js</code>)<br>
            2. Check if port <strong>3000</strong> is available.
          </p>
          <button onclick="loadBooks()" style="margin-top: 20px; padding: 8px 20px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer;">Retry Connection</button>
        </div>`;
    }
  }
}

function applyFiltersAndRender() {
  const searchTerm = bookSearch.value.toLowerCase();

  const filteredList = allFetchedBooks.filter((b) => {
    const isAllMode = selectedClass === "all";

    // Class Match
    // Note: API returns '1', 'preschool', 'general'. Frontend uses '1', 'preschool'.
    // 'general' class (comics etc) should show if 'all' is selected or if we are in a specific category mode that ignores class.
    const matchesClass =
      isAllMode ||
      b.class == selectedClass ||
      (selectedClass === "all" && b.class === "general");

    // Board/Category Match
    // Frontend selectedBoard is like "NCERT", "Bihar Board", "Comics".
    // Backend returns "ncert", "bihar_board", "comics".
    // We need to match loosely or map.
    const bBoard = b.board.toLowerCase();
    const bCat = b.category.toLowerCase();
    const sBoard = selectedBoard.toLowerCase().replace(/ /g, "_"); // "Bihar Board" -> "bihar_board" roughly

    // Special mapping for "All Categories"
    const isAllBoards = selectedBoard === "all";
    const isNewArrivals = selectedBoard === "New Arrivals";

    // Check if selectedBoard matches either the book's board OR category
    // e.g. selected="Comics" matches category="comics"
    // e.g. selected="NCERT" matches board="ncert"
    let matchesBoard = isAllBoards;

    if (isNewArrivals) {
      const bookDate = b.date
        ? new Date(b.date)
        : typeof b.id === "number" && b.id > 1000000000000
        ? new Date(b.id)
        : null;
      matchesBoard =
        bookDate && new Date() - bookDate < 7 * 24 * 60 * 60 * 1000;
    } else if (!matchesBoard) {
      // Try to match board or category
      // Mapping: "Bihar Board" -> "bihar_board"
      // "Comics" -> "comics"
      // "Pre-Nursery" -> "pre_nursery"
      const normalizedSelect = selectedBoard
        .toLowerCase()
        .replace(/[\s-]/g, "_");
      matchesBoard =
        bBoard.includes(normalizedSelect) || bCat.includes(normalizedSelect);

      // Specific fix for "Bihar Board" vs "bihar_board"
      if (selectedBoard === "Bihar Board" && bBoard === "bihar_board")
        matchesBoard = true;
      if (selectedBoard === "UP Board" && bBoard === "up_board")
        matchesBoard = true;
      if (selectedBoard === "MP Board" && bBoard === "mp_board")
        matchesBoard = true;
    }

    const matchesSubject =
      selectedSubject === "all" ||
      b.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(searchTerm);

    return matchesClass && matchesBoard && matchesSubject && matchesSearch;
  });

  // Pagination Logic
  const totalBooks = filteredList.length;
  const totalPages = Math.ceil(totalBooks / booksPerPage);

  // Ensure current page is valid
  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = filteredList.slice(startIndex, endIndex);

  renderBooks(paginatedBooks);
  updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {
  const container = document.getElementById("paginationControls");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const indicator = document.getElementById("pageIndicator");

  if (totalPages <= 1) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";
  indicator.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Clear old listeners to avoid duplicates (simple way)
  const newPrev = prevBtn.cloneNode(true);
  const newNext = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrev, prevBtn);
  nextBtn.parentNode.replaceChild(newNext, nextBtn);

  newPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      applyFiltersAndRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  newNext.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      applyFiltersAndRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

/* ========== BOOK ACTIONS ========== */
function downloadBook(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = url.split("/").pop();
  a.click();
}

function readBook(pdfPath) {
  window.open(pdfPath, "_blank");
}

function shareBook(name, pdfPath) {
  const fullUrl = new URL(pdfPath, window.location.href).href;
  if (navigator.share) {
    navigator
      .share({
        title: name,
        text: `Check out this book: ${name}`,
        url: fullUrl,
      })
      .catch((err) => console.log("Error sharing:", err));
  } else {
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast("Link copied to clipboard!");
    });
  }
}

/* ========== SEARCH ========== */
const searchPrompts = [
  "Maths Grade 10...",
  "Physics NCERT...",
  "Science Spark...",
  "English Reader...",
];
let promptIndex = 0;
let charIndex = 0;
let typingInterval;

function typePlaceholder() {
  const current = searchPrompts[promptIndex];
  if (charIndex < current.length) {
    bookSearch.placeholder += current.charAt(charIndex);
    charIndex++;
    typingInterval = setTimeout(typePlaceholder, 100);
  } else {
    setTimeout(() => {
      charIndex = current.length;
      erasePlaceholder();
    }, 2000);
  }
}

function erasePlaceholder() {
  if (charIndex > 0) {
    bookSearch.placeholder = bookSearch.placeholder.slice(0, -1);
    charIndex--;
    typingInterval = setTimeout(erasePlaceholder, 50);
  } else {
    promptIndex = (promptIndex + 1) % searchPrompts.length;
    typePlaceholder();
  }
}

searchIconBtn.addEventListener("click", () => {
  searchBoxContainer.classList.add("active");
  bookSearch.focus();
  bookSearch.placeholder = "";
  charIndex = 0;
  clearTimeout(typingInterval);
  typePlaceholder();
});

closeSearch.addEventListener("click", () => {
  searchBoxContainer.classList.remove("active");
  clearTimeout(typingInterval);
  bookSearch.value = "";
  loadBooks();
});

bookSearch.addEventListener("input", () => {
  currentPage = 1;
  applyFiltersAndRender();
});

/* ========== ADD NEW BOOK ========== */
function addNewBook(newBook) {
  let localBooks = JSON.parse(localStorage.getItem("myCustomBooks")) || [];
  localBooks.push(newBook);
  localStorage.setItem("myCustomBooks", JSON.stringify(localBooks));
  loadBooks();
}

/* ========== AUTH (ONLY SIGN-IN) ========== */
// Replaced signInBtn with menuSignIn
const menuSignIn = document.getElementById("menuSignIn");
// Replaced logoutBtn with menuLogout
const menuLogout = document.getElementById("menuLogout");

const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const closeLoginModal = document.getElementById("closeLoginModal");

const VALID_USER = "admin";
const VALID_PASS = "Kamal@007";

if (menuSignIn) {
  menuSignIn.addEventListener("click", () => {
    loginModal.style.display = "flex";
  });
}

if (closeLoginModal) {
  closeLoginModal.addEventListener("click", () => {
    loginModal.style.display = "none";
  });
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  if (user === VALID_USER && pass === VALID_PASS) {
    localStorage.setItem("isSignedIn", "true");
    loginModal.style.display = "none";
    showSignedInUI();
  } else {
    loginError.style.display = "inline";
  }
});

if (menuLogout) {
  menuLogout.addEventListener("click", () => {
    localStorage.removeItem("isSignedIn");
    location.reload();
  });
}

function showSignedInUI() {
  // Add green ring class
  if (userMenuContainer) userMenuContainer.classList.add("logged-in");

  // Toggle Menu Items
  if (menuSignIn) menuSignIn.style.display = "none";
  document.getElementById("loggedInOptions").style.display = "block";
  document.getElementById("menuUserHeader").style.display = "block";
  document.getElementById("logoutOptionWrapper").style.display = "block";

  // Show admin options in dropdown
  document.querySelector(".admin-only").style.display = "block";
  isAdmin = true;

  // Inject Rescan Button if not present
  const menu = document.getElementById("userDropdownMenu");
  if (menu && !document.getElementById("btnRescanLib")) {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.id = "btnRescanLib";
    btn.className = "dropdown-item";
    btn.innerHTML = "<i class='bx bx-refresh'></i> Rescan Library";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      rescanLibrary();
    });

    // Insert before Logout
    const logout = document.getElementById("logoutOptionWrapper");
    if (logout) menu.insertBefore(btn, logout);
    else menu.appendChild(btn);
  }

  // Inject Statistics Button if not present
  if (menu && !document.getElementById("btnShowStats")) {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.id = "btnShowStats";
    btn.className = "dropdown-item";
    btn.innerHTML = "<i class='bx bx-bar-chart-alt-2'></i> Statistics";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showStatistics();
    });
    const logout = document.getElementById("logoutOptionWrapper");
    if (logout) menu.insertBefore(btn, logout);
    else menu.appendChild(btn);
  }

  // Inject Activity Log Button if not present
  if (menu && !document.getElementById("btnShowActivity")) {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.id = "btnShowActivity";
    btn.className = "dropdown-item";
    btn.innerHTML = "<i class='bx bx-history'></i> Recent Activity";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showActivityLog();
    });
    const logout = document.getElementById("logoutOptionWrapper");
    if (logout) menu.insertBefore(btn, logout);
    else menu.appendChild(btn);
  }

  loadDrafts();
}

function initAuth() {
  if (localStorage.getItem("isSignedIn") === "true") showSignedInUI();
}

/* ========== ADMIN CONTROLS ========== */
async function rescanLibrary() {
  if (
    !confirm(
      "Rescan library? This will remove database entries for missing files and add new ones."
    )
  )
    return;

  showToast("Scanning library...", "info");
  try {
    const res = await fetch(`${API_BASE_URL}/admin/rescan`, {
      method: "POST",
      headers: { "x-auth-token": "admin-token-007" },
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Scan complete! Database synced with ${result.count} books.`);
      loadBooks();
    } else {
      showToast("Scan failed: " + result.error, "error");
    }
  } catch (err) {
    showToast("Error connecting to server", "error");
  }
}

// Listener for Rescan Library button in main dropdown
const btnRescanLibMain = document.getElementById("btnRescanLibMain");
if (btnRescanLibMain) {
  btnRescanLibMain.addEventListener("click", () => {
    dropdownMenu.classList.remove("active");
    dropdownArrow.classList.remove("active");
    rescanLibrary();
  });
}

/* ========== STATISTICS MODAL ========== */
function createStatsModal() {
  if (document.getElementById("statsModal")) return;

  const modal = document.createElement("div");
  modal.id = "statsModal";
  modal.className = "modal";
  // Inline styles to ensure it works even if CSS is missing specific modal class properties
  modal.style.cssText =
    "display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;";

  modal.innerHTML = `
    <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 90%; max-width: 600px; border-radius: 8px; position: relative; max-height: 80vh; overflow-y: auto;">
      <span class="close-modal" id="closeStatsModal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
      <h2 style="margin-top: 0;">Library Statistics</h2>
      <div id="statsContent" style="margin-top: 20px;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = document.getElementById("closeStatsModal");
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

function showStatistics() {
  createStatsModal();
  const modal = document.getElementById("statsModal");
  const content = document.getElementById("statsContent");

  const total = allFetchedBooks.length;
  const catCounts = {};
  const boardCounts = {};

  allFetchedBooks.forEach((b) => {
    const cat = b.category || "Uncategorized";
    const board = b.board || "Unspecified";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
    boardCounts[board] = (boardCounts[board] || 0) + 1;
  });

  // Sort by count descending
  const sortObj = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
  const sortedCats = sortObj(catCounts);
  const sortedBoards = sortObj(boardCounts);

  let html = `
    <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
      <div style="background: var(--primary, #4a90e2); color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 1rem; opacity: 0.9;">Total Books</div>
        <div style="font-size: 2.5rem; font-weight: bold;">${total}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h4 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 10px; color: var(--text, #333);">By Category</h4>
          <div style="max-height: 300px; overflow-y: auto;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${sortedCats
                .map(
                  ([k, v]) => `
                <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 0.9rem;">
                  <span style="color: var(--text, #555);">${k}</span> 
                  <span style="font-weight: bold; background: #eee; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">${v}</span>
                </li>`
                )
                .join("")}
            </ul>
          </div>
        </div>

        <div>
          <h4 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 10px; color: var(--text, #333);">By Board</h4>
          <div style="max-height: 300px; overflow-y: auto;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${sortedBoards
                .map(
                  ([k, v]) => `
                <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 0.9rem;">
                  <span style="color: var(--text, #555);">${k}</span> 
                  <span style="font-weight: bold; background: #eee; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">${v}</span>
                </li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  content.innerHTML = html;
  modal.style.display = "flex";
}

/* ========== ACTIVITY LOG MODAL ========== */
function createActivityModal() {
  if (document.getElementById("activityModal")) return;

  const modal = document.createElement("div");
  modal.id = "activityModal";
  modal.className = "modal";
  modal.style.cssText =
    "display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;";

  modal.innerHTML = `
    <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 90%; max-width: 700px; border-radius: 8px; position: relative; max-height: 80vh; overflow-y: auto;">
      <span class="close-modal" id="closeActivityModal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
      <h2 style="margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Recent Activity</h2>
      <div id="activityContent">Loading...</div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = document.getElementById("closeActivityModal");
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

async function showActivityLog() {
  createActivityModal();
  const modal = document.getElementById("activityModal");
  const content = document.getElementById("activityContent");
  modal.style.display = "flex";

  try {
    const res = await fetch(`${API_BASE_URL}/admin/activity-log`, {
      headers: { "x-auth-token": "admin-token-007" },
    });
    const result = await res.json();

    if (result.success && result.logs.length > 0) {
      const html = result.logs
        .map((log) => {
          const date = new Date(log.timestamp).toLocaleString();
          let color = "#333";
          if (log.action === "Delete") color = "#e74c3c";
          if (log.action === "Upload") color = "#28a745";
          if (log.action === "Edit") color = "#f39c12";

          return `
          <div style="padding: 12px; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #888;">
              <span style="font-weight: bold; color: ${color};">${log.action}</span>
              <span>${date}</span>
            </div>
            <div style="font-size: 0.95rem; color: var(--text);">${log.details}</div>
          </div>
        `;
        })
        .join("");
      content.innerHTML = html;
    } else {
      content.innerHTML =
        "<p style='text-align:center; color:#888;'>No recent activity found.</p>";
    }
  } catch (err) {
    content.innerHTML =
      "<p style='color:red; text-align:center;'>Failed to load activity log.</p>";
  }
}

// Event delegation for better performance and reliability
bookGrid.addEventListener("click", async (e) => {
  const target = e.target;

  // Handle Bulk Selection Checkbox
  if (target.classList.contains("book-select-checkbox")) {
    const id = target.dataset.id;
    if (target.checked) {
      selectedBookIds.add(id);
    } else {
      selectedBookIds.delete(id);
    }

    // Update Bulk Bar
    if (selectedBookIds.size > 0) {
      bulkActionsBar.style.display = "flex";
      bulkCounter.textContent = selectedBookIds.size;
    } else {
      bulkActionsBar.style.display = "none";
    }
  }

  // Handle Move to Folder
  if (target.classList.contains("btnMoveFolder")) {
    const id = target.dataset.id;
    const originalText = target.textContent;
    target.textContent = "Moving...";
    target.disabled = true;

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/book/${encodeURIComponent(id)}/organize`,
        {
          method: "POST",
          headers: { "x-auth-token": "admin-token-007" },
        }
      );
      const result = await res.json();
      if (result.success) {
        showToast(result.msg || "Files moved successfully!");
        target.textContent = "Done";
        setTimeout(() => {
          target.textContent = originalText;
          target.disabled = false;
        }, 2000);
      } else {
        showToast("Failed: " + (result.msg || result.error), "error");
        target.textContent = originalText;
        target.disabled = false;
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
      target.textContent = originalText;
      target.disabled = false;
    }
  }

  // Handle Edit Book
  if (target.classList.contains("btnEditBook")) {
    const id = target.dataset.id;
    // Find book data from local cache or DOM
    // Since we don't have a global books array easily accessible here without reloading,
    // we can fetch it or pass data via attributes.
    // Better: fetch books.json again or use the one in memory if we made it global.
    // FIX: Use global allFetchedBooks which is populated by the scanner API
    const book = allFetchedBooks.find((b) => b.id == id);
    if (book) {
      editBookId.value = book.id;
      editBookName.value = book.name;
      editBookClass.value = book.class;
      editBookSubject.value = book.subject;

      // Populate Categories
      const categories = Object.keys(subcategoryMapping);
      editBookCategory.innerHTML = categories
        .map(
          (c) =>
            `<option value="${c}" ${
              c === book.category ? "selected" : ""
            }>${c}</option>`
        )
        .join("");

      // Update subjects dropdown/datalist logic could go here
      // For now, we rely on manual entry or we can inject a datalist
      let dataList = document.getElementById("subjectOptions");
      if (!dataList) {
        dataList = document.createElement("datalist");
        dataList.id = "subjectOptions";
        document.body.appendChild(dataList);
        editBookSubject.setAttribute("list", "subjectOptions");
      }

      const updateSubjectsList = (cls) => {
        const subs = subjectsMap[cls] || [];
        dataList.innerHTML = subs.map((s) => `<option value="${s}">`).join("");
      };

      updateSubjectsList(book.class);

      // Update subjects when class changes
      editBookClass.onchange = (e) => updateSubjectsList(e.target.value);

      editBookModal.style.display = "flex";
    } else {
      showToast("Book details not found", "error");
    }
  }

  // Handle Change Cover
  if (target.classList.contains("btnChangeCover")) {
    const id = target.dataset.id;
    const category = target.dataset.category;
    const cls = target.dataset.class;
    const card = target.closest(".book-card");
    const fileInput = card.querySelector(".newCoverFile");

    // Create progress bar if needed
    let progressContainer = card.querySelector(".upload-progress-container");
    let progressBar = card.querySelector(".upload-progress-bar");
    if (!progressContainer) {
      progressContainer = document.createElement("div");
      progressContainer.className = "upload-progress-container";
      progressBar = document.createElement("div");
      progressBar.className = "upload-progress-bar";
      progressContainer.appendChild(progressBar);
      card.querySelector(".admin-controls").appendChild(progressContainer);
    }

    // Create Preview Container if needed
    let previewContainer = card.querySelector(".cover-preview-container");
    if (!previewContainer) {
      previewContainer = document.createElement("div");
      previewContainer.className = "cover-preview-container";
      previewContainer.innerHTML = `
        <img class="cover-preview-img" src="" alt="Preview">
        <div class="preview-actions">
          <button class="btn-confirm-upload">Upload</button>
          <button class="btn-cancel-upload">Cancel</button>
        </div>
      `;
      // Insert before progress container
      card
        .querySelector(".admin-controls")
        .insertBefore(previewContainer, progressContainer);
    }
    const previewImg = previewContainer.querySelector(".cover-preview-img");
    const confirmBtn = previewContainer.querySelector(".btn-confirm-upload");
    const cancelBtn = previewContainer.querySelector(".btn-cancel-upload");

    // Create Drop Zone if needed
    let dropZone = card.querySelector(".cover-drop-zone");
    if (!dropZone) {
      dropZone = document.createElement("div");
      dropZone.className = "cover-drop-zone";
      dropZone.style.display = "none";
      dropZone.innerHTML =
        "<i class='bx bx-cloud-upload'></i><span>Drag & Drop or Click</span>";
      // Insert before preview container
      card
        .querySelector(".admin-controls")
        .insertBefore(dropZone, previewContainer);
    }

    const uploadFile = (file) => {
      if (!file) return;

      // Hide drop zone
      previewContainer.style.display = "none";
      dropZone.style.display = "none";

      const originalText = target.textContent;
      target.textContent = "Uploading...";
      target.disabled = true;

      progressContainer.style.display = "block";
      progressBar.style.width = "0%";

      const formData = new FormData();
      // Append text fields BEFORE file so Multer can read them for destination
      formData.append("category", category);
      formData.append("class", cls);
      formData.append("newCover", file);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${API_BASE_URL}/admin/book/${encodeURIComponent(id)}/cover`,
        true
      );
      xhr.setRequestHeader("x-auth-token", "admin-token-007");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          progressBar.style.width = percent + "%";
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              const img = card.querySelector("img");
              if (img) img.src = `${result.cover}?t=${Date.now()}`;
              target.textContent = "Done!";
            } else {
              showRetryAlert("Failed: " + result.error, () => uploadFile(file));
              target.textContent = originalText;
            }
          } catch (e) {
            console.error(e);
            target.textContent = originalText;
          }
        } else {
          showRetryAlert("Upload failed with status " + xhr.status, () =>
            uploadFile(file)
          );
          target.textContent = originalText;
        }
        setTimeout(() => {
          target.textContent = originalText;
          target.disabled = false;
          progressContainer.style.display = "none";
          progressBar.style.width = "0%";
          fileInput.value = "";
        }, 1500);
      };

      xhr.onerror = () => {
        showRetryAlert("Network Error. Please check your connection.", () =>
          uploadFile(file)
        );
        target.textContent = originalText;
        target.disabled = false;
        progressContainer.style.display = "none";
      };

      xhr.send(formData);
    };

    // Define File Selection Handler
    const handleFileSelection = (file) => {
      if (!file) return;
      // Store file on the container to access it in confirm handler
      previewContainer.fileObject = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.style.display = "block";
        dropZone.style.display = "none";
      };
      reader.readAsDataURL(file);
    };

    // Update Event Handlers (using properties to overwrite previous ones)
    dropZone.onclick = () => fileInput.click();

    dropZone.ondragover = (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    };

    dropZone.ondragleave = (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    };

    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelection(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = (ev) => {
      handleFileSelection(ev.target.files[0]);
    };

    confirmBtn.onclick = () => {
      if (previewContainer.fileObject) {
        uploadFile(previewContainer.fileObject);
      }
    };

    cancelBtn.onclick = () => {
      previewContainer.style.display = "none";
      previewContainer.fileObject = null;
      fileInput.value = "";
      dropZone.style.display = "flex"; // Show drop zone again
    };

    // Toggle Drop Zone Visibility
    if (previewContainer.style.display === "block") {
      previewContainer.style.display = "none";
    } else if (dropZone.style.display === "flex") {
      dropZone.style.display = "none";
    } else {
      dropZone.style.display = "flex";
    }
  }

  // Handle Delete
  if (target.classList.contains("btnDelete")) {
    const id = target.dataset.id;
    if (!confirm("Sure to delete?")) return;

    const originalText = target.textContent;

    const performDelete = async () => {
      target.textContent = "Deleting...";
      target.disabled = true;

      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/book/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: { "x-auth-token": "admin-token-007" },
          }
        );
        const result = await res.json();
        if (result.success) {
          // Remove card immediately
          const card = target.closest(".book-card");
          if (card) {
            card.style.transition = "all 0.3s ease";
            card.style.opacity = "0";
            card.style.transform = "scale(0.9)";
            setTimeout(() => card.remove(), 300);
          }
        } else {
          showRetryAlert("Failed to delete book.", performDelete);
          target.textContent = originalText;
          target.disabled = false;
        }
      } catch (err) {
        console.error(err);
        showRetryAlert("Error connecting to server.", performDelete);
        target.textContent = originalText;
        target.disabled = false;
      }
    };
    performDelete();
  }
});

// Helper to populate subjects in Edit Modal
function updateEditSubjects(cls) {
  const subjects = subjectsMap[cls] || [];
  // If no map found (e.g. for comics), allow free text or generic
  if (subjects.length === 0) {
    // Keep as text input or generic options? For now, let's just clear or add 'General'
    // But since editBookSubject is an input, we might want to turn it into a datalist or select.
    // The HTML has it as <input type="text">. Let's use a datalist for flexibility.
    return;
  }
  // Since it is an input field, we can't force options easily without changing HTML to <select> or <datalist>.
  // However, user asked for "option de dijiyega".
  // I will assume we can replace the input with a select or use a datalist.
}

/* ========== EDIT BOOK FORM SUBMIT ========== */
if (editBookForm) {
  editBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editBookId.value;
    const payload = {
      name: editBookName.value,
      category: editBookCategory.value,
      class: editBookClass.value,
      subject: editBookSubject.value,
    };

    const res = await fetch(
      `${API_BASE_URL}/admin/book/${encodeURIComponent(id)}/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": "admin-token-007",
        },
        body: JSON.stringify(payload),
      }
    );
    const result = await res.json();
    if (result.success) {
      showToast("Book updated successfully!");
      editBookModal.style.display = "none";
      loadBooks(); // Reload to see changes
    } else {
      showToast("Failed: " + (result.msg || result.error), "error");
    }
  });
}

/* ========== BULK EDIT LOGIC ========== */
const btnBulkEdit = document.getElementById("btnBulkEdit");
const btnBulkCancel = document.getElementById("btnBulkCancel");

if (btnBulkEdit) {
  btnBulkEdit.addEventListener("click", () => {
    // Populate Categories
    const categories = Object.keys(subcategoryMapping);
    bulkEditCategory.innerHTML = categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");
    document.getElementById("bulkSelectedCount").textContent =
      selectedBookIds.size;
    bulkEditModal.style.display = "flex";
  });
}

if (btnBulkCancel) {
  btnBulkCancel.addEventListener("click", () => {
    selectedBookIds.clear();
    document
      .querySelectorAll(".book-select-checkbox")
      .forEach((cb) => (cb.checked = false));
    bulkActionsBar.style.display = "none";
  });
}

if (bulkEditForm) {
  bulkEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newCategory = bulkEditCategory.value;
    const bookIds = Array.from(selectedBookIds);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/books/bulk-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": "admin-token-007",
        },
        body: JSON.stringify({ bookIds, newCategory }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Updated ${result.updatedCount} books successfully!`);
        bulkEditModal.style.display = "none";
        selectedBookIds.clear();
        bulkActionsBar.style.display = "none";
        loadBooks();
      } else {
        showToast("Failed: " + (result.msg || result.error), "error");
      }
    } catch (err) {
      showToast("Error connecting to server", "error");
    }
  });
}

/* ========== DRAFT MANAGER (ADMIN) - NOW ONLY FOR DROPDOWN ========== */
async function loadDrafts() {
  if (!isAdmin) return;

  // Fetch drafts first to get count
  let drafts = [];
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drafts`, {
      headers: { "x-auth-token": "admin-token-007" },
    });
    drafts = await res.json();
  } catch (err) {
    console.error("Error loading drafts:", err);
    return;
  }

  const count = Array.isArray(drafts) ? drafts.length : 0;

  // --- 1. Update Profile Icon Badge ---
  const userMenuContainer = document.getElementById("userMenuContainer");
  if (userMenuContainer) {
    let badge = document.getElementById("draftProfileBadge");
    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.id = "draftProfileBadge";
        badge.style.cssText =
          "position: absolute; top: -2px; right: -2px; background: #ff4757; color: white; border-radius: 50%; padding: 2px 5px; font-size: 0.7rem; font-weight: bold; border: 2px solid white; min-width: 18px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
        const icon = userMenuContainer.querySelector(".user-profile-icon");
        if (icon) icon.appendChild(badge);
      }
      if (badge) {
        badge.textContent = count > 9 ? "9+" : count;
        badge.style.display = "block";
      }
    } else if (badge) {
      badge.style.display = "none";
    }
  }

  // --- 2. Update Dropdown Menu Item ---
  const menu = document.getElementById("userDropdownMenu");
  if (menu) {
    let draftItem = document.getElementById("btnManageDrafts");
    if (!draftItem) {
      draftItem = document.createElement("a");
      draftItem.href = "#";
      draftItem.id = "btnManageDrafts";
      draftItem.className = "dropdown-item";

      // Insert before Logout
      const logout = document.getElementById("logoutOptionWrapper");
      if (logout) menu.insertBefore(draftItem, logout);
      else menu.appendChild(draftItem);

      draftItem.addEventListener("click", (e) => {
        e.preventDefault();
        const draftSection = document.getElementById("draftSection");
        if (draftSection) {
          draftSection.style.display = "block"; // Ensure visible
          draftSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    draftItem.innerHTML = `<i class='bx bx-file'></i> Manage Drafts ${
      count > 0
        ? `<span style="background: #ff4757; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: auto; font-weight: bold;">${count}</span>`
        : ""
    }`;
  }

  // --- 3. Populate Draft List (Existing Logic) ---
  const draftSection = document.getElementById("draftSection");
  const draftList = document.getElementById("draftList");

  if (!draftSection || !draftList) return;

  if (count === 0) {
    draftSection.style.display = "none";
    return;
  }

  draftSection.style.display = "block";
  draftList.innerHTML = "";

  drafts.forEach((d) => {
    const div = document.createElement("div");
    div.className = "draft-item";
    div.style.cssText =
      "background: rgba(255,255,255,0.9); padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; gap: 15px; align-items: center; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
    if (document.body.classList.contains("dark-mode")) {
      div.style.background = "rgba(255,255,255,0.05)";
      div.style.borderColor = "rgba(255,255,255,0.1)";
    }

    const coverImg = d.cover
      ? `<img src="${d.cover}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;">`
      : `<div style="width: 60px; height: 80px; background: #ccc; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 0.7rem; color: #555;">No Cover</div>`;

    const categories = Object.keys(subcategoryMapping);
    const options = categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");

    div.innerHTML = `
        ${coverImg}
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 5px; color: var(--text);">${d.originalName}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
            <input type="text" class="draftName" data-id="${d.id}" value="${d.name}" placeholder="Book Name" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
            <select class="draftBoard" data-id="${d.id}" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
               <option value="">Select Category</option>
               ${options}
            </select>
            <input type="text" class="draftClass" data-id="${d.id}" placeholder="Class" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
            <input type="text" class="draftSubject" data-id="${d.id}" placeholder="Subject" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <input type="file" class="draftCoverInput" data-id="${d.id}" accept="image/*" style="display: none;" onchange="handleDraftCoverUpload(this, ${d.id})">
          <button onclick="document.querySelector('.draftCoverInput[data-id=\\'${d.id}\\']').click()" style="background: #f39c12; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Change Cover</button>
          <button onclick="finalizeDraft(${d.id})" style="background: var(--primary); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Finalize</button>
          <button onclick="deleteDraft(${d.id})" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Delete</button>
        </div>
      `;
    draftList.appendChild(div);
  });
}

// Global function for draft cover upload
window.handleDraftCoverUpload = async (input, id) => {
  const file = input.files[0];
  if (!file) return;

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Cover image too large (Max 5MB)", "error");
    input.value = ""; // Clear input
    return;
  }

  const btn = input.nextElementSibling;
  const originalText = btn.textContent;
  btn.textContent = "Uploading...";
  btn.disabled = true;

  const formData = new FormData();
  formData.append("cover", file);

  try {
    const res = await fetch(`${API_BASE_URL}/admin/draft/${id}/cover`, {
      method: "POST",
      headers: { "x-auth-token": "admin-token-007" },
      body: formData,
    });
    const result = await res.json();
    if (result.success) {
      showToast("Draft cover updated!");
      loadDrafts();
    } else {
      showToast("Failed: " + (result.error || "Unknown error"), "error");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  } catch (err) {
    showToast("Error uploading cover", "error");
    btn.textContent = originalText;
    btn.disabled = false;
  }
};

async function finalizeDraft(id) {
  const board = document.querySelector(`.draftBoard[data-id="${id}"]`).value;
  const cls = document.querySelector(`.draftClass[data-id="${id}"]`).value;
  const subject = document
    .querySelector(`.draftSubject[data-id="${id}"]`)
    .value.trim();
  const name = document
    .querySelector(`.draftName[data-id="${id}"]`)
    .value.trim();
  if (!board || !cls || !subject || !name) return alert("All fields required");
  const res = await fetch(`${API_BASE_URL}/admin/draft-finalize/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": "admin-token-007",
    },
    body: JSON.stringify({ board, class: cls, subject, name }),
  });
  const result = await res.json();
  if (result.success) {
    showToast("✅ Finalized & moved to library!");
  } else {
    showToast("Failed to finalize draft", "error");
  }
  loadDrafts();
  loadBooks();
}

async function deleteDraft(id) {
  if (!confirm("Delete draft?")) return;
  const res = await fetch(`${API_BASE_URL}/admin/draft/${id}`, {
    method: "DELETE",
    headers: { "x-auth-token": "admin-token-007" },
  });
  const result = await res.json();
  if (result.success) {
    showToast("Draft deleted");
  } else {
    showToast("Failed to delete draft", "error");
  }
  loadDrafts();
}

// Function to handle upload page opening
function openUploadPage(event) {
  event.preventDefault();
  const uploadWindow = window.open(
    "admin/upload.html",
    "_blank",
    "width=800,height=600"
  );
  if (
    !uploadWindow ||
    uploadWindow.closed ||
    typeof uploadWindow.closed == "undefined"
  ) {
    // Fallback for popup blockers
    window.open("admin/upload.html", "_blank");
  }
}

function openDraftUploadPage(event) {
  event.preventDefault();
  const draftWindow = window.open(
    "admin/draft-upload.html",
    "_blank",
    "width=800,height=600"
  );
  if (
    !draftWindow ||
    draftWindow.closed ||
    typeof draftWindow.closed == "undefined"
  ) {
    // Fallback for popup blockers
    window.open("admin/draft-upload.html", "_blank");
  }
}

// Toggle submenu function
function toggleSubmenu(event, submenuId) {
  event.stopPropagation(); // Prevent closing main dropdown

  const submenu = document.getElementById(submenuId);
  const arrow = event.currentTarget.querySelector(".submenu-arrow");

  // Close other open submenus
  document.querySelectorAll(".submenu").forEach((sub) => {
    if (sub.id !== submenuId) {
      sub.classList.remove("active");
    }
  });

  document.querySelectorAll(".submenu-arrow").forEach((arr) => {
    if (arr !== arrow) {
      arr.classList.remove("active");
    }
  });

  // Toggle current submenu
  submenu.classList.toggle("active");
  arrow.classList.toggle("active");
}

// Expand all submenus function
function expandAllSubmenus(event) {
  event.stopPropagation();
  document
    .querySelectorAll(".submenu")
    .forEach((sub) => sub.classList.add("active"));
  document
    .querySelectorAll(".submenu-arrow")
    .forEach((arrow) => arrow.classList.add("active"));
}

// Collapse all submenus function
function collapseAllSubmenus(event) {
  event.stopPropagation();
  document
    .querySelectorAll(".submenu")
    .forEach((sub) => sub.classList.remove("active"));
  document
    .querySelectorAll(".submenu-arrow")
    .forEach((arrow) => arrow.classList.remove("active"));
}

// Handle subcategory selection
document.querySelectorAll(".submenu .dropdown-item").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const category = this.dataset.cat;

    if (category) {
      // Handle category selection
      handleCategorySelection(category);

      // Close all dropdowns
      dropdownMenu.classList.remove("active");
      dropdownArrow.classList.remove("active");
      document.querySelectorAll(".submenu").forEach((sub) => {
        sub.classList.remove("active");
      });
      document.querySelectorAll(".submenu-arrow").forEach((arr) => {
        arr.classList.remove("active");
      });
    }
  });
});

// Close submenus when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown-menu")) {
    document.querySelectorAll(".submenu").forEach((sub) => {
      sub.classList.remove("active");
    });
    document.querySelectorAll(".submenu-arrow").forEach((arr) => {
      arr.classList.remove("active");
    });
  }
});

/* ========== CROSS-WINDOW COMMUNICATION (Upload Popup) ========== */
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "BOOK_UPLOADED") {
    if (event.data.isDraft) {
      showToast(event.data.msg || "Saved as draft", "info");
      // Refresh drafts list if function exists
      if (typeof loadDrafts === "function") loadDrafts();
    } else {
      showToast("Book published successfully!");
      // Refresh books list if function exists
      if (typeof loadBooks === "function") loadBooks();
    }
  }
});

/* ========== FOOTER LOGIC ========== */
// Footer Back to Top
const footerBackToTopBtn = document.getElementById("footerBackToTopBtn");
if (footerBackToTopBtn) {
  footerBackToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Visitor Counter Simulation
document.addEventListener("DOMContentLoaded", () => {
  const counterEl = document.getElementById("visitorCount");
  if (counterEl) {
    // Get stored count or default to 1012
    let count = localStorage.getItem("siteVisitorCount");
    if (!count) count = 1012;
    else count = parseInt(count) + 1;

    localStorage.setItem("siteVisitorCount", count);

    // Animate Counter
    const duration = 2000; // 2 seconds animation
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out effect
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentVal = Math.floor(easeOut * count);
      counterEl.textContent = currentVal.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counterEl.textContent = count.toLocaleString();
      }
    }

    requestAnimationFrame(updateCounter);
  }
});

/* ========== ANIMATED THEME BACKGROUND GENERATOR ========== */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("theme-background");
  if (!container) return;

  // 1. Create Moon
  const moon = document.createElement("div");
  moon.className = "moon";
  container.appendChild(moon);

  // 2. Create Clouds (Day)
  for (let i = 0; i < 6; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    const size = Math.random() * 60 + 60; // 60px to 120px
    cloud.style.width = `${size * 1.8}px`;
    cloud.style.height = `${size}px`;
    cloud.style.top = `${Math.random() * 40}%`; // Top 40% of screen
    cloud.style.left = `${Math.random() * 80}%`;
    cloud.style.animationDuration = `${Math.random() * 30 + 40}s`; // Slow float
    cloud.style.animationDelay = `-${Math.random() * 40}s`; // Start at random positions
    container.appendChild(cloud);
  }

  // 3. Create Stars (Night)
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${Math.random() * 2 + 2}s`;
    container.appendChild(star);
  }
});

// Dropdown Category Search
const categorySearch = document.getElementById("categorySearch");
if (categorySearch) {
  categorySearch.addEventListener("click", (e) => e.stopPropagation());
  categorySearch.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();

    // Helper to highlight text safely
    const highlight = (el, query) => {
      // Store original HTML if not already stored
      if (!el.dataset.originalHtml) el.dataset.originalHtml = el.innerHTML;

      // Reset to original
      el.innerHTML = el.dataset.originalHtml;

      if (!query) return;

      // Find text nodes and replace matches
      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);

      nodes.forEach((n) => {
        const text = n.nodeValue;
        // Escape regex characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedQuery})`, "gi");

        if (regex.test(text)) {
          const span = document.createElement("span");
          span.innerHTML = text.replace(
            regex,
            '<mark class="search-highlight">$1</mark>'
          );
          n.parentNode.replaceChild(span, n);
        }
      });
    };

    // 1. Filter Groups
    document.querySelectorAll(".dropdown-group").forEach((group) => {
      const header = group.querySelector(".category-header");
      const subItems = group.querySelectorAll(".submenu .dropdown-item");
      let matchFound = false;

      // Check header match
      const headerText = header.textContent.toLowerCase();
      const headerMatch = headerText.includes(term);

      // Highlight header
      highlight(header, term);

      // Check subitems
      subItems.forEach((sub) => {
        const subText = sub.textContent.toLowerCase();
        const subMatch = subText.includes(term);

        // Highlight subitem
        highlight(sub, term);

        if (subMatch || headerMatch) {
          sub.style.display = ""; // Show
          if (subMatch) matchFound = true;
        } else {
          sub.style.display = "none"; // Hide
        }
      });

      if (headerMatch) matchFound = true;

      if (matchFound) {
        group.style.display = "";
        if (term !== "") {
          group.querySelector(".submenu").classList.add("active");
          group.querySelector(".submenu-arrow").classList.add("active");
        } else {
          group.querySelector(".submenu").classList.remove("active");
          group.querySelector(".submenu-arrow").classList.remove("active");
        }
      } else {
        group.style.display = "none";
      }
    });

    // 2. Filter All Categories Wrapper
    const allCat = document.querySelector(".all-categories-wrapper");
    if (allCat) {
      const allCatText = allCat.textContent.toLowerCase();
      const match = allCatText.includes(term);
      allCat.style.display = match ? "flex" : "none";
      // Highlight inside the text part (first child div usually)
      const textDiv = allCat.querySelector(".dropdown-item");
      if (textDiv) highlight(textDiv, term);
    }

    // 3. Filter My Downloads
    const myDown = document.getElementById("myDownDropdown");
    if (myDown) {
      const match = myDown.textContent.toLowerCase().includes(term);
      myDown.style.display = match ? "" : "none";
      highlight(myDown, term);
    }

    // Note: Admin items are context-dependent, usually hidden for students, so we skip filtering them to avoid confusion or just let them stay if visible.
  });
}

// Updated category mapping for subcategories
const subcategoryMapping = {
  AllCategories: "all",
  PreNursery: "Pre-Nursery",
  Nursery: "Nursery",
  LKG: "LKG",
  UKG: "UKG",
  NCERT: "NCERT",
  CBSE: "CBSE",
  ICSE: "ICSE",
  Bihar: "Bihar Board",
  UP: "UP Board",
  MP: "MP Board",
  KidsComics: "Comics",
  IndianClassics: "Comics",
  International: "Comics",
  Learning: "Comics",
  KidsStories: "Story Books",
  MoralStories: "Story Books",
  FolkTales: "Story Books",
  ClassicStories: "Story Books",
  ShortStories: "Story Books",
  GK: "GK & Competitive",
  Competitive: "GK & Competitive",
  SchoolLevel: "GK & Competitive",
};

// Modified handleCategorySelection function
function handleCategorySelection(category) {
  const mainCategory = subcategoryMapping[category] || category;

  // Update board selection
  selectedBoard = mainCategory;

  // Update active states
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Find and activate the correct item
  const targetItem = document.querySelector(`[data-cat="${category}"]`);
  if (targetItem) {
    targetItem.classList.add("active");
  }

  // Update sidebar active state
  document.querySelectorAll(".sidebar nav a").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.cat === mainCategory) {
      link.classList.add("active");
    }
  });

  // Load books for selected category
  loadBooks();
}

// Enhanced upload page opening functions with multiple fallback paths
function openUploadPage() {
  console.log("Opening upload page...");

  // Close dropdown first
  dropdownMenu.classList.remove("active");
  dropdownArrow.classList.remove("active");

  // Try multiple possible paths in order of likelihood
  const uploadPaths = [
    "admin/upload.html",
    "upload.html",
    "./admin/upload.html",
    "../admin/upload.html",
    "/admin/upload.html",
    "admin/upload",
    "upload",
  ];

  let opened = false;

  for (let path of uploadPaths) {
    try {
      console.log("Trying path:", path);
      const newWindow = window.open(
        path,
        "_blank",
        "width=900,height=700,scrollbars=yes,resizable=yes"
      );

      if (newWindow) {
        opened = true;
        console.log("Successfully opened:", path);
        break;
      }
    } catch (error) {
      console.log("Failed to open path:", path, error);
      continue;
    }
  }

  if (!opened) {
    console.error("All upload paths failed");
    showToast("Upload page not found. Checking file structure...", "error");
    checkFileStructure();
  }
}

function openDraftUploadPage() {
  console.log("Opening draft upload page...");

  // Close dropdown first
  dropdownMenu.classList.remove("active");
  dropdownArrow.classList.remove("active");

  // Try multiple possible paths for draft upload
  const draftPaths = [
    "admin/draft-upload.html",
    "draft-upload.html",
    "./admin/draft-upload.html",
    "../admin/draft-upload.html",
    "/admin/draft-upload.html",
    "admin/draft-upload",
    "draft-upload",
  ];

  let opened = false;

  for (let path of draftPaths) {
    try {
      console.log("Trying draft path:", path);
      const newWindow = window.open(
        path,
        "_blank",
        "width=900,height=700,scrollbars=yes,resizable=yes"
      );

      if (newWindow) {
        opened = true;
        console.log("Successfully opened draft:", path);
        break;
      }
    } catch (error) {
      console.log("Failed to open draft path:", path, error);
      continue;
    }
  }

  if (!opened) {
    console.error("All draft upload paths failed");
    showToast(
      "Draft upload page not found. Checking file structure...",
      "error"
    );
    checkFileStructure();
  }
}

// Function to check actual file structure
function checkFileStructure() {
  console.log("Checking file structure...");

  // Try to fetch the files to see which ones exist
  const checkPaths = [
    "admin/upload.html",
    "upload.html",
    "admin/draft-upload.html",
    "draft-upload.html",
  ];

  checkPaths.forEach((path) => {
    fetch(path, { method: "HEAD" })
      .then((response) => {
        if (response.ok) {
          console.log("File exists:", path);
        } else {
          console.log("File not found:", path);
        }
      })
      .catch((error) => {
        console.log("Error checking path:", path, error);
      });
  });
}

// Alternative direct navigation function
function navigateToUploadDirect() {
  // Force navigation if window.open fails
  const confirmed = confirm("Opening upload page. Continue?");
  if (confirmed) {
    window.location.href = "admin/upload.html";
  }
}

function navigateToDraftDirect() {
  // Force navigation if window.open fails
  const confirmed = confirm("Opening draft upload page. Continue?");
  if (confirmed) {
    window.location.href = "admin/draft-upload.html";
  }
}

// Debug function to test file access
function debugFileAccess() {
  console.log("=== DEBUGGING FILE ACCESS ===");
  console.log("Current location:", window.location.href);
  console.log("Current pathname:", window.location.pathname);

  // Test if admin folder exists
  fetch("admin/", { method: "HEAD" })
    .then((response) => {
      console.log("Admin folder access:", response.ok ? "EXISTS" : "NOT FOUND");
    })
    .catch((error) => {
      console.log("Admin folder error:", error);
    });

  // Test specific files
  ["upload.html", "draft-upload.html"].forEach((file) => {
    fetch(`admin/${file}`, { method: "HEAD" })
      .then((response) => {
        console.log(`Admin/${file}:`, response.ok ? "EXISTS" : "NOT FOUND");
      })
      .catch((error) => {
        console.log(`Admin/${file} error:`, error);
      });
  });
}

// Enhanced error handling with user feedback
function handleUploadError(type) {
  console.error(`Failed to open ${type} page`);

  const message = `
    Unable to open ${type} page. This could be due to:
    1. File not found at expected location
    2. Popup blocker preventing new window
    3. File permissions issue
    
    Would you like to try opening it in the same window?
  `;

  if (confirm(message)) {
    if (type === "upload") {
      window.location.href = "admin/upload.html";
    } else {
      window.location.href = "admin/draft-upload.html";
    }
  }
}

// Add event listeners for debugging
window.addEventListener("load", () => {
  console.log("Page loaded, initializing upload functions...");
  debugFileAccess();
});
