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

const API_BASE_URL = "http://127.0.0.1:3000";

let selectedClass = "preschool";
let selectedBoard = "NCERT";
let selectedSubject = "all";
let isAdmin = localStorage.getItem("isSignedIn") === "true";

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

/* ========== CONTACT FORM ========== */
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value;
    alert(`Thank you, ${name}! Your message has been sent successfully.`);
    contactForm.reset();
    if (contactModal) {
      contactModal.style.display = "none";
    }
  });
}

/* ========== INITIAL LOAD ========== */
window.addEventListener("DOMContentLoaded", () => {
  buildSubjectFilter();
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

async function renderBooks(list) {
  bookGrid.innerHTML = "";
  updateBackground(selectedClass);
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

    let adminPanel = "";
    if (isAdmin) {
      adminPanel = `
        <div class="admin-controls" style="margin-top:10px;">
          <input type="file" class="newCoverFile" data-id="${b.id}" accept="image/*" style="display:none;">
          <button class="btnChangeCover" data-id="${b.id}" style="margin-left:8px;">Change Cover</button>
          <button class="btnDelete" data-id="${b.id}" style="margin-left:8px;background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Delete</button>
        </div>`;
    }

    card.innerHTML = `
      ${coverHtml}
      <div class="info">
        <h4>${b.name}</h4>
        <div class="meta">${b.subject} • ${b.board}</div>
        <div class="actions">
          <button class="download" onclick="downloadBook('${b.pdf}')" ${
      !pdfExists ? 'disabled style="opacity:0.5;"' : ""
    }>${pdfExists ? "Download" : "Not Available"}</button>
          <button class="read" onclick="readBook('${b.pdf}')" ${
      !pdfExists ? 'disabled style="opacity:0.5;"' : ""
    }>${pdfExists ? "Read" : "Not Available"}</button>
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
    const res = await fetch("data/books.json");
    if (!res.ok) throw new Error("JSON file not found");
    const data = await res.json();
    const localData = JSON.parse(localStorage.getItem("myCustomBooks")) || [];
    const allBooks = [...data.books, ...localData];
    const searchTerm = bookSearch.value.toLowerCase();
    const list = allBooks.filter((b) => {
      const isAllMode = selectedClass === "all";
      const matchesClass = isAllMode || b.class === selectedClass;
      const matchesBoard = isAllMode || b.board === selectedBoard;
      const matchesSubject =
        selectedSubject === "all" || b.subject === selectedSubject;
      const matchesSearch = b.name.toLowerCase().includes(searchTerm);
      return matchesClass && matchesBoard && matchesSubject && matchesSearch;
    });
    renderBooks(list);
  } catch (error) {
    console.error("❌ Error loading books:", error);
    bookGrid.innerHTML =
      '<p style="color:red;">Error loading books: ' + error.message + "</p>";
  }
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

bookSearch.addEventListener("input", loadBooks);

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
  // REMOVED: Separate draft section loading
}

function initAuth() {
  if (localStorage.getItem("isSignedIn") === "true") showSignedInUI();
}

/* ========== ADMIN CONTROLS ========== */
// Event delegation for better performance and reliability
bookGrid.addEventListener("click", async (e) => {
  const target = e.target;

  // Handle Change Cover
  if (target.classList.contains("btnChangeCover")) {
    const id = target.dataset.id;
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
      formData.append("newCover", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/admin/book/${id}/cover`, true);
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
              alert("Failed: " + result.error);
              target.textContent = originalText;
            }
          } catch (e) {
            console.error(e);
            target.textContent = originalText;
          }
        } else {
          alert("Upload failed");
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
        alert("Network Error");
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
    target.textContent = "Deleting...";
    target.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/book/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": "admin-token-007" },
      });
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
        alert("Failed");
        target.textContent = originalText;
        target.disabled = false;
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
      target.textContent = originalText;
      target.disabled = false;
    }
  }
});

/* ========== DRAFT MANAGER (ADMIN) - NOW ONLY FOR DROPDOWN ========== */
async function loadDrafts() {
  if (!isAdmin) return;
  // REMOVED: Separate draft section display
  // Draft functionality now only available through dropdown menu
}

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
  alert(result.success ? "✅ Finalized & moved to library!" : "Failed");
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
  alert(result.success ? "Draft deleted" : "Failed");
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

// Updated category mapping for subcategories
const subcategoryMapping = {
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
    alert("Upload page not found. Checking file structure...");
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
    alert("Draft upload page not found. Checking file structure...");
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
