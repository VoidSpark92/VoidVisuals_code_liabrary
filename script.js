// ========================================================
// VoidVisuals Master Engine - Zero Video / Pure Sandbox
// Features: Sandbox Live Preview, Local Auth/Admin, & Comments
// Engineered by </VoidSpark92>
// ========================================================

// 1. One-Click Code Copy System
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
      btnElement.style.background = "";
      btnElement.style.color = "";
    }, 2000);
  });
}

// 2. Interactive Live Sandbox Preview
function runLivePreview(elementId) {
  const codeElem = document.getElementById(elementId);
  if (!codeElem) return;

  let code = codeElem.innerText;
  const modal = document.getElementById("previewModal");
  const iframe = document.getElementById("previewIframe");

  // Agar pure C++ code hai toh realistic terminal output dikhayega
  if (code.includes("#include <iostream>")) {
    code = `
      <!DOCTYPE html>
      <html>
      <body style="background:#040914; color:#38bdf8; font-family:monospace; padding:30px; font-size:1.1rem; line-height:1.6;">
        <p style="color:#64748b;">[Compiling & Executing C++ Engine...]</p>
        <p style="color:#f8fafc; font-weight:bold;">&gt; &lt;/VoidSpark92&gt; Engine Ready!</p>
        <p style="color:#22c55e; margin-top:20px;">Process finished with exit code 0.</p>
      </body>
      </html>
    `;
  }

  modal.style.display = "flex";
  iframe.srcdoc = code;
}

function closePreviewModal() {
  document.getElementById("previewModal").style.display = "none";
  document.getElementById("previewIframe").srcdoc = "";
}

// 3. User Authentication & Master Admin Session
let authMode = "signup"; // "signup" or "login"

const MASTER_ADMIN = {
  username: "VoidSpark92",
  password: "void92",
  role: "admin"
};

function openAuthModal(mode) {
  authMode = mode;
  const modal = document.getElementById("authModal");
  const title = document.getElementById("authModalTitle");
  const submitBtn = document.getElementById("authSubmitBtn");
  const toggleText = document.getElementById("authToggleText");

  if (mode === "signup") {
    title.innerText = "Create Void Account";
    submitBtn.innerText = "Sign Up 🚀";
    toggleText.innerText = "Already have an account? Log In";
  } else {
    title.innerText = "Log In to VoidVisuals";
    submitBtn.innerText = "Log In ⚡";
    toggleText.innerText = "Don't have an account? Sign Up";
  }

  document.getElementById("authUsername").value = "";
  document.getElementById("authPassword").value = "";
  modal.style.display = "flex";
}

function closeAuthModal() {
  document.getElementById("authModal").style.display = "none";
}

function toggleAuthMode() {
  openAuthModal(authMode === "signup" ? "login" : "signup");
}

function handleAuthSubmit() {
  const usernameInput = document.getElementById("authUsername").value.trim();
  const passwordInput = document.getElementById("authPassword").value.trim();

  if (!usernameInput || !passwordInput) {
    alert("Kripya Username aur Password dono daalein!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("voidUsers")) || [];

  if (authMode === "signup") {
    if (usernameInput.toLowerCase() === MASTER_ADMIN.username.toLowerCase()) {
      alert("Yeh username creator ke liye reserved hai! Log In par click karein.");
      return;
    }

    const exists = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());
    if (exists) {
      alert("Yeh username pehle se exist karta hai! Naya naam chunein.");
      return;
    }

    const newUser = { username: usernameInput, password: passwordInput, role: "user" };
    users.push(newUser);
    localStorage.setItem("voidUsers", JSON.stringify(users));
    setCurrentSession(newUser);
    alert(`Account create ho gaya! Welcome, ${newUser.username}.`);
  } else {
    // Log In
    if (usernameInput.toLowerCase() === MASTER_ADMIN.username.toLowerCase() && passwordInput === MASTER_ADMIN.password) {
      setCurrentSession(MASTER_ADMIN);
      alert("Master Admin </VoidSpark92> verified!");
    } else {
      const match = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);
      if (match) {
        setCurrentSession(match);
        alert(`Welcome back, ${match.username}!`);
      } else {
        alert("Galat username ya password!");
        return;
      }
    }
  }

  closeAuthModal();
  syncAuthUI();
}

