  /* ── CONFIG ── */
  const YT_CHANNEL_ID    = "UCli2uMiGU1r4A4kTamj6zlw";
  const YT_API_KEY       = "AIzaSyA8Bpj1j7etoAj647d9PyRVQ4Y8ui5OMf4";
  const FORMSPREE        = "https://formspree.io/f/xgolbebw";

  /* ── NAV scroll ── */
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  });

  /* ── Mobile menu ── */
  let menuOpen = false;
  function toggleMobileMenu() {
    menuOpen = !menuOpen;
    document.getElementById("mobile-menu").classList.toggle("open", menuOpen);
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }
  function closeMobileMenu() {
    menuOpen = false;
    document.getElementById("mobile-menu").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

  /* ── FAQ accordion ── */
  function toggleFaq(el) {
    const item = el.closest(".faq-item");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  }

  /* ── YouTube latest video (YouTube Data API v3) ── */
  async function loadLatestVideo() {
    const searchUrl = "https://www.googleapis.com/youtube/v3/search"
      + "?key=" + YT_API_KEY
      + "&channelId=" + YT_CHANNEL_ID
      + "&part=snippet"
      + "&order=date"
      + "&maxResults=1"
      + "&type=video";
    try {
      const res  = await fetch(searchUrl);
      if (!res.ok) throw new Error("YouTube API error: " + res.status);
      const data = await res.json();
      if (!data.items || !data.items.length) throw new Error("No videos found");

      const item    = data.items[0];
      const vidId   = item.id.videoId;
      const snippet = item.snippet;
      const title   = snippet.title;
      const desc    = (snippet.description || "").slice(0, 280);
      const date    = new Date(snippet.publishedAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
      const link    = "https://www.youtube.com/watch?v=" + vidId;

      document.getElementById("yt-loading").style.display = "none";

      const card = document.getElementById("yt-card");
      card.style.display = "grid";
      card.innerHTML = `
        <div class="yt-embed">
          <iframe src="https://www.youtube.com/embed/${vidId}?rel=0&modestbranding=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
        <div>
          <span class="yt-badge">Latest Upload</span>
          <div class="yt-vtitle">${title}</div>
          <div class="yt-date">Published ${date}</div>
          <div class="yt-vdesc">${desc}…</div>
          <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-spice">Watch on YouTube</a>
        </div>
      `;
    } catch (err) {
      console.warn("loadLatestVideo:", err);
      document.getElementById("yt-loading").innerHTML =
        '<em style="color:var(--muted)">Could not load latest video. <a href="https://www.youtube.com/@Creole_Trades" target="_blank" style="color:var(--firefly)">Visit the channel →</a></em>';
    }
  }

  /* ── Email popup ── */
  (function() {
    const POPUP_DELAY  = 12000; // 12 seconds
    const STORAGE_KEY  = 'ct_popup_dismissed';
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setTimeout(() => {
      document.getElementById('email-popup').classList.add('open');
      document.body.style.overflow = 'hidden';
    }, POPUP_DELAY);
  })();

  function closePopup() {
    document.getElementById('email-popup').classList.remove('open');
    document.body.style.overflow = '';
    sessionStorage.setItem('ct_popup_dismissed', '1');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePopup();
      ['privacy','terms'].forEach(closeModal);
    }
  });

  /* ── Contact form ── */
  document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('cf-submit');
    const err = document.getElementById('cf-error');
    err.style.display = 'none';
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = new FormData(this);
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        window.location.href = '/thank-you';
      } else {
        throw new Error();
      }
    } catch {
      err.textContent = 'Something went wrong. Please try again or reach out via Discord.';
      err.style.display = 'block';
      btn.textContent = 'Send Message →';
      btn.disabled = false;
    }
  });

  /* ── Modals ── */
  function openModal(id) {
    document.getElementById('modal-' + id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    document.getElementById('modal-' + id).classList.remove('open');
    document.body.style.overflow = '';
  }
  function closeModalOutside(e, id) {
    if (e.target === document.getElementById('modal-' + id)) closeModal(id);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['privacy','terms'].forEach(closeModal);
    }
  });

  /* ── Init ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadLatestVideo);
  } else {
    loadLatestVideo();
  }
