(function () {
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getAuth() {
    try {
      return JSON.parse(localStorage.getItem("unibite_auth"));
    } catch (e) {
      return null;
    }
  }

  function applyAuth() {
    var auth = getAuth();
    var loginBtn = document.querySelector('a[href="login.html"], a[href="../login.html"]');
    var signinBtn = document.querySelector('a[href="signin.html"], a[href="../signin.html"]');
    if (!loginBtn || !signinBtn) return;

    if (!auth) return;

    var parent = loginBtn.parentNode;
    loginBtn.remove();
    signinBtn.remove();

    var wrap = document.createElement("div");
    wrap.className = "nav-user";
    var first = (auth.name || auth.email || "User").charAt(0).toUpperCase();
    wrap.innerHTML =
      '<div class="nav-avatar">' + escapeHtml(first) + "</div>" +
      '<span class="nav-hello">' + escapeHtml(auth.name || auth.email) + "</span>" +
      '<button class="nav-btn" id="navLogout" type="button">Log Out</button>';
    parent.appendChild(wrap);

    document.getElementById("navLogout").addEventListener("click", function () {
      localStorage.removeItem("unibite_auth");
      try {
        navigator.sendBeacon("/api/logout");
      } catch (e) {}
      window.location.href = "index (3).html";
    });
  }

  document.addEventListener("DOMContentLoaded", applyAuth);
})();
