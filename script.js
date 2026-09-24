function addItem() {
  const input = document.getElementById("itemInput");
  const text = input.value;

  if (text === "") {
    return;
  }

  const item = {
    text: text,
    completed: false,
    subitems: []
  };

  const items = JSON.parse(localStorage.getItem("items")) || [];

  items.push(item);

  localStorage.setItem("items", JSON.stringify(items));

  input.value = "";

  showItems();
}


function showItems() {
  const list = document.getElementById("list");

  list.innerHTML = "";

  const items = JSON.parse(localStorage.getItem("items")) || [];

  items.forEach(function(item, index) {

    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" ${item.completed ? "checked" : ""}>
      <span>${item.text}</span>
      <button class="subitem">+ Subitem</button>
      <button class="delete">Delete</button>
    `;

    if (item.completed) {
      li.classList.add("completed");
    }

    // Complete item
    li.querySelector("input").onclick = function() {
      items[index].completed = this.checked;

      localStorage.setItem("items", JSON.stringify(items));

      showItems();
    };

    // Delete item
    li.querySelector(".delete").onclick = function() {
      items.splice(index, 1);

      localStorage.setItem("items", JSON.stringify(items));

      showItems();
    };

    // Add subitem
    li.querySelector(".subitem").onclick = function() {

      const text = prompt("What is the subitem?");

      if (text === null || text === "") {
        return;
      }

      items[index].subitems.push({
        text: text,
        completed: false
      });

      localStorage.setItem("items", JSON.stringify(items));

      showItems();
    };

    // Show subitems
    const sublist = document.createElement("ul");

    item.subitems.forEach(function(subitem) {

      const subli = document.createElement("li");

      subli.textContent = subitem.text;

      sublist.appendChild(subli);
    });

    li.appendChild(sublist);

    list.appendChild(li);
  });
}


showItems();

