(function () {
  var form = document.getElementById("form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var success = document.getElementById("formSuccess");
    if (success) success.style.display = "block";
    form.style.display = "none";

    setTimeout(function () {
      window.location.href = "index (3).html";
    }, 2500);
  });
})();
