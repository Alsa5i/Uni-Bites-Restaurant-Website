(function () {
  function getStore(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function fmt(n) {
    return "UGX " + Number(n || 0).toLocaleString("en-US");
  }

  var params = new URLSearchParams(window.location.search);
  var name = params.get("name") || "";

  var cuisines = getStore("unibite_cuisines", []);
  var match = cuisines.find(function (c) {
    return c.name === name;
  });

  document.getElementById("cuisineTitle").textContent = name || "Cuisine";
  if (match && match.desc) {
    document.getElementById("cuisineDesc").textContent = match.desc;
  }

  var dishes = getStore("unibite_dishes", []).filter(function (d) {
    return d.cuisine === name;
  });
  var el = document.getElementById("cuisineDishes");

  if (!dishes.length) {
    el.innerHTML = "<p>No dishes added for this cuisine yet.</p>";
    return;
  }

  el.innerHTML = dishes
    .map(function (d) {
      return (
        '<a class="product-card suggest-card" href="../index (3).html#categories">' +
        '<img src="' + (d.img || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=60") + '" alt="' + d.name + '">' +
        '<div class="product-info"><h3>' + d.name + "</h3>" +
        '<p class="product-desc">' + (d.cuisine || "") + (d.desc ? " · " + d.desc : "") + "</p>" +
        '<div class="product-bottom"><span class="product-price">' + fmt(d.price) + " →</span></div></div></a>"
      );
    })
    .join("");
})();
