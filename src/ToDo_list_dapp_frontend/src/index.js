import {
  ToDo_list_dapp_backend,
  canisterId,
  createActor,
} from "../../declarations/ToDo_list_dapp_backend";
import { AuthClient } from "@dfinity/auth-client";
let listItems = [];

const authClient = await AuthClient.create();

const constructActor = async function () {
  const identity = await authClient.getIdentity();
  const toDoListCollectionActor = createActor(canisterId, {
    agentOptions: {
      identity,
    },
  });
  return toDoListCollectionActor;
};

const changeLogStatus = async function (isLoggued) {
  document.querySelector(".btn_login").textContent = isLoggued
    ? "Logout"
    : "IC Login";
};

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
  const listToDoActor = await constructActor();
  const listNames = await listToDoActor.getAllListNames();
  if (!listNames.ok) {
    document.querySelector(".item_list_name").innerHTML = "";
    callingBackEnd(false);
    return;
  }
  let listNamesHtml = "";
  listNames.ok.forEach((listName) => {
    listNamesHtml =
      listNamesHtml +
      ` <div class ="item_from_list list_name_item"><input class="disable_when_calling_backend" type="checkbox"><span class="item"> ${listName} </span></div>`;
  });
  // document.querySelector(".item_list_name").setHTML(listNamesHtml);
  document.querySelector(".item_list_name").innerHTML = listNamesHtml;
  callingBackEnd(false);
};

const displayItemsList = async function (listName) {
  callingBackEnd(true);
  const listToDoActor = await constructActor();
  const listItemsGot = await listToDoActor.getList(listName);
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
    // await document.querySelector(".btn_save").click();
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
  const listToDoActor = await constructActor();
  const listAdded = await listToDoActor.addList(listToAdd.value.trim());
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
  const listToDoActor = await constructActor();
  const listUpdated = await listToDoActor.updateList(
    listNameLabel.textContent.trim(),
    listItems
  );
  callingBackEnd(false);
  displayItemsList(listNameLabel.textContent.trim());
  itemToAdd.value = "";
});

document
  .querySelector(".btn_save_list")
  .addEventListener("click", async (e) => {
    const allListNames = document.querySelectorAll(
      ".item_from_list.list_name_item"
    );
    if (allListNames.length === 0) return;
    callingBackEnd(true);

    let listToDelete = [];
    allListNames.forEach(async (ele) => {
      let toDelete = false;
      let item = "";

      ele.childNodes.forEach((eleChild) => {
        if (!eleChild.classList.contains("item") && eleChild.checked === true) {
          toDelete = true;
        } else {
          item = eleChild.textContent;
        }
      });
      if (toDelete) {
        listToDelete.push(item.trim());
      }
    });

    const listToDoActor = await constructActor();
    // console.log(listToDelete);
    const deletedResult = await listToDoActor.deleteGroupOfLists(listToDelete);

    clearData();
    callingBackEnd(false);
    displayItemslistNames();
  });

const deleteList = async function (allListNames) {};

document.querySelector(".btn_save").addEventListener("click", async (e) => {
  const listNameLabel = document.querySelector(".list_name");
  if (listNameLabel.textContent.trim() === "") return;

  const allItems = document.querySelectorAll(".item_from_list.detail_list");
  if (allItems.length === 0) return;
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
  const listToDoActor = await constructActor();
  const updateResult = await listToDoActor.updateList(
    listNameLabel.textContent.trim(),
    listItems
  );
  callingBackEnd(false);
  displayItemsList(listNameLabel.textContent.trim());
});

const clearData = function () {
  displayItemslistNames();
  document.querySelector(".item_list").innerHTML = "";
  document.querySelector(".list_name").textContent = "";
};

document.querySelector(".btn_login").addEventListener("click", async (e) => {
  if (await authClient.isAuthenticated()) {
    await authClient.logout();
    changeLogStatus(false);
    clearData();
  } else {
    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        changeLogStatus(true);
        clearData();
      },
    });
  }
});

displayItemslistNames();
changeLogStatus(await authClient.isAuthenticated());
