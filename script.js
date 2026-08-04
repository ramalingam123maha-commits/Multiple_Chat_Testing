const form = document.getElementById('resumeForm');
const experienceFields = document.getElementById('experienceFields');
const educationFields = document.getElementById('educationFields');
const addExperience = document.getElementById('addExperience');
const addEducation = document.getElementById('addEducation');
const downloadBtn = document.getElementById('downloadBtn');

const defaults = {
  experience: [
    {
      role: 'Senior Product Designer',
      company: 'Bright Labs',
      dates: '2021 - Present',
      description: 'Led research, prototyping, and design systems work for customer-facing products, improving activation and reducing support tickets.'
    }
  ],
  education: [
    {
      school: 'State University',
      degree: 'B.A. in Design',
      dates: '2015 - 2019'
    }
  ]
};

function createInput(labelText, className, placeholder, value = '', tag = 'input') {
  const label = document.createElement('label');
  label.textContent = labelText;

  const field = document.createElement(tag);
  field.className = className;
  field.placeholder = placeholder;
  field.value = value;
  if (tag === 'textarea') {
    field.rows = 3;
  }

  label.appendChild(field);
  return label;
}

function createDynamicItem(type, values = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `dynamic-item ${type}-item`;

  const header = document.createElement('div');
  header.className = 'dynamic-item-header';
  header.innerHTML = `<strong>${type === 'experience' ? 'Role' : 'School'}</strong>`;

  const remove = document.createElement('button');
  remove.className = 'remove-btn';
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    wrapper.remove();
    updatePreview();
  });

  header.appendChild(remove);
  wrapper.appendChild(header);

  if (type === 'experience') {
    wrapper.appendChild(createInput('Job title', 'exp-role', 'Marketing Manager', values.role));
    wrapper.appendChild(createInput('Company', 'exp-company', 'Acme Inc.', values.company));
    wrapper.appendChild(createInput('Dates', 'exp-dates', '2020 - Present', values.dates));
    wrapper.appendChild(createInput('Description', 'exp-description', 'Describe your impact and achievements.', values.description, 'textarea'));
  } else {
    wrapper.appendChild(createInput('School', 'edu-school', 'State University', values.school));
    wrapper.appendChild(createInput('Degree or certificate', 'edu-degree', 'B.S. Computer Science', values.degree));
    wrapper.appendChild(createInput('Dates', 'edu-dates', '2016 - 2020', values.dates));
  }

  wrapper.addEventListener('input', updatePreview);
  return wrapper;
}

function collectItems(selector, fields) {
  return [...document.querySelectorAll(selector)].map((item) => {
    return fields.reduce((data, field) => {
      data[field.name] = item.querySelector(field.selector).value.trim();
      return data;
    }, {});
  }).filter((item) => Object.values(item).some(Boolean));
}

function setText(id, value, fallback = '') {
  document.getElementById(id).textContent = value || fallback;
}

function updateSectionVisibility(sectionId, hasContent) {
  document.getElementById(sectionId).hidden = !hasContent;
}

function updatePreview() {
  const fullName = document.getElementById('fullName').value.trim();
  const title = document.getElementById('title').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const location = document.getElementById('location').value.trim();
  const summary = document.getElementById('summary').value.trim();
  const skills = document.getElementById('skills').value.split(',').map((skill) => skill.trim()).filter(Boolean);

  setText('previewName', fullName, 'Your Name');
  setText('previewTitle', title, 'Professional Title');
  setText('previewContact', [email, phone, location].filter(Boolean).join(' • '), 'email@example.com • (555) 123-4567 • City, State');
  setText('previewSummary', summary, 'Add a brief professional summary to introduce your background and strengths.');
  updateSectionVisibility('summarySection', Boolean(summary));

  const experience = collectItems('.experience-item', [
    { name: 'role', selector: '.exp-role' },
    { name: 'company', selector: '.exp-company' },
    { name: 'dates', selector: '.exp-dates' },
    { name: 'description', selector: '.exp-description' }
  ]);

  const education = collectItems('.education-item', [
    { name: 'school', selector: '.edu-school' },
    { name: 'degree', selector: '.edu-degree' },
    { name: 'dates', selector: '.edu-dates' }
  ]);

  const previewExperience = document.getElementById('previewExperience');
  previewExperience.innerHTML = experience.map((item) => `
    <div class="resume-entry">
      <h4>${escapeHtml(item.role || 'Job Title')}</h4>
      <div class="item-meta">${escapeHtml([item.company, item.dates].filter(Boolean).join(' • '))}</div>
      <p>${escapeHtml(item.description)}</p>
    </div>
  `).join('');
  updateSectionVisibility('experienceSection', experience.length > 0);

  const previewEducation = document.getElementById('previewEducation');
  previewEducation.innerHTML = education.map((item) => `
    <div class="resume-entry">
      <h4>${escapeHtml(item.school || 'School')}</h4>
      <div class="item-meta">${escapeHtml([item.degree, item.dates].filter(Boolean).join(' • '))}</div>
    </div>
  `).join('');
  updateSectionVisibility('educationSection', education.length > 0);

  const previewSkills = document.getElementById('previewSkills');
  previewSkills.innerHTML = skills.map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('');
  updateSectionVisibility('skillsSection', skills.length > 0);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[character]));
}

function downloadResume() {
  const resume = document.getElementById('resumePreview');
  const name = document.getElementById('fullName').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'resume';

  html2pdf().set({
    margin: 0.3,
    filename: `${name}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).from(resume).save();
}

addExperience.addEventListener('click', () => {
  experienceFields.appendChild(createDynamicItem('experience'));
  updatePreview();
});

addEducation.addEventListener('click', () => {
  educationFields.appendChild(createDynamicItem('education'));
  updatePreview();
});

form.addEventListener('input', updatePreview);
downloadBtn.addEventListener('click', downloadResume);

defaults.experience.forEach((item) => experienceFields.appendChild(createDynamicItem('experience', item)));
defaults.education.forEach((item) => educationFields.appendChild(createDynamicItem('education', item)));
updatePreview();
