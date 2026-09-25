class ListApp {
  constructor(containerId, inputId) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    
    if (this.input) {
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.addList();
        }
      });
    }
  }

  addList() {
    const text = this.input.value.trim();
    if (!text) return;

    const list = new List(text);
    this.container.appendChild(list.element);
    this.input.value = "";
    this.input.focus();
  }
}

class List {
  constructor(title) {
    this.title = title;
    this.element = this.createElement();
  }

  createElement() {
    const list = document.createElement("div");
    list.className = "list";

    const header = document.createElement("div");
    header.className = "list-header";
    header.setAttribute("tabindex", "0");
    header.setAttribute("role", "button");
    header.addEventListener("click", () => this.toggle());
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggle();
      }
    });

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "▼";

    const title = document.createElement("span");
    title.textContent = this.title;

    header.append(arrow, title);

    const content = document.createElement("div");
    content.className = "list-content";

    content.appendChild(new Subitem("Example subitem").element);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+ Add subitem";
    addButton.addEventListener("click", () => this.addSubitem(content, addButton));

    content.appendChild(addButton);
    list.append(header, content);

    return list;
  }

  toggle() {
    const header = this.element.querySelector(".list-header");
    const content = header.nextElementSibling;
    const arrow = header.querySelector(".arrow");

    const isHidden = content.style.display === "none";
    content.style.display = isHidden ? "block" : "none";
    arrow.textContent = isHidden ? "▼" : "▶";
  }

  addSubitem(container, button) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "New subitem...";

    container.insertBefore(input, button);
    input.focus();

    const finish = (shouldSave) => {
      const text = input.value.trim();

      input.removeEventListener("keydown", handleKeydown);
      input.removeEventListener("blur", handleBlur);

      if (shouldSave && text) {
        container.insertBefore(new Subitem(text).element, input);
      }

      input.remove();
    };

    const handleKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    };

    const handleBlur = () => finish(false);

    input.addEventListener("keydown", handleKeydown);
    input.addEventListener("blur", handleBlur);
  }
}

class Subitem {
  constructor(text) {
    this.text = text;
    this.element = this.createElement();
  }

  createElement() {
    const subitem = document.createElement("div");
    subitem.className = "subitem";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      subitem.classList.toggle("completed", checkbox.checked);
    });

    const label = document.createElement("span");
    label.textContent = this.text;

    subitem.append(checkbox, label);
    return subitem;
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  new ListApp("lists", "listInput");
});
