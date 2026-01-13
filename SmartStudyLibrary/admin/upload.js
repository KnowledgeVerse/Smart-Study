const form = document.getElementById('uploadForm');
const progress = document.getElementById('progress');
const manualCheck = document.getElementById('manualMode');
const classSel = document.getElementById('class');
const subjectSel = document.getElementById('subject');

const classSubjectMap = {
  preschool: ['Alphabet', 'Numbers', 'Rhymes', 'Stories'],
  1: ['Maths', 'English', 'Hindi', 'EVS'],
  2: ['Maths', 'English', 'Hindi', 'EVS'],
  3: ['Maths', 'English', 'Hindi', 'EVS', 'Science'],
  4: ['Maths', 'English', 'Hindi', 'EVS', 'Science'],
  5: ['Maths', 'English', 'Hindi', 'EVS', 'Science'],
  6: ['Maths', 'English', 'Hindi', 'Science', 'Social Science', 'Computer'],
  7: ['Maths', 'English', 'Hindi', 'Science', 'Social Science', 'Computer'],
  8: ['Maths', 'English', 'Hindi', 'Science', 'Social Science', 'Computer'],
  9: ['Maths', 'English', 'Hindi', 'Science', 'Social Science', 'Computer'],
  10: ['Maths', 'English', 'Hindi', 'Science', 'Social Science', 'Computer'],
  11: ['Maths', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer'],
  12: ['Maths', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer']
};

manualCheck.addEventListener('change', () => {
  const isManual = manualCheck.checked;
  classSel.disabled = !isManual;
  subjectSel.disabled = !isManual;
  if (isManual) updateSubjects();
});

function updateSubjects() {
  const cls = classSel.value;
  subjectSel.innerHTML = '<option value="">-- Select --</option>';
  (classSubjectMap[cls] || []).forEach(sub => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = sub;
    subjectSel.appendChild(opt);
  });
}
classSel.addEventListener('change', updateSubjects);

function parseFileName(fileName) {
  const parts = fileName.replace(/\.pdf$/i, '').split(' ');
  let cls = '', sub = '', name = fileName;
  if (parts.length >= 2 && !isNaN(parts[0])) {
    cls = parts[0];
    sub = parts[1];
    name = parts.slice(2).join(' ') || `${sub} ${parts[2] || ''}`.trim();
  }
  return { cls, sub, name };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const files = document.getElementById('bulkFiles').files;
  const board = form.board.value;
  const isManual = manualCheck.checked;

  const images = [...files].filter(f => f.type.startsWith('image/'));
  const pdfs = [...files].filter(f => f.type === 'application/pdf');

  if (images.length !== pdfs.length) return alert('⚠️ हर book के लिए 1 cover + 1 PDF चाहिए।');

  progress.innerHTML = 'Uploading...';
  let uploaded = 0;

  for (let i = 0; i < pdfs.length; i++) {
    const pdf = pdfs[i];
    const cover = images[i];

    const { cls: detCls, sub: detSub, name: detName } = parseFileName(pdf.name);

    const cls = isManual ? classSel.value : (detCls || 'preschool');
    const sub = isManual ? subjectSel.value : detSub;
    const bookName = isManual ? `${subjectSel.value} ${pdf.name.replace(/\.pdf$/i, '')}` : detName;

    if (!cls || !sub) { alert(`Class/Subject not found for ${pdf.name}`); continue; }

    const formData = new FormData();
    formData.append('name', bookName);
    formData.append('class', cls);
    formData.append('subject', sub);
    formData.append('board', board);
    formData.append('category', board);
    formData.append('cover', cover);
    formData.append('pdf', pdf);

    try {
      const res = await fetch('http://localhost:3000/upload-book', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      uploaded++;
      progress.innerHTML = `Uploaded ${uploaded}/${pdfs.length}`;
    } catch (err) {
      console.error(err);
      progress.innerHTML += `<br>Failed: ${pdf.name}`;
    }
  }

  progress.innerHTML += '<br>✅ All done!';
  form.reset();
});