function setCurrentSession(user) {
  localStorage.setItem("currentUserSession", JSON.stringify({
    username: user.username,
    role: user.role
  }));
}

function logoutUser() {
  localStorage.removeItem("currentUserSession");
  syncAuthUI();
}

function syncAuthUI() {
  const session = JSON.parse(localStorage.getItem("currentUserSession"));
  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView = document.getElementById("loggedInView");
  const displayUsername = document.getElementById("displayUsername");
  const userBadge = document.getElementById("userBadge");
  const userRoleIcon = document.getElementById("userRoleIcon");
  const adminOpenBtn = document.querySelector(".admin-open-btn");

  if (session) {
    loggedOutView.style.display = "none";
    loggedInView.style.display = "flex";
    displayUsername.innerText = session.username;

    if (session.role === "admin") {
      userRoleIcon.innerText = "👑";
      userBadge.classList.add("admin-glow");
      if (adminOpenBtn) adminOpenBtn.style.display = "block";
    } else {
      userRoleIcon.innerText = "👤";
      userBadge.classList.remove("admin-glow");
      if (adminOpenBtn) adminOpenBtn.style.display = "none";
    }
  } else {
    loggedOutView.style.display = "flex";
    loggedInView.style.display = "none";
    if (adminOpenBtn) adminOpenBtn.style.display = "none";
  }
}

// 4. Admin Modal & Card Publisher (NO Video requirements)
function openAdminModal() {
  const session = JSON.parse(localStorage.getItem("currentUserSession"));
  if (session && session.role === "admin") {
    document.getElementById("adminModal").style.display = "flex";
    updateAdminProjectList();
  } else {
    alert("Keval Master Admin </VoidSpark92> login karke isse access kar sakte hain!");
  }
}

function closeAdminModal() {
  document.getElementById("adminModal").style.display = "none";
}

function addNewProject() {
  const title = document.getElementById("projTitle").value.trim();
  const lang = document.getElementById("projLang").value;
  const code = document.getElementById("projCode").value.trim();

  if (!title || !code) {
    alert("Title aur Code snippet bharna zaroori hai!");
    return;
  }

  const project = {
    id: "custom-" + Date.now(),
    title: title,
    lang: lang,
    code: code
  };

  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  projects.push(project);
  localStorage.setItem("customProjects", JSON.stringify(projects));

  renderCard(project);
  updateAdminProjectList();

  document.getElementById("projTitle").value = "";
  document.getElementById("projCode").value = "";
  closeAdminModal();
}

