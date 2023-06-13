import { ToDo_list_dapp_backend } from "../../declarations/ToDo_list_dapp_backend";

let listItems = [];

const callingBackEnd = function (callingBE) {
  const elementesToChange = document.querySelectorAll(
    ".disable_when_calling_backend"
  );
  const motokoLogo = document.querySelector(".motoko_logo");
  const listNamesContainerHeight = document.querySelector(
    ".list_names_container"
  ).offsetHeight;
  const listItemsContainerHeight = document.querySelector(
    ".items_list_container"
  ).offsetHeight;
  const listNamesContainer = document.querySelector(".to_disable_lists_names");
  const listItemsContainer = document.querySelector(".to_disable_lists_items");
  if (callingBE) {
    elementesToChange.forEach((element) => {
      element.setAttribute("disabled", true);
    });
    motokoLogo.classList.add("motoko_loader");
    listNamesContainer.style.height = `${listNamesContainerHeight}px`;
    listNamesContainer.style.zIndex = 200;
    listItemsContainer.style.height = `${listItemsContainerHeight}px`;
    listItemsContainer.style.zIndex = 200;
  }
  if (!callingBE) {
    elementesToChange.forEach((element) => {
      element.removeAttribute("disabled");
    });
    motokoLogo.classList.remove("motoko_loader");
    listNamesContainer.style.height = `5px`;
    listNamesContainer.style.zIndex = -1;
    listItemsContainer.style.height = `1px`;
    listItemsContainer.style.zIndex = -1;
  }
};

const displayItemslistNames = async function () {
  callingBackEnd(true);
  const listNames = await ToDo_list_dapp_backend.getAllListNames();
  if (!listNames.ok) {
    callingBackEnd(false);
    return;
  }
  let listNamesHtml = "";
  listNames.ok.forEach((listName) => {
    listNamesHtml =
      listNamesHtml +
      ` <div class ="item_from_list"><input class="disable_when_calling_backend" type="checkbox"><span class="item"> ${listName} </span></div>`;
  });
  // document.querySelector(".item_list_name").setHTML(listNamesHtml);
  document.querySelector(".item_list_name").innerHTML = listNamesHtml;
  callingBackEnd(false);
};

const displayItemsList = async function (listName) {
  callingBackEnd(true);
  const listItemsGot = await ToDo_list_dapp_backend.getList(listName);
  if (!listItemsGot.ok) {
    callingBackEnd(false);
    return;
  }
  listItems = listItemsGot.ok;
  let listItemsHtml = "";
  listItems.forEach((listItem, index) => {
    listItemsHtml =
      listItemsHtml +
      ` <div class ="item_from_list detail_list" id = "item${index}"><input class="disable_when_calling_backend" type="checkbox"><span class="item"> ${listItem} </span></div>`;
  });
  // document.querySelector(".item_list").setHTML(listItemsHtml);
  document.querySelector(".item_list").innerHTML = listItemsHtml;
  callingBackEnd(false);
};

document.querySelector(".hamburger_icon").addEventListener("click", () => {
  document.querySelector(".list_names_container").classList.toggle("hidden");
  document.querySelector(".to_disable_lists_names").classList.toggle("hidden");
  document
    .querySelector(".items_list_container")
    .classList.toggle("list_names_container_visible");
  document
    .querySelector(".to_disable_lists_items")
    .classList.toggle("list_names_container_visible");
});

document
  .querySelector(".item_list_name")
  .addEventListener("click", async (e) => {
    await document.querySelector(".btn_save").click();
    const listNameExist = e.target;
    if (!listNameExist.classList.contains("item")) return;
    const listName = listNameExist.textContent;
    document.querySelector(".list_name").textContent = listName;
    displayItemsList(listName.trim());
    document.querySelector(".hamburger_icon").click();
  });

document.querySelector(".btn_add_list").addEventListener("click", async (e) => {
  callingBackEnd(true);
  const listToAdd = document.querySelector(".new_list_input");
  const listAdded = await ToDo_list_dapp_backend.addList(
    listToAdd.value.trim()
  );
  callingBackEnd(false);
  displayItemslistNames();
  listToAdd.value = "";
});

document.querySelector(".btn_add_item").addEventListener("click", async (e) => {
  const listNameLabel = document.querySelector(".list_name");
  if (listNameLabel.textContent.trim() === "") return;
  callingBackEnd(true);
  const itemToAdd = document.querySelector(".new_item_input");
  listItems.push(itemToAdd.value.trim());
  const listUpdated = await ToDo_list_dapp_backend.updateList(
    listNameLabel.textContent.trim(),
    listItems
  );
  callingBackEnd(false);
  displayItemsList(listNameLabel.textContent.trim());
  itemToAdd.value = "";
});

document.querySelector(".item_list").addEventListener("click", (e) => {
  console.log(e.target, e.target.previousElementSibling);
});

document.querySelector(".btn_save").addEventListener("click", async (e) => {
  const listNameLabel = document.querySelector(".list_name");
  if (listNameLabel.textContent.trim() === "") return;

  const allItems = document.querySelectorAll(".item_from_list.detail_list");
  callingBackEnd(true);
  listItems = [];
  allItems.forEach((ele) => {
    let toConserve = true;
    let item = "";
    ele.childNodes.forEach((eleChild) => {
      if (!eleChild.classList.contains("item") && eleChild.checked === true) {
        toConserve = false;
      } else {
        item = eleChild.textContent;
      }
    });
    if (toConserve) {
      listItems.push(item);
    }
  });
  const updateResult = await ToDo_list_dapp_backend.updateList(
    listNameLabel.textContent.trim(),
    listItems
  );
  callingBackEnd(false);
  displayItemsList(listNameLabel.textContent.trim());
});

displayItemslistNames();
