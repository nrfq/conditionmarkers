import OBR, { Image } from "@owlbear-rodeo/sdk";
import { conditions } from "./conditions";
import { getPluginId } from "./getPluginId";
import { buildConditionMarker, isPlainObject, updateConditionButtons, repositionConditionMarker } from "./helpers";
import "./style.css";
import { getImage } from "./images";

let currentPage = 1;
let currentConditions = conditions.slice(0, 16);

/**
 * This file represents the HTML of the popover that is shown once
 * the condition marker context menu item is clicked.
 */
OBR.onReady(async () => {
  // Setup the document with the condition buttons
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="conditions">
      <div class="search-area">
        <input class="condition-filter" placeholder="Filter" type="search"></input>
      </div>
      <div class="lower-flex">
        <div class="page-left disabled">
          <img class="page-icon" src="${getImage("left")}"/>
        </div>
        <div class="conditions-area">
        </div>
        <div class="page-right">
          <img class="page-icon" src="${getImage("right")}"/>
        </div>
      </div>
    </div>
  `;

  loadConditions();
  
  // Attach input listeners
  const input = document.querySelector(".condition-filter");
  if (input) {
    input.addEventListener("input", (event: Event) => {
      if (event && event.target) {
        const target = event.target as HTMLTextAreaElement;
        filterConditions(target.value);
      }
    });
  }
  
  const pageLeft = document.querySelector(".page-left");
  const pageRight = document.querySelector(".page-right");
  if (pageLeft) {
    pageLeft.addEventListener("click", (event: Event) => {
      if (event && event.target) {
        const target = event.target as HTMLTextAreaElement
        if (!target.classList.contains("disabled") && currentPage > 1) {
          currentPage -= 1;
          showPage();
        }
      }
    });
  }
  if (pageRight) {
    pageRight.addEventListener("click", (event: Event) => {
      if (event && event.target) {
        const target = event.target as HTMLTextAreaElement
        console.log(target);
        if (!target.classList.contains("disabled") && currentPage < 4) {
          currentPage += 1;
          showPage();
        }
      }
    });
  }

  // Update the button states with the current selection
  const allItems = await OBR.scene.items.getItems();
  updateConditionButtons(allItems);

  // Add change listener for updating button states
  OBR.scene.items.onChange(updateConditionButtons);
});

async function loadConditions() {
  const conditionsArea = document.querySelector(".conditions-area");
  conditionsArea!.innerHTML = `
      ${currentConditions
        .map(
          (condition) =>
            `<button class="condition-button" id="${condition}">
              <div class="condition">
                <img src="${getImage(condition)}"/>
              </div>
              <div class="selected-icon" id="${condition}Select"></div>
              <div class="condition-name"><p>${condition}</p></div>
            </button>`
        )
        .join("")}
  `;
  
  // Attach click and hover listeners
  document.querySelectorAll<HTMLButtonElement>(".condition-button").forEach((button) => {
    button.addEventListener("click", () => {
      handleButtonClick(button);
    });

    button.addEventListener("mouseover", () => {
      const conditionName = button.querySelector<HTMLDivElement>(".condition-name");
      if (conditionName) {
        conditionName.style.visibility = "visible";
      }
    });

    button.addEventListener("mouseout", () => {
      const conditionName = button.querySelector<HTMLDivElement>(".condition-name");
      if (conditionName) {
        conditionName.style.visibility = "hidden";
      }
    });
  });

  const allItems = await OBR.scene.items.getItems();
  updateConditionButtons(allItems);
}

function showPage() {
  switch(currentPage) {
    case 1:
      disablePage("left");
      enablePage("right");
      currentConditions = conditions.slice(0, 16);
      break;
    case 2:
      enablePage("left");
      enablePage("right");
      currentConditions = conditions.slice(16, 32);
      break;
    case 3:
      enablePage("left");
      enablePage("right");
      currentConditions = conditions.slice(32, 48);
      break;
    case 4:
      enablePage("left");
      disablePage("right");
      currentConditions = conditions.slice(48, 64);
      break;
  }
  loadConditions();
}

function disablePage(page: string) {
  const pageLeft = document.querySelector(".page-left");
  const pageRight = document.querySelector(".page-right");

  if (page === "left" && pageLeft) {
    pageLeft.classList.add("disabled");
  }
  else if (page === "right" && pageRight) {
    pageRight.classList.add("disabled");
  }
}

function enablePage(page: string) {
  const pageLeft = document.querySelector(".page-left");
  const pageRight = document.querySelector(".page-right");
  
  if (page === "left" && pageLeft) {
    pageLeft.classList.remove("disabled");
  }
  else if (page === "right" && pageRight) {
    pageRight.classList.remove("disabled");
  }
}

async function filterConditions(filterString: string) {
  if (filterString.length === 0) {
    showPage();
    return;
  }
  else {
    disablePage("left");
    disablePage("right");
  }
  const conditionsElem = document.querySelector(".conditions-area");

  const conditionsToAdd = [];
  
  const selection = await OBR.player.getSelection();
  // Get all selected items
  const itemsSelected = await OBR.scene.items.getItems<Image>(selection);
  //Get all already made condition markers on the scene
  const conditionMarkers = await OBR.scene.items.getItems<Image>((item) => {
    const metadata = item.metadata[getPluginId("metadata")];
    return Boolean(isPlainObject(metadata) && metadata.enabled);
  });

  let attachedMarkers: any[] = [];
  //Check whether this condition should be selected
  for (const item of itemsSelected) {
    // Find all markers attached to this item
    attachedMarkers = conditionMarkers.filter((marker) => marker.attachedTo === item.id);
  }

  for (let i = 0; i < conditions.length; i++) {
    if (conditions[i].toLowerCase().replace("-", "").replace("'", "").includes(filterString.toLowerCase())) {
      const button = document.createElement("button");
      button.className = "condition-button";
      button.id = conditions[i];
      const conditionDiv = document.createElement("div");
      conditionDiv.className = "condition";
      const conditionImg = document.createElement("img");
      conditionImg.setAttribute("src", getImage(conditions[i]));
      const conditionNameDiv = document.createElement("div");
      conditionNameDiv.className = "condition-name";
      conditionNameDiv.innerHTML = `<p>${conditions[i]}</p>`;
      const selectedIcon = document.createElement("div");
      selectedIcon.className = "selected-icon";
      selectedIcon.id = `${conditions[i]}Select`;
      conditionDiv.appendChild(conditionImg);
      button.appendChild(conditionDiv);
      button.appendChild(conditionNameDiv);
      button.appendChild(selectedIcon);
      
      button.addEventListener("click", () => {
        handleButtonClick(button);
      });

      button.addEventListener("mouseover", () => {
        const conditionName = button.querySelector<HTMLDivElement>(".condition-name");
        if (conditionName) {
          conditionName.style.visibility = "visible";
        }
      });

      button.addEventListener("mouseout", () => {
        const conditionName = button.querySelector<HTMLDivElement>(".condition-name");
        if (conditionName) {
          conditionName.style.visibility = "hidden";
        }
      });
      
      const matchedMarkers = attachedMarkers.filter((marker) => marker.name.includes(conditions[i]));
      if (matchedMarkers.length !== 0) {
        selectedIcon.style.visibility = "visible";
      }

      conditionsToAdd.push(button);
    }
  }
  
  //Doing it this way prevents flickering
  const conditionsNow = document.querySelectorAll<HTMLButtonElement>(".condition-button");
  if (conditionsNow.length !== conditionsToAdd.length) {
    conditionsNow.forEach((button) => {
      conditionsElem?.removeChild(button);
    })
    conditionsToAdd.forEach((button) => {
      conditionsElem?.appendChild(button);
    })

    const allItems = await OBR.scene.items.getItems();
    updateConditionButtons(allItems);
  }
}

async function handleButtonClick(button: HTMLButtonElement) {
  // Get the condition and selection state
  const condition = button.id; //Deafened, Blinded, Restrained, etc
  let selected = false;
  const selectedButton = button.querySelector<HTMLDivElement>(".selected-icon");
  if (selectedButton) {
    if (selectedButton.classList.contains("visible")) {
      selected = true;
    }
  } 
  //Whether this button was already selected or not
  const selection = await OBR.player.getSelection();

  if (selection) { //Create a condition marker and attach to the item or remove already placed marker
    const markersToAdd: Image[] = [];
    const markersToDelete: string[] = [];
    const itemsWithChangedMarkers: Image[] = [];

    // Get all selected items
    const itemsSelected = await OBR.scene.items.getItems<Image>(selection);
    //Get all already made condition markers on the scene
    const conditionMarkers = await OBR.scene.items.getItems<Image>((item) => {
      const metadata = item.metadata[getPluginId("metadata")];
      return Boolean(isPlainObject(metadata) && metadata.enabled);
    });

    for (const item of itemsSelected) {
      // Find all markers attached to this item
      const attachedMarkers = conditionMarkers.filter((marker) => marker.attachedTo === item.id);

      // Find all markers of the selected name
      const matchedMarkers = attachedMarkers.filter((marker) => marker.name.includes(condition));

      // Delete the marker if it is selected, otherwise add a new marker
      if (selected) {
        markersToDelete.push(...matchedMarkers.map((marker) => marker.id));
        if (selectedButton) {
          selectedButton.style.visibility = "hidden";
          selectedButton.classList.remove("visible");
        }
        itemsWithChangedMarkers.push(item);
      } else {
        markersToAdd.push(await buildConditionMarker(condition, item, item.scale.x, attachedMarkers.length));
      }
    }
    
    if (markersToAdd.length > 0) {
      await OBR.scene.items.addItems(markersToAdd);
    }
    if (markersToDelete.length > 0) {
      await OBR.scene.items.deleteItems(markersToDelete);
    }

    // Reposition/shift other markers for items with deleted markers
    for (let i = 0; i < itemsWithChangedMarkers.length; i++) {
      repositionConditionMarker(itemsWithChangedMarkers[i]);
    }
  }
}