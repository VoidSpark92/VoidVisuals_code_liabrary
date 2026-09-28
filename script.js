// One-Click Code Copy Function
function copyCode(elementId, btnElement) {
  const codeElem = document.getElementById(elementId);
  if (!codeElem) return;

  const codeText = codeElem.innerText;
  navigator.clipboard.writeText(codeText).then(() => {
    const originalText = btnElement.innerText;
    btnElement.innerText = "✓ Copied!";
    btnElement.style.background = "#22c55e";
    btnElement.style.color = "#ffffff";
    
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.style.background = "#38bdf8";
      btnElement.style.color = "#040914";
    }, 2000);
  });
}

// Admin Passcode Setup
const ADMIN_SECRET = "void92";

function openAdminModal() {
  document.getElementById("adminModal").style.display = "flex";
}

function closeAdminModal() {
  document.getElementById("adminModal").style.display = "none";
}

function verifyAdmin() {
  const enteredPass = document.getElementById("adminPass").value;
  if (enteredPass === ADMIN_SECRET) {
    document.getElementById("adminAuth").style.display = "none";
    document.getElementById("adminForm").style.display = "block";
    updateAdminProjectList();
  } else {
    alert("Incorrect passcode! Only </VoidSpark92> can access.");
  }
}

// Add New Project via Admin Form
function addNewProject() {
  const title = document.getElementById("projTitle").value.trim();
  const lang = document.getElementById("projLang").value;
  const videoUrl = document.getElementById("projVideo").value.trim();
  const code = document.getElementById("projCode").value.trim();

  if (!title || !code) {
    alert("Title aur Code enter karna zaroori hai!");
    return;
  }

  const project = {
    id: "custom-" + Date.now(),
    title: title,
    lang: lang,
    videoUrl: videoUrl,
    code: code
  };

  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  projects.push(project);
  localStorage.setItem("customProjects", JSON.stringify(projects));

  renderCard(project);
  updateAdminProjectList();

  // Reset & Close
  document.getElementById("projTitle").value = "";
  document.getElementById("projVideo").value = "";
  document.getElementById("projCode").value = "";
  closeAdminModal();
}

