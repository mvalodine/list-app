function addItem() {
  const input = document.getElementById("itemInput");
  const text = input.value;

  if (text === "") {
    return;
  }

  const item = document.createElement("li");

  item.innerHTML = `
    <input type="checkbox">
    <span>${text}</span>
    <button class="delete">Delete</button>
  `;

  document.getElementById("list").appendChild(item);

  input.value = "";

  item.querySelector("input").onclick = function() {
    item.classList.toggle("completed");
  };

  item.querySelector(".delete").onclick = function() {
    item.remove();
  };
}
