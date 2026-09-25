function addList() {
  const input = document.getElementById("listInput");
  if (!input) {
    return;
  }

  const text = input.value.trim();
  if (!text) {
    return;
  }

  const list = document.createElement("div");
  list.className = "list";

  const header = document.createElement("div");
  header.className = "list-header";
  header.addEventListener("click", () => toggleList(header));
  header.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleList(header);
    }
  });
  header.setAttribute("tabindex", "0");
  header.setAttribute("role", "button");

  const arrow = document.createElement("span");
  arrow.className = "arrow";
  arrow.textContent = "▼";

  const title = document.createElement("span");
  title.textContent = text;

  header.append(arrow, title);

  const content = document.createElement("div");
  content.className = "list-content";

  const sampleSubitem = createSubitem("Example subitem");

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "+ Add subitem";
  addButton.addEventListener("click", () => addSubitem(addButton));

  content.append(sampleSubitem, addButton);
  list.append(header, content);

  const listsContainer = document.getElementById("lists");
  if (listsContainer) {
    listsContainer.appendChild(list);
  }

  input.value = "";
}

function toggleList(header) {
  const content = header.nextElementSibling;
  const arrow = header.querySelector(".arrow");

  if (!content || !arrow) {
    return;
  }

  const isHidden = content.style.display === "none";
  content.style.display = isHidden ? "block" : "none";
  arrow.textContent = isHidden ? "▼" : "▶";
}

function addSubitem(button) {
  const parent = button.parentElement;
  if (!parent) {
    return;
  }

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "New subitem...";

  parent.insertBefore(input, button);
  input.focus();

  const finish = (shouldSave) => {
    const text = input.value.trim();

    // Remove listeners before replacing/removing the input validly.
    input.removeEventListener("keydown", handleKeydown);
    input.removeEventListener("blur", handleBlur);

    if (shouldSave && text) {
      const subitem = createSubitem(text);
      input.replaceWith(subitem);
    } else {
      input.remove();
    }
  };

  const handleKeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    }
  };

  const handleBlur = () => {
    finish(false);
  };

  input.addEventListener("keydown", handleKeydown);
  input.addEventListener("blur", handleBlur);
}

function createSubitem(text) {
  const subitem = document.createElement("div");
  subitem.className = "subitem";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const label = document.createElement("span");
  label.textContent = text;

  checkbox.addEventListener("change", () => {
    subitem.classList.toggle("completed", checkbox.checked);
  });

  subitem.append(checkbox, label);

  return subitem;
}
