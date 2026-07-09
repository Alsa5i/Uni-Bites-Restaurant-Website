(function () {
  var USERS_KEY = "unibite_users";
  var AUTH_KEY = "unibite_auth";
  var ADMIN = { user: "admin", pass: "1234" };

  function qs(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    var el = qs("authError");
    if (el) {
      el.textContent = msg;
      el.style.display = "block";
    }
  }

  function hideMessages() {
    if (qs("authError")) qs("authError").style.display = "none";
    if (qs("authSuccess")) qs("authSuccess").style.display = "none";
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = (h * 33) ^ str.charCodeAt(i);
    }
    return (h >>> 0).toString(16);
  }

  function storeAuth(user) {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ name: user.name, email: user.email, role: user.role || "user" })
    );
  }

  function getAuth() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch (e) {
      return null;
    }
  }

  function redirectAfterLogin(user) {
    storeAuth(user);
    var success = qs("authSuccess");
    if (success) {
      success.textContent = "Welcome, " + (user.name || "user") + "! Redirecting...";
      success.style.display = "block";
    }
    var target = user.role === "admin" ? "admin.html" : "profile.html";
    setTimeout(function () {
      window.location.href = target;
    }, 800);
  }

  function initLogin() {
    var form = qs("loginForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideMessages();
      var email = qs("email").value.trim();
      var password = qs("password").value;
      if (!email || !password) {
        showError("Please enter your email and password.");
        return;
      }

      if (email.toLowerCase() === ADMIN.user && password === ADMIN.pass) {
        redirectAfterLogin({ name: "Admin", email: ADMIN.user, role: "admin" });
        return;
      }

      var users = getUsers();
      var user = users.find(function (u) {
        return u.email === email.toLowerCase();
      });
      if (!user || user.password !== hash(password)) {
        showError("Invalid email or password.");
        return;
      }
      redirectAfterLogin({ name: user.name, email: user.email, role: "user" });
    });
  }

  function initSignin() {
    var form = qs("signinForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideMessages();
      var name = qs("name").value.trim();
      var email = qs("email").value.trim().toLowerCase();
      var password = qs("password").value;
      var confirm = qs("confirm").value;

      if (!name || !email || !password || !confirm) {
        showError("Please fill in all fields.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        showError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirm) {
        showError("Passwords do not match.");
        return;
      }

      var users = getUsers();
      if (
        users.some(function (u) {
          return u.email === email;
        })
      ) {
        showError("An account with this email already exists.");
        return;
      }

      var user = { name: name, email: email, password: hash(password), role: "user" };
      users.push(user);
      saveUsers(users);

      var success = qs("authSuccess");
      if (success) {
        success.textContent = "Account created! Logging you in...";
        success.style.display = "block";
      }
      setTimeout(function () {
        redirectAfterLogin(user);
      }, 600);
    });
  }

  window.Auth = { initLogin: initLogin, initSignin: initSignin, getAuth: getAuth };
})();
