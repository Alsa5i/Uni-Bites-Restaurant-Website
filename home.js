(function () {
  function getStore(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function render() {
    var grid = document.querySelector(".cuisine-grid");
    if (!grid) return;
    var cuisines = getStore("unibite_cuisines", []);
    cuisines.forEach(function (c) {
      var a = document.createElement("a");
      a.className = "cuisine-card";
      a.href = "cuisines/cuisine.html?name=" + encodeURIComponent(c.name);
      a.innerHTML =
        '<div class="card-icon"><svg class="icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18a8 8 0 0 1-8 8 8 8 0 0 1-8-8z"/><path d="M9 7c0-1 .7-1.5 1.5-1.5S12 6 12 7"/><path d="M14 7c0-1 .7-1.5 1.5-1.5S17 6 17 7"/></svg></div>' +
        "<h3>" + c.name + "</h3>" +
        "<p>" + (c.desc || "Discover authentic flavors from this cuisine.") + "</p>";
      grid.appendChild(a);
    });
  }

  if (document.readyState !== "loading") render();
  else document.addEventListener("DOMContentLoaded", render);
})();
