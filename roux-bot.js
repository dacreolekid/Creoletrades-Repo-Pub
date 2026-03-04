/* ============================================================
   Roux — CreoleTrades AI Assistant
   Usage: <script src="/roux-bot.js"></script>
   ============================================================ */
(function () {
  'use strict';

  const SYSTEM_PROMPT = `You are Roux, the AI assistant for CreoleTrades — a trading education brand built by Que, a trader and educator with 6+ years in the markets, rooted in Creole culture.

Your personality: warm, knowledgeable, conversational. You speak with confidence but zero pressure. You're helpful like a trusted community member — not a salesperson. Use light Creole-inspired warmth ("come sit at the table", "let's eat", "the community hunts together") occasionally but naturally.

KNOWLEDGE BASE:

## About CreoleTrades
- Founded by Que — 6+ years trading experience, Creole roots
- Focus: options trading, chart analysis, smart money concepts, risk management
- Motto: "Where southern grit meets clarity"
- Website: creoletrades.com

## Free Starter Guide
- Free resource covering: options trading basics, how to read charts, risk management, Wolf Chart setup, how the Trading Roux community works
- Read online: creoletrades.com/starter-guide
- Download PDF: creoletrades.com/starter-guide.pdf
- Best starting point for anyone brand new to trading

## Community Tiers (The Trading Roux Discord)
- Join link: mee6.gg/m/tradingroux

### Crescent Tier — $29.99/month
- Full Trading Roux Discord community access
- Bot integration
- Wolf Chart 2.1 compatibility
- REQUIRES Wolf Chart 2.1 subscription first
- Best for: traders ready to join the community ecosystem

### Delta Calls — $79.99/month
- Everything in Crescent
- Premium real-time trade calls delivered inside Discord
- Signal flow with entries, targets, and context
- Best for: traders ready to execute at a higher level

### Roux Mastery — $399.99/month
- Direct 1-on-1 coaching with Que personally
- Personalized trading strategy development
- Full accountability and hands-on mentorship
- Best for: serious traders who want accelerated growth

## Onboarding Steps
1. Grab the Free Starter Guide at creoletrades.com/starter-guide
2. Subscribe to Wolf Chart 2.1 (required for Crescent Tier): thewolfchart.com/?via=creoletrades
3. Submit your TradingView username after subscribing (access granted within 24 hours)
4. Join the Trading Roux Discord and select your tier: mee6.gg/m/tradingroux
5. Introduce yourself in the community and get to work

## Wolf Chart 2.1
- Built by Shon The Wolf on TradingView
- Required for Crescent Tier membership
- Subscribe via affiliate link: thewolfchart.com/?via=creoletrades
- Features: Arc Confirmation System, Wolf Pack Buy/Sell Signals, WTMA (Wolf Trend Moving Average), Smart Money Concepts (order blocks, liquidity zones, fair value gaps), ATR Tracker for stop loss placement, 400-Day Support/Resistance levels
- After subscribing: submit TradingView username, access granted within 24 hours
- Also unlocks Wolf Empire Discord role automatically

## Socials
- YouTube: youtube.com/@Creole_Trades
- Instagram: @creoletrades
- TikTok: @creoletrades
- Facebook: facebook.com/profile.php?id=61581502905271
- Discord: mee6.gg/m/tradingroux

## Contact
- Contact form: creoletrades.com/#contact
- Response time: 24-48 hours
- For coaching inquiries: select Roux Mastery tier or use contact form

## FAQ
Q: Do I need Wolf Chart to join the community?
A: Wolf Chart is required for the Crescent Tier. You can get it at thewolfchart.com/?via=creoletrades before joining.

Q: How much money do I need to start trading?
A: You can start with paper trading (simulated) for free. For live trading, start with only what you can afford to lose — $500-$1,000 is a reasonable starting point.

Q: What markets does Que focus on?
A: Primarily options trading on stocks, with chart analysis using smart money concepts that apply across all markets.

Q: Can I cancel my subscription?
A: Yes, subscriptions are monthly and can be cancelled anytime through MEE6.

IMPORTANT RULES:
- Never provide financial advice or tell anyone to buy/sell specific assets
- Always add "Not financial advice" when discussing specific trading strategies
- If asked something outside your knowledge, direct them to the contact form at creoletrades.com/#contact
- Keep responses concise — 2-4 sentences max unless a detailed explanation is needed
- Always end with a helpful next step or link when relevant
- Never make up information — if unsure, say so and point to the contact form`;

  // ── Styles ──────────────────────────────────────────────
  const CSS = `
    #roux-widget * { box-sizing: border-box; margin: 0; padding: 0; }

    #roux-trigger {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9998;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #C9A84C, #F0D080);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(201,168,76,0.45);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      font-size: 1.4rem;
    }
    #roux-trigger:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 8px 32px rgba(201,168,76,0.6);
    }
    #roux-trigger .roux-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 14px;
      height: 14px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid #070C18;
      animation: roux-pulse 2s infinite;
    }
    @keyframes roux-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    #roux-window {
      position: fixed;
      bottom: 100px;
      right: 28px;
      z-index: 9999;
      width: 360px;
      max-height: 540px;
      display: flex;
      flex-direction: column;
      background: #0D1526;
      border: 1px solid rgba(201,168,76,0.3);
      box-shadow: 0 20px 60px rgba(5,9,17,0.8), 0 0 0 1px rgba(201,168,76,0.1);
      transform: translateY(20px) scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #roux-window.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    #roux-header {
      background: linear-gradient(135deg, #0F1A2E, #0D1526);
      border-bottom: 1px solid rgba(201,168,76,0.2);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .roux-header-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .roux-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #C9A84C, #F0D080);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .roux-header-text {}
    .roux-name {
      font-family: Georgia, serif;
      font-size: 0.9rem;
      font-weight: bold;
      color: #EEF2FF;
      font-style: italic;
      line-height: 1.2;
    }
    .roux-status {
      font-size: 0.65rem;
      color: #22c55e;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-family: Arial, sans-serif;
    }
    .roux-status::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
    }
    .roux-close {
      background: none;
      border: 1px solid rgba(201,168,76,0.2);
      color: #5A7099;
      width: 26px;
      height: 26px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-family: Arial, sans-serif;
    }
    .roux-close:hover { color: #EEF2FF; border-color: rgba(201,168,76,0.5); }

    #roux-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(201,168,76,0.2) transparent;
    }

    .roux-msg {
      display: flex;
      gap: 0.5rem;
      animation: roux-fadein 0.3s ease;
    }
    @keyframes roux-fadein {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .roux-msg.user { flex-direction: row-reverse; }

    .roux-bubble {
      max-width: 82%;
      padding: 0.65rem 0.9rem;
      font-family: Georgia, serif;
      font-size: 0.82rem;
      line-height: 1.65;
      border-radius: 2px;
    }
    .roux-msg.bot .roux-bubble {
      background: #0F1A2E;
      border: 1px solid rgba(201,168,76,0.12);
      color: #C8D4E8;
      border-radius: 0 8px 8px 8px;
    }
    .roux-msg.user .roux-bubble {
      background: linear-gradient(135deg, #C9A84C, #E2BC6B);
      color: #050911;
      font-weight: 500;
      border-radius: 8px 0 8px 8px;
    }
    .roux-bubble a {
      color: #F0D080;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .roux-msg.user .roux-bubble a { color: #050911; }

    .roux-typing {
      display: flex;
      gap: 4px;
      padding: 0.65rem 0.9rem;
      background: #0F1A2E;
      border: 1px solid rgba(201,168,76,0.12);
      width: fit-content;
      border-radius: 0 8px 8px 8px;
    }
    .roux-typing span {
      width: 6px;
      height: 6px;
      background: #5A7099;
      border-radius: 50%;
      animation: roux-bounce 1.2s infinite;
    }
    .roux-typing span:nth-child(2) { animation-delay: 0.2s; }
    .roux-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes roux-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    #roux-suggestions {
      padding: 0 1rem 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      flex-shrink: 0;
    }
    .roux-chip {
      background: rgba(201,168,76,0.08);
      border: 1px solid rgba(201,168,76,0.2);
      color: #C9A84C;
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 0.72rem;
      padding: 0.3rem 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 20px;
    }
    .roux-chip:hover {
      background: rgba(201,168,76,0.16);
      border-color: rgba(201,168,76,0.4);
      color: #F0D080;
    }

    #roux-input-area {
      border-top: 1px solid rgba(201,168,76,0.12);
      padding: 0.75rem 1rem;
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    #roux-input {
      flex: 1;
      background: #070C18;
      border: 1px solid rgba(201,168,76,0.15);
      color: #EEF2FF;
      font-family: Georgia, serif;
      font-size: 0.82rem;
      padding: 0.6rem 0.85rem;
      outline: none;
      transition: border-color 0.2s;
      resize: none;
      border-radius: 4px;
      max-height: 80px;
    }
    #roux-input::placeholder { color: #5A7099; font-style: italic; }
    #roux-input:focus { border-color: rgba(201,168,76,0.4); }

    #roux-send {
      background: linear-gradient(135deg, #C9A84C, #E2BC6B);
      border: none;
      color: #050911;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s;
      flex-shrink: 0;
      align-self: flex-end;
    }
    #roux-send:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(201,168,76,0.4); }
    #roux-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    #roux-footer {
      padding: 0.4rem 1rem 0.6rem;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 0.62rem;
      color: #3D5278;
      border-top: 1px solid rgba(201,168,76,0.06);
      flex-shrink: 0;
    }

    @media (max-width: 480px) {
      #roux-window { width: calc(100vw - 24px); right: 12px; bottom: 88px; }
      #roux-trigger { bottom: 18px; right: 18px; }
    }
  `;

  // ── HTML ─────────────────────────────────────────────────
  const HTML = `
    <div id="roux-widget">
      <button id="roux-trigger" aria-label="Chat with Roux">
        ⚜
        <span class="roux-badge"></span>
      </button>

      <div id="roux-window" role="dialog" aria-label="Chat with Roux">
        <div id="roux-header">
          <div class="roux-header-info">
            <div class="roux-avatar">⚜</div>
            <div class="roux-header-text">
              <div class="roux-name">Roux</div>
              <div class="roux-status">Online — CreoleTrades Assistant</div>
            </div>
          </div>
          <button class="roux-close" id="roux-close-btn" aria-label="Close chat">✕</button>
        </div>

        <div id="roux-messages"></div>

        <div id="roux-suggestions">
          <button class="roux-chip" data-q="What tiers are available?">View tiers</button>
          <button class="roux-chip" data-q="How do I get started?">Get started</button>
          <button class="roux-chip" data-q="What is Wolf Chart?">Wolf Chart</button>
          <button class="roux-chip" data-q="Where can I find the Free Starter Guide?">Free Guide</button>
        </div>

        <div id="roux-input-area">
          <textarea id="roux-input" placeholder="Ask me anything..." rows="1"></textarea>
          <button id="roux-send" aria-label="Send">→</button>
        </div>

        <div id="roux-footer">Powered by CreoleTrades · Not financial advice</div>
      </div>
    </div>
  `;

  // ── Init ─────────────────────────────────────────────────
  const style  = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.innerHTML = HTML;
  document.body.appendChild(wrap);

  // Elements
  const trigger   = document.getElementById('roux-trigger');
  const win       = document.getElementById('roux-window');
  const closeBtn  = document.getElementById('roux-close-btn');
  const messages  = document.getElementById('roux-messages');
  const input     = document.getElementById('roux-input');
  const sendBtn   = document.getElementById('roux-send');
  const chips     = document.querySelectorAll('.roux-chip');
  const sugBox    = document.getElementById('roux-suggestions');

  let isOpen    = false;
  let isLoading = false;
  let history   = [];

  // ── Toggle ───────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    win.classList.add('open');
    if (messages.children.length === 0) addGreeting();
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
  }

  trigger.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // ── Greeting ─────────────────────────────────────────────
  function addGreeting() {
    addMessage('bot', "Hey! I'm Roux — your CreoleTrades guide. ⚜️ Ask me anything about the community, tiers, Wolf Chart, or how to get started. I got you.");
  }

  // ── Messages ─────────────────────────────────────────────
  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `roux-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'roux-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'roux-msg bot';
    div.id = 'roux-typing-indicator';
    div.innerHTML = `<div class="roux-typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('roux-typing-indicator');
    if (t) t.remove();
  }

  // ── Send ─────────────────────────────────────────────────
  async function send(text) {
    if (!text.trim() || isLoading) return;
    isLoading = true;
    sendBtn.disabled = true;
    sugBox.style.display = 'none';

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    input.style.height = 'auto';

    addTyping();

    try {
      const res = await fetch('/.netlify/functions/roux-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();
      removeTyping();

      const reply = data.reply || "Sorry, I ran into an issue. Try reaching out at creoletrades.com/#contact";
      history.push({ role: 'assistant', content: reply });
      addMessage('bot', reply);










      history.push({ role: 'assistant', content: reply });
      addMessage('bot', reply);

    } catch (e) {
      removeTyping();
      addMessage('bot', "Sorry, something went wrong on my end. You can reach us directly at creoletrades.com/#contact ⚜️");
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ── Events ───────────────────────────────────────────────
  sendBtn.addEventListener('click', () => send(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      send(chip.dataset.q);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

})();
