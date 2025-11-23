import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.48.0/+esm";

// 1) Supabase config
const SUPABASE_URL = "https://wvnlmkedacuhldjcmcsp.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE"; // <-- paste your anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2) DOM elements
const authCard = document.getElementById("authCard");
const appCard = document.getElementById("appCard");
const magicLinkForm = document.getElementById("magicLinkForm");
const emailInput = document.getElementById("emailInput");
const sendLinkBtn = document.getElementById("sendLinkBtn");
const statusMessage = document.getElementById("statusMessage");

const navLoginBtn = document.getElementById("navLoginBtn");
const buildSummaryBtn = document.getElementById("buildSummaryBtn");

const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const summaryForm = document.getElementById("summaryForm");
const candidateNameInput = document.getElementById("candidateName");
const targetRoleInput = document.getElementById("targetRole");
const notesInput = document.getElementById("notes");
const summaryStatus = document.getElementById("summaryStatus");

// 3) Helpers

function setStatus(msg, type = "info") {
  if (!statusMessage) return;
  statusMessage.textContent = msg || "";
  statusMessage.classList.remove("error", "success");
  if (type === "error") statusMessage.classList.add("error");
  if (type === "success") statusMessage.classList.add("success");
}

function setSummaryStatus(msg, type = "info") {
  if (!summaryStatus) return;
  summaryStatus.textContent = msg || "";
  summaryStatus.classList.remove("error", "success");
  if (type === "error") summaryStatus.classList.add("error");
  if (type === "success") summaryStatus.classList.add("success");
}

function showAuthCard() {
  authCard.classList.remove("hidden");
  appCard.classList.add("hidden");
}

function showAppCard() {
  authCard.classList.add("hidden");
  appCard.classList.remove("hidden");
}

async function handleMagicLink(email) {
  setStatus("Sending magic link…");

  sendLinkBtn.disabled = true;

  const redirectUrl = window.location.origin + window.location.pathname; // index.html

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error(error);
    setStatus("Error sending magic link. Double-check the email and try again.", "error");
    sendLinkBtn.disabled = false;
    return;
  }

  setStatus("Magic link sent. Check your email to finish signing in.", "success");
}

// 4) Handle redirect from magic link on load

async function handleRedirectSession() {
  const hasHash = window.location.hash.includes("access_token");
  const hasCode = window.location.search.includes("code=");

  if (!hasHash && !hasCode) return;

  try {
    const { data, error } = await supabase.auth.getSessionFromUrl({
      storeSession: true,
    });

    if (error) {
      console.error("Error getting user session from URL:", error);
      return;
    }

    // Clean URL so the token isn't left in the bar
    window.history.replaceState({}, document.title, window.location.pathname);

    console.log("Session stored from URL", data);
  } catch (err) {
    console.error("Unexpected error while handling redirect:", err);
  }
}

// 5) Load current session & update UI

async function refreshAuthState() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    showAuthCard();
    setStatus("");
    return;
  }

  // Logged in
  userEmailEl.textContent = session.user.email || "Signed in";
  showAppCard();
}

// 6) Wire up events

if (magicLinkForm) {
  magicLinkForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;

    await handleMagicLink(email);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    showAuthCard();
    setStatus("");
  });
}

// Make nav "Log in" and "Build my first summary" scroll to the card
function focusAuthCard() {
  const rect = authCard.getBoundingClientRect();
  if (rect.top < 0 || rect.top > window.innerHeight) {
    authCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

if (navLoginBtn) {
  navLoginBtn.addEventListener("click", focusAuthCard);
}

if (buildSummaryBtn) {
  buildSummaryBtn.addEventListener("click", focusAuthCard);
}

// Save a tiny "summary" into Supabase (optional MVP table)
if (summaryForm) {
  summaryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setSummaryStatus("");

    const name = candidateNameInput.value.trim();
    const role = targetRoleInput.value.trim();
    const notes = notesInput.value.trim();

    if (!name || !role || !notes) {
      setSummaryStatus("Fill in all fields before saving.", "error");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setSummaryStatus("Your session expired. Log in again.", "error");
      showAuthCard();
      return;
    }

    try {
      const { error } = await supabase.from("summaries").insert({
        user_id: session.user.id,
        candidate_name: name,
        target_role: role,
        notes,
      });

      if (error) {
        console.error(error);
        setSummaryStatus("Error saving summary. Try again.", "error");
        return;
      }

      setSummaryStatus("Draft saved. This is enough for our MVP.", "success");
      candidateNameInput.value = "";
      targetRoleInput.value = "";
      notesInput.value = "";
    } catch (err) {
      console.error(err);
      setSummaryStatus("Unexpected error. Try again.", "error");
    }
  });
}

// 7) Boot the app
(async function init() {
  await handleRedirectSession();
  await refreshAuthState();
})();