// Render dynamic card (with manual Play Controls, NO loop)
function renderCard(proj) {
  const grid = document.querySelector(".grid-container");

  let badgeClass = "html-badge";
  if (proj.lang === "JavaScript") badgeClass = "js-badge";
  if (proj.lang === "C++") badgeClass = "cpp-badge";

  let mediaHtml = `<span style="color:#64748b; font-size:0.9rem;">No Video Attached</span>`;
  if (proj.videoUrl) {
    if (proj.videoUrl.endsWith('.gif')) {
      mediaHtml = `<img src="${escapeHtml(proj.videoUrl)}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
      mediaHtml = `
        <video src="${escapeHtml(proj.videoUrl)}" controls playsinline preload="metadata" style="width:100%; height:100%; object-fit:cover;">
          Your browser does not support video.
        </video>
      `;
    }
  }

  const cardHtml = `
    <div class="code-card" id="card-${proj.id}">
      <div class="video-preview">
        ${mediaHtml}
      </div>
      <div class="card-details">
        <div class="card-meta">
          <span class="badge ${badgeClass}">${proj.lang}</span>
          <button class="like-btn" onclick="toggleLike('${proj.id}', this)">
            <span class="heart-icon">♥</span>
            <span class="like-count">0</span>
          </button>
        </div>
        <h3>${escapeHtml(proj.title)}</h3>
        <pre><code id="${proj.id}">${escapeHtml(proj.code)}</code></pre>
        <button class="copy-btn" onclick="copyCode('${proj.id}', this)">Copy Code</button>
      </div>
    </div>
  `;

  grid.insertAdjacentHTML("beforeend", cardHtml);
  restoreCardLikes(proj.id);
}

// Delete Project
function deleteProject(projId) {
  if (!confirm("Kya aap sach me ye project delete karna chahte hain?")) return;

  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  projects = projects.filter(p => p.id !== projId);
  localStorage.setItem("customProjects", JSON.stringify(projects));

  const targetCard = document.getElementById("card-" + projId);
  if (targetCard) targetCard.remove();

  updateAdminProjectList();
}

// Update Admin Delete List
function updateAdminProjectList() {
  const listContainer = document.getElementById("adminProjectList");
  if (!listContainer) return;

  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  if (projects.length === 0) {
    listContainer.innerHTML = `<p style="font-size:0.8rem; color:#64748b; margin-top:5px;">No custom projects added yet.</p>`;
    return;
  }

  listContainer.innerHTML = projects.map(p => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:#020617; padding:8px 12px; border-radius:6px; margin-bottom:6px; border:1px solid #1e293b;">
      <span style="font-size:0.85rem; color:#e2e8f0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:240px;">${escapeHtml(p.title)}</span>
      <button onclick="deleteProject('${p.id}')" style="background:#ef4444; border:none; color:#fff; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Delete</button>
    </div>
  `).join("");
}

// Active Filter State Tracker
let activeCategory = "All";

// Category Filter Function
function filterCards(category, btnElement) {
  activeCategory = category;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  applyFiltersAndSearch();
}

// Live Search Function
function handleSearch() {
  applyFiltersAndSearch();
}

// Combined Search & Filter Engine
function applyFiltersAndSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".code-card");

  cards.forEach(card => {
    const badge = card.querySelector(".badge");
    const title = card.querySelector("h3");
    const code = card.querySelector("code");

    const cardLang = badge ? badge.innerText.trim() : "";
    const titleText = title ? title.innerText.toLowerCase() : "";
    const codeText = code ? code.innerText.toLowerCase() : "";

    const matchesCategory = (activeCategory === "All" || cardLang === activeCategory);
    const matchesSearch = (!query || titleText.includes(query) || codeText.includes(query));

    if (matchesCategory && matchesSearch) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// ==========================================
// 100% RELIABLE LIKE SYSTEM
// ==========================================

function toggleLike(id, btnElement) {
  let userLikes = JSON.parse(localStorage.getItem("voidLikedIds")) || [];
  let likeCounts = JSON.parse(localStorage.getItem("voidLikeCounts")) || {};

  const countSpan = btnElement.querySelector(".like-count");
  
  // Agar count pehle se saved nahi hai toh current screen se uthao
  if (likeCounts[id] === undefined) {
    likeCounts[id] = parseInt(countSpan.innerText) || 0;
  }

  if (userLikes.includes(id)) {
    // Already liked tha, ab UNLIKE karo
    userLikes = userLikes.filter(item => item !== id);
    likeCounts[id] = Math.max(0, likeCounts[id] - 1);
    btnElement.classList.remove("liked");
  } else {
    // Like karo
    userLikes.push(id);
    likeCounts[id] += 1;
    btnElement.classList.add("liked");
  }

  // Update UI & save to LocalStorage
  countSpan.innerText = likeCounts[id];
  localStorage.setItem("voidLikedIds", JSON.stringify(userLikes));
  localStorage.setItem("voidLikeCounts", JSON.stringify(likeCounts));
}

// Har card ke like count aur button red status ko load karo
function restoreCardLikes(id) {
  const card = document.getElementById("card-" + id);
  if (!card) return;

  const likeBtn = card.querySelector(".like-btn");
  const countSpan = card.querySelector(".like-count");
  if (!likeBtn || !countSpan) return;

  let userLikes = JSON.parse(localStorage.getItem("voidLikedIds")) || [];
  let likeCounts = JSON.parse(localStorage.getItem("voidLikeCounts")) || {};

  // Agar LocalStorage me count saved hai toh set karo
  if (likeCounts[id] !== undefined) {
    countSpan.innerText = likeCounts[id];
  } else {
    // Agar nahi hai toh jo HTML me likha hai usko save karlo
    likeCounts[id] = parseInt(countSpan.innerText) || 0;
    localStorage.setItem("voidLikeCounts", JSON.stringify(likeCounts));
  }

  // Check karo user ne already like kiya hai ya nahi
  if (userLikes.includes(id)) {
    likeBtn.classList.add("liked");
  } else {
    likeBtn.classList.remove("liked");
  }
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Page load hone par restore karein
window.addEventListener("DOMContentLoaded", () => {
  // Custom cards render karo
  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  projects.forEach(p => renderCard(p));

  // Static cards ke likes restore karo
  restoreCardLikes("static-1");
  restoreCardLikes("static-2");
  restoreCardLikes("static-3");
});
