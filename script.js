class Storage {
  static save(lists) {
    const data = lists.map(list => ({
      title: list.title,
      subitems: list.subitems
    }));
    localStorage.setItem("lists", JSON.stringify(data));
  }

  static load() {
    const data = localStorage.getItem("lists");
    return data ? JSON.parse(data) : [];
  }
}

class ListApp {
  constructor(containerId, inputId, buttonId) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.button = document.getElementById(buttonId);
    this.lists = [];

    if (this.input) {
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.addList();
        }
      });
    }

    if (this.button) {
      this.button.addEventListener("click", () => this.addList());
    }

    this.loadLists();
  }

  addList() {
    if (!this.container || !this.input) return;

    const text = this.input.value.trim();
    if (!text) return;

    const list = new List(text, (lists) => this.updateStorage(lists));
    this.lists.push(list);
    this.container.appendChild(list.element);
    this.input.value = "";
    this.input.focus();
    this.updateStorage(this.lists);
  }

  loadLists() {
    const saved = Storage.load();
    saved.forEach(data => {
      const list = new List(data.title, (lists) => this.updateStorage(lists));
      list.subitems = data.subitems || [];
      list.renderSubitems();
      this.lists.push(list);
      this.container.appendChild(list.element);
    });
  }

  updateStorage(lists) {
    this.lists = lists;
    Storage.save(lists);
  }
}

class List {
  constructor(title, onUpdate) {
    this.title = title;
    this.subitems = [];
    this.onUpdate = onUpdate;
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
    header.addEventListener("dblclick", () => this.editTitle(header));

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "▼";

    const title = document.createElement("span");
    title.className = "list-title";
    title.textContent = this.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-list-btn";
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.delete();
    });

    header.append(arrow, title, deleteBtn);

    this.content = document.createElement("div");
    this.content.className = "list-content";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+ Add subitem";
    addButton.addEventListener("click", () => this.addSubitem(addButton));

    this.content.appendChild(addButton);
    this.addButton = addButton;

    list.append(header, this.content);
    this.listElement = list;

    return list;
  }

  renderSubitems() {
    this.subitems.forEach(text => {
      const subitem = new Subitem(text, (updatedText) => this.updateSubitem(text, updatedText), () => this.deleteSubitem(text));
      this.content.insertBefore(subitem.element, this.addButton);
    });
  }

  toggle() {
    const isHidden = this.content.style.display === "none";
    this.content.style.display = isHidden ? "block" : "none";

    const header = this.listElement.querySelector(".list-header");
    const arrow = header.querySelector(".arrow");
    arrow.textContent = isHidden ? "▼" : "▶";
  }

  editTitle(header) {
    const titleSpan = header.querySelector(".list-title");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = this.title;

    const finish = (shouldSave) => {
      const newTitle = input.value.trim();
      if (shouldSave && newTitle) {
        this.title = newTitle;
        titleSpan.textContent = newTitle;
        this.onUpdate(this.getAllLists());
      } else {
        titleSpan.textContent = this.title;
      }
      titleSpan.style.display = "inline";
      input.remove();
    };

    titleSpan.style.display = "none";
    header.insertBefore(input, header.querySelector(".delete-list-btn"));
    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    });

    input.addEventListener("blur", () => finish(false));
  }

  addSubitem(button) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "new-subitem-input";
    input.placeholder = "New subitem...";

    this.content.insertBefore(input, button);
    input.focus();

    const finish = (shouldSave) => {
      const text = input.value.trim();

      input.removeEventListener("keydown", handleKeydown);
      input.removeEventListener("blur", handleBlur);

      if (shouldSave && text) {
        this.subitems.push(text);
        const subitem = new Subitem(text, (updatedText) => this.updateSubitem(text, updatedText), () => this.deleteSubitem(text));
        this.content.insertBefore(subitem.element, input);
        this.onUpdate(this.getAllLists());
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

  updateSubitem(oldText, newText) {
    const index = this.subitems.indexOf(oldText);
    if (index !== -1) {
      this.subitems[index] = newText;
      this.onUpdate(this.getAllLists());
    }
  }

  deleteSubitem(text) {
    this.subitems = this.subitems.filter(item => item !== text);
    this.onUpdate(this.getAllLists());
    this.renderContent();
  }

  renderContent() {
    while (this.content.firstChild !== this.addButton) {
      this.content.removeChild(this.content.firstChild);
    }
    this.renderSubitems();
  }

  delete() {
    this.listElement.remove();
    this.onUpdate(this.getAllLists());
  }

  getAllLists() {
    const parent = this.listElement.parentElement;
    const lists = [];
    parent.querySelectorAll(".list").forEach(el => {
      const titleSpan = el.querySelector(".list-title");
      if (titleSpan) {
        const title = titleSpan.textContent;
        const subitems = [];
        el.querySelectorAll(".subitem span.subitem-text").forEach(span => {
          subitems.push(span.textContent);
        });
        lists.push({ title, subitems });
      }
    });
    return lists;
  }
}

class Subitem {
  constructor(text, onEdit, onDelete) {
    this.text = text;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.isCompleted = false;
    this.element = this.createElement();
  }

  createElement() {
    const subitem = document.createElement("div");
    subitem.className = "subitem";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      this.isCompleted = checkbox.checked;
      subitem.classList.toggle("completed", checkbox.checked);
    });

    const label = document.createElement("span");
    label.className = "subitem-text";
    label.textContent = this.text;
    label.addEventListener("dblclick", () => this.edit(subitem, label));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => {
      subitem.remove();
      this.onDelete();
    });

    subitem.append(checkbox, label, deleteBtn);
    return subitem;
  }

  edit(subitem, label) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = this.text;

    const finish = (shouldSave) => {
      const newText = input.value.trim();
      if (shouldSave && newText) {
        this.text = newText;
        label.textContent = newText;
        this.onEdit(newText);
      } else {
        label.textContent = this.text;
      }
      label.style.display = "inline";
      input.remove();
    };

    label.style.display = "none";
    subitem.insertBefore(input, label.nextSibling);
    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    });

    input.addEventListener("blur", () => finish(false));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ListApp("lists", "listInput", "addListButton");
});
