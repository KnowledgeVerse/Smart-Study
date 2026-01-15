const form = document.getElementById("uploadForm");
const progress = document.getElementById("progress");
const manualCheck = document.getElementById("manualMode");
const classSel = document.getElementById("class");
const subjectSel = document.getElementById("subject");

const classSubjectMap = {
  preschool: ["Alphabet", "Numbers", "Rhymes", "Stories"],
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

manualCheck.addEventListener("change", () => {
  const isManual = manualCheck.checked;
  classSel.disabled = !isManual;
  subjectSel.disabled = !isManual;
  if (isManual) updateSubjects();
});

function updateSubjects() {
  const cls = classSel.value;
  subjectSel.innerHTML = '<option value="">-- Select --</option>';
  (classSubjectMap[cls] || []).forEach((sub) => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = sub;
    subjectSel.appendChild(opt);
  });
}
classSel.addEventListener("change", updateSubjects);

function parseFileName(fileName) {
  const parts = fileName.replace(/\.pdf$/i, "").split(" ");
  let cls = "",
    sub = "",
    name = fileName;
  if (parts.length >= 2 && !isNaN(parts[0])) {
    cls = parts[0];
    sub = parts[1];
    name = parts.slice(2).join(" ") || `${sub} ${parts[2] || ""}`.trim();
  }
  return { cls, sub, name };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const files = document.getElementById("bulkFiles").files;
  const board = form.board.value;
  const isManual = manualCheck.checked;

  const images = [...files].filter((f) => f.type.startsWith("image/"));
  const pdfs = [...files].filter((f) => f.type === "application/pdf");

  // Removed strict check to allow PDF only uploads to Drafts
  progress.innerHTML = "Uploading to Drafts...";
  let uploaded = 0;

  for (let i = 0; i < pdfs.length; i++) {
    const pdf = pdfs[i];
    const cover = images[i] || null; // Cover is optional

    // File size checks (50MB for PDF, 5MB for Cover)
    if (pdf.size > 50 * 1024 * 1024) {
      progress.innerHTML += `<br><span style="color:red">❌ Skipped ${pdf.name}: PDF too large (>50MB)</span>`;
      continue;
    }
    if (cover && cover.size > 5 * 1024 * 1024) {
      progress.innerHTML += `<br><span style="color:red">❌ Skipped ${cover.name}: Cover too large (>5MB)</span>`;
      continue;
    }

    const formData = new FormData();
    formData.append("pdf", pdf);
    if (cover) formData.append("cover", cover);

    try {
      // Changed to Draft Upload endpoint
      const res = await fetch("http://127.0.0.1:3000/admin/draft-upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      uploaded++;
      progress.innerHTML = `Uploaded ${uploaded}/${pdfs.length}`;
    } catch (err) {
      console.error(err);
      progress.innerHTML += `<br>Failed: ${pdf.name}`;
    }
  }

  progress.innerHTML += "<br>✅ All done!";
  form.reset();
});
