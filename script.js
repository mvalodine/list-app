function addList() {

  const input = document.getElementById("listInput");
  const text = input.value.trim();

  if (text === "") {
    return;
  }

  const list = document.createElement("div");
  list.className = "list";

  list.innerHTML = `
    <div class="list-header" onclick="toggleList(this)">
      <span class="arrow">▼</span>
      <span>${text}</span>
    </div>

    <div class="list-content">
      <div class="subitem">
        <input type="checkbox">
        <span>Example subitem</span>
      </div>

      <button onclick="addSubitem(this)">
        + Add subitem
      </button>
    </div>
  `;

  document.getElementById("lists").appendChild(list);

  input.value = "";
}


function toggleList(header) {

  const content = header.nextElementSibling;
  const arrow = header.querySelector(".arrow");

  if (content.style.display === "none") {
    content.style.display = "block";
    arrow.textContent = "▼";
  } else {
    content.style.display = "none";
    arrow.textContent = "▶";
  }
}


function addSubitem(button) {

  const input = document.createElement("input");

  input.type = "text";
  input.placeholder = "New subitem...";
  input.className = "subitem-input";

  button.parentElement.insertBefore(input, button);

  input.focus();

  input.addEventListener("keydown", function(event) {

    if (event.key !== "Enter") {
      return;
    }

    const text = input.value.trim();

    if (text === "") {
      return;
    }

    const subitem = document.createElement("div");

    subitem.className = "subitem";

    subitem.innerHTML = `
      <input type="checkbox">
      <span>${text}</span>
    `;

    input.replaceWith(subitem);

  });
}