function renderCard(proj) {
  const grid = document.querySelector(".grid-container");

  let badgeClass = "html-badge";
  if (proj.lang === "JavaScript") badgeClass = "js-badge";
  if (proj.lang === "C++") badgeClass = "cpp-badge";

  const cardHtml = `
    <div class="code-card" id="card-${proj.id}">
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
        <div class="card-action-bar">
          <button class="copy-btn" onclick="copyCode('${proj.id}', this)">Copy Code</button>
          <button class="preview-btn" onclick="runLivePreview('${proj.id}')">▶️ Live Preview</button>
        </div>

        <div class="comments-wrapper">
          <div class="comments-header" onclick="toggleComments('${proj.id}')">
            <span>💬 Comments (<span id="count-${proj.id}">0</span>)</span>
            <span class="toggle-arrow">▼</span>
          </div>
          <div class="comments-body" id="comments-box-${proj.id}" style="display: none;">
            <div class="comments-list" id="list-${proj.id}"></div>
            <div class="comment-input-row">
              <input type="text" id="input-${proj.id}" placeholder="Write a comment...">
              <button class="action-btn comment-post-btn" onclick="postComment('${proj.id}')">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  grid.insertAdjacentHTML("beforeend", cardHtml);
  syncCardLike(proj.id);
  syncComments(proj.id);
}

function deleteProject(projId) {
  if (!confirm("Kya aap sach me ye project delete karna chahte hain?")) return;

  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  projects = projects.filter(p => p.id !== projId);
  localStorage.setItem("customProjects", JSON.stringify(projects));

  const targetCard = document.getElementById("card-" + projId);
  if (targetCard) targetCard.remove();

  updateAdminProjectList();
}

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

// 5. Comments Engine (LocalStorage Persistent)
function toggleComments(cardId) {
  const box = document.getElementById("comments-box-" + cardId);
  if (!box) return;
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function postComment(cardId) {
  const session = JSON.parse(localStorage.getItem("currentUserSession"));
  if (!session) {
    alert("Comment karne ke liye pehle Log In ya Sign Up karein!");
    openAuthModal("login");
    return;
  }

  const input = document.getElementById("input-" + cardId);
  const text = input.value.trim();
  if (!text) return;

  let allComments = JSON.parse(localStorage.getItem("voidComments")) || {};
  if (!allComments[cardId]) allComments[cardId] = [];

  allComments[cardId].push({
    user: session.username,
    role: session.role,
    text: text,
    timestamp: Date.now()
  });

  localStorage.setItem("voidComments", JSON.stringify(allComments));
  input.value = "";
  syncComments(cardId);
}

function syncComments(cardId) {
  let allComments = JSON.parse(localStorage.getItem("voidComments")) || {};
  const list = document.getElementById("list-" + cardId);
  const countSpan = document.getElementById("count-" + cardId);
  const cardComments = allComments[cardId] || [];

  if (countSpan) countSpan.innerText = cardComments.length;
  if (!list) return;

  if (cardComments.length === 0) {
    list.innerHTML = `<p style="color:#64748b; font-size:0.75rem; margin:4px 0;">No comments yet. Be the first!</p>`;
    return;
  }

  list.innerHTML = cardComments.map(c => `
    <div class="comment-item">
      <strong>${c.role === 'admin' ? '👑 ' : ''}${escapeHtml(c.user)}:</strong> ${escapeHtml(c.text)}
    </div>
  `).join("");
}

// 6. Like Counter Engine
function toggleLike(id, btnElement) {
  let userLikes = JSON.parse(localStorage.getItem("voidLikedIds")) || [];
  let allCounts = JSON.parse(localStorage.getItem("voidLikeCounts")) || {};
  const countSpan = btnElement.querySelector(".like-count");
  
  let currentCount = allCounts[id] !== undefined ? allCounts[id] : parseInt(countSpan.innerText) || 0;

  if (userLikes.includes(id)) {
    userLikes = userLikes.filter(item => item !== id);
    currentCount = Math.max(0, currentCount - 1);
    btnElement.classList.remove("liked");
  } else {
    userLikes.push(id);
    currentCount += 1;
    btnElement.classList.add("liked");
  }

  allCounts[id] = currentCount;
  countSpan.innerText = currentCount;
  localStorage.setItem("voidLikedIds", JSON.stringify(userLikes));
  localStorage.setItem("voidLikeCounts", JSON.stringify(allCounts));
}

function syncCardLike(id) {
  const card = document.getElementById("card-" + id);
  if (!card) return;

  const btn = card.querySelector(".like-btn");
  const countSpan = card.querySelector(".like-count");
  if (!btn || !countSpan) return;

  let userLikes = JSON.parse(localStorage.getItem("voidLikedIds")) || [];
  let allCounts = JSON.parse(localStorage.getItem("voidLikeCounts")) || {};

  if (allCounts[id] !== undefined) {
    countSpan.innerText = allCounts[id];
  }

  if (userLikes.includes(id)) {
    btn.classList.add("liked");
  } else {
    btn.classList.remove("liked");
  }
}

// 7. Search & Category Filters
let activeCategory = "All";

function filterCards(category, btnElement) {
  activeCategory = category;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  applyFiltersAndSearch();
}

function handleSearch() {
  applyFiltersAndSearch();
}

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

    card.style.display = (matchesCategory && matchesSearch) ? "flex" : "none";
  });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 8. Bootstrap Initial State
window.addEventListener("DOMContentLoaded", () => {
  syncAuthUI();

  // Static cards likes & comments sync
  ["static-1", "static-2", "static-3"].forEach(id => {
    syncCardLike(id);
    syncComments(id);
  });

  // Custom user projects render
  let projects = JSON.parse(localStorage.getItem("customProjects")) || [];
  projects.forEach(p => renderCard(p));
});
