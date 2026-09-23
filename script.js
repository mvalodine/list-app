function addItem() {
  const input = document.getElementById("itemInput");
  const text = input.value;

  if (text === "") {
    return;
  }

  const item = {
    text: text,
    completed: false
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
      <button class="delete">Delete</button>
    `;

    if (item.completed) {
      li.classList.add("completed");
    }

    li.querySelector("input").onclick = function() {
      items[index].completed = this.checked;

      localStorage.setItem("items", JSON.stringify(items));

      showItems();
    };

    li.querySelector(".delete").onclick = function() {
      items.splice(index, 1);

      localStorage.setItem("items", JSON.stringify(items));

      showItems();
    };

    list.appendChild(li);
  });
}


showItems();
