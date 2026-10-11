(function () {
  "use strict";

  /* ── theme ── */
  var root = document.documentElement;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var saved = store("gholang-theme");
  if (saved) root.setAttribute("data-theme", saved);
  var themeBtn = document.getElementById("theme-btn");
  function isDark() {
    var t = root.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function paintThemeBtn() { themeBtn.textContent = isDark() ? "☀" : "☾"; themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme"); }
  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("gholang-theme", next);
    paintThemeBtn();
  });
  paintThemeBtn();

  /* ── sidebar from sections ── */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[data-group]"));
  var nav = document.getElementById("nav");
  var groups = {};
  sections.forEach(function (s) {
    var g = s.getAttribute("data-group");
    if (!groups[g]) {
      var wrap = document.createElement("div");
      wrap.className = "nav-group";
      var h = document.createElement("h4");
      h.textContent = g;
      wrap.appendChild(h);
      nav.appendChild(wrap);
      groups[g] = wrap;
    }
    var a = document.createElement("a");
    a.href = "#" + s.id;
    a.textContent = s.getAttribute("data-title") || s.querySelector("h2").textContent;
    groups[g].appendChild(a);
  });
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));

  /* search filter */
  document.getElementById("nav-search").addEventListener("input", function (e) {
    var q = e.target.value.trim().toLowerCase();
    links.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      var hay = (a.textContent + " " + (sec ? sec.textContent : "")).toLowerCase();
      a.hidden = q && hay.indexOf(q) === -1;
    });
    Object.keys(groups).forEach(function (g) {
      groups[g].hidden = !groups[g].querySelector("a:not([hidden])");
    });
  });

  /* scroll-spy */
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-80px 0px -65% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }
  setActive((location.hash || "#" + sections[0].id).slice(1));

  /* mobile menu */
  var menuBtn = document.getElementById("menu-btn");
  menuBtn.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { document.body.classList.remove("nav-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  /* ── highlighting ── */
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hlLox(src) {
    var re = /(\/\/[^\n]*)|("[^"]*")|\b(\d+(?:\.\d+)?)\b|\b(and|class|else|false|for|fun|if|nil|or|print|return|super|this|true|var|while)\b|\b(clock)\b/g;
    var out = "", last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? "t-c" : m[2] ? "t-s" : m[3] ? "t-n" : m[4] ? "t-k" : "t-b";
      out += '<span class="' + cls + '">' + esc(m[0]) + "</span>";
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  function hlC(src) {
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|(#\w+)|\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?[uU]?)\b|\b(typedef|struct|enum|union|static|const|return|if|else|for|while|switch|case|break|default|void|int|char|bool|double|uint8_t|uint16_t|uint32_t|size_t|true|false|NULL|inline|extern)\b|\b(OP_[A-Z_]+|TOKEN_[A-Z_]+|VAL_[A-Z_]+|OBJ_[A-Z_]+|PREC_[A-Z_]+)\b/g;
    var out = "", last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? "t-c" : m[2] ? "t-s" : m[3] ? "t-k" : m[4] ? "t-n" : m[5] ? "t-k" : "t-op";
      out += '<span class="' + cls + '">' + esc(m[0]) + "</span>";
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  function hlBytecode(src) {
    return esc(src)
      .replace(/\bOP_[A-Z_]+/g, '<span class="t-op">$&</span>')
      .replace(/'([^'\n]*)'/g, "<span class=\"t-s\">'$1'</span>")
      .replace(/(-&gt; \d+)/g, '<span class="t-n">$1</span>')
      .replace(/^(\s*\[[^\n]*\])$/gm, '<span class="t-d">$1</span>');
  }
  var langs = { lox: hlLox, c: hlC, bytecode: hlBytecode };

  document.querySelectorAll("pre[data-lang]").forEach(function (pre) {
    var lang = pre.getAttribute("data-lang");
    var code = pre.querySelector("code") || pre;
    var text = code.textContent.replace(/^\n/, "").replace(/\s+$/, "");
    if (langs[lang]) code.innerHTML = langs[lang](text); else code.textContent = text;

    var box = document.createElement("div");
    box.className = "code" + (pre.hasAttribute("data-nolabel") ? " nolabel" : "");
    pre.parentNode.insertBefore(box, pre);
    if (!pre.hasAttribute("data-nolabel")) {
      var label = document.createElement("span");
      label.className = "label";
      label.textContent = pre.getAttribute("data-title") || lang;
      box.appendChild(label);
    }
    box.appendChild(pre);
    var btn = document.createElement("button");
    btn.className = "copy"; btn.type = "button"; btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
    box.appendChild(btn);
  });
})();
