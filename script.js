class Storage {
  static save(lists) {
    const data = lists.map(list => ({
      title: list.title,
      subitems: list.subitems.map(item => ({
        text: item.text,
        completed: item.completed
      }))
    }));
    localStorage.setItem("lists", JSON.stringify(data));
  }

  static load() {
    try {
      const raw = localStorage.getItem("lists");
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Could not load saved lists", error);
      return [];
    }
  }
}

class ListApp {
  constructor(containerId, inputId, buttonId) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.button = document.getElementById(buttonId);
    this.lists = [];

    if (!this.container || !this.input || !this.button) {
      console.error("App missing required DOM elements.");
      return;
    }

    this.button.addEventListener("click", () => this.addList());
    this.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.addList();
      }
    });

    document.__listApp = this;
    window.addList = () => this.addList();

    this.load();
  }

  addList() {
    const text = this.input.value.trim();
    if (!text) {
      return;
    }

    const list = new List(text, this);
    this.lists.push(list);
    this.container.appendChild(list.element);
    this.input.value = "";
    this.input.focus();
    this.save();
  }

  removeList(list) {
    this.lists = this.lists.filter(item => item !== list);
    this.save();
  }

  save() {
    Storage.save(this.lists);
  }

  load() {
    const saved = Storage.load();
    saved.forEach(item => {
      const list = new List(item.title, this);
      list.subitems = (item.subitems || []).map(sub => ({
        text: sub.text,
        completed: Boolean(sub.completed)
      }));
      list.renderSubitems();
      this.lists.push(list);
      this.container.appendChild(list.element);
    });
  }
}

class List {
  constructor(title, app) {
    this.title = title;
    this.app = app;
    this.subitems = [];
    this.element = this.createElement();
  }

  createElement() {
    const list = document.createElement("div");
    list.className = "list";

    const header = document.createElement("div");
    header.className = "list-header";
    header.setAttribute("tabindex", "0");
    header.setAttribute("role", "button");

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "▼";

    const title = document.createElement("span");
    title.className = "list-header-title";
    title.textContent = this.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-list-btn";
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      this.delete();
    });

    header.append(arrow, title, deleteBtn);
    header.addEventListener("click", () => this.toggle());
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.toggle();
      }
    });
    header.addEventListener("dblclick", () => this.editTitle(header, title));

    const content = document.createElement("div");
    content.className = "list-content";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "add-subitem-btn";
    addButton.textContent = "+ Add subitem";
    addButton.addEventListener("click", () => this.addSubitem());

    content.appendChild(addButton);

    list.append(header, content);
    this.header = header;
    this.content = content;
    this.addButton = addButton;
    this.titleEl = title;

    return list;
  }

  renderSubitems() {
    const existing = [...this.content.querySelectorAll(".subitem")];
    existing.forEach(node => node.remove());

    this.subitems.forEach(item => {
      const row = document.createElement("div");
      row.className = "subitem" + (item.completed ? " completed" : "");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.completed;
      checkbox.addEventListener("change", () => {
        item.completed = checkbox.checked;
        row.classList.toggle("completed", checkbox.checked);
        this.app.save();
      });

      const label = document.createElement("span");
      label.className = "subitem-text";
      label.textContent = item.text;
      label.addEventListener("dblclick", () => this.editSubitem(row, label, item));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-subitem-btn";
      deleteBtn.textContent = "×";
      deleteBtn.addEventListener("click", () => {
        this.subitems = this.subitems.filter(entry => entry !== item);
        this.app.save();
        this.renderSubitems();
      });

      row.append(checkbox, label, deleteBtn);
      this.content.insertBefore(row, this.addButton);
    });
  }

  toggle() {
    const isHidden = this.content.style.display === "none";
    this.content.style.display = isHidden ? "block" : "none";
    const arrow = this.header.querySelector(".arrow");
    arrow.textContent = isHidden ? "▼" : "▶";
  }

  addSubitem() {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "New subitem...";

    this.content.insertBefore(input, this.addButton);
    input.focus();

    const finish = (shouldSave) => {
      const value = input.value.trim();
      input.removeEventListener("keydown", handleKeydown);
      input.removeEventListener("blur", handleBlur);

      if (shouldSave && value) {
        this.subitems.push({ text: value, completed: false });
        this.app.save();
        this.renderSubitems();
      }

      input.remove();
    };

    const handleKeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    };

    const handleBlur = () => finish(false);

    input.addEventListener("keydown", handleKeydown);
    input.addEventListener("blur", handleBlur);
  }

  editTitle(header, titleNode) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = this.title;

    const finish = (shouldSave) => {
      const value = input.value.trim();
      if (shouldSave && value) {
        this.title = value;
        titleNode.textContent = value;
        this.app.save();
      }
      input.remove();
      titleNode.style.display = "inline";
    };

    titleNode.style.display = "none";
    header.insertBefore(input, header.lastElementChild);
    input.focus();
    input.select();

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    });

    input.addEventListener("blur", () => finish(false));
  }

  editSubitem(row, labelNode, item) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = item.text;

    const finish = (shouldSave) => {
      const value = input.value.trim();
      if (shouldSave && value) {
        item.text = value;
        labelNode.textContent = value;
        this.app.save();
      }
      input.remove();
      labelNode.style.display = "inline";
    };

    labelNode.style.display = "none";
    row.insertBefore(input, labelNode.nextSibling);
    input.focus();
    input.select();

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    });

    input.addEventListener("blur", () => finish(false));
  }

  delete() {
    this.element.remove();
    this.app.removeList(this);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new ListApp("lists", "listInput", "addListButton");
  document.__listApp = app;
  window.addList = () => app.addList();
});

if (typeof window !== "undefined") {
  window.addList = function () {
    if (document.__listApp) {
      document.__listApp.addList();
    }
  };
}
