import OBR, { Image } from "@owlbear-rodeo/sdk";
import { conditions } from "./conditions";
import { getPluginId } from "./getPluginId";
import { buildConditionMarker, isPlainObject, updateConditionButtons, repositionConditionMarker } from "./helpers";
import "./style.css";
import { getImage } from "./images";

/**
 * This file represents the HTML of the popover that is shown once
 * the condition marker context menu item is clicked.
 */

OBR.onReady(async () => {
  // Setup the document with the condition buttons
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="conditions">
      ${conditions
        .map(
          (condition) =>
            `
            <button class="condition-button" id="${condition}">
              <div class="condition">
                <img src="${getImage(condition)}"/>
              </div>
              <div class="condition-name">${condition}</div>
              <div class="selected-icon" id="${condition}Select">
              </div>
            </button>
            `
        )
        .join("")}
    </div>
  `;

  // Attach click listeners
  document.querySelectorAll<HTMLButtonElement>(".condition-button").forEach((button) => {
    button.addEventListener("click", () => {
      handleButtonClick(button);
    });

    button.addEventListener("mouseover", () => {
      const conditionName = button.querySelector<HTMLDivElement>(".condition-name");
      if (conditionName) {
        if (conditionName.innerHTML === "Incapacitated") {
          conditionName.style.fontSize = "7px";
        }
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

  // Update the button states with the current selection
  const allItems = await OBR.scene.items.getItems();
  updateConditionButtons(allItems);

  // Add change listener for updating button states
  OBR.scene.items.onChange(updateConditionButtons);
});

async function handleButtonClick(button: HTMLButtonElement) {
  // Get the condition and selection state
  const condition = button.id; //Deafened, Blinded, Restrained, etc
  let selected = false;
  const selectedButton = button.querySelector<HTMLDivElement>(".selected-icon");
  if (selectedButton) {
    if (selectedButton.classList.contains("visible")) {
      selected = true;
    }
  } //Whether this button was already selected or not
  const selection = await OBR.player.getSelection();

  if (selection) {
    //Create a condition marker and attach to the item
    // Get all selected items
    const itemsSelected = await OBR.scene.items.getItems<Image>(selection);
    const markersToAdd: Image[] = [];
    const markersToDelete: string[] = [];
    const itemsWithChangedMarkers: Image[] = [];
    //Get all already made condition markers on the scene
    const conditionMarkers = await OBR.scene.items.getItems<Image>((item) => {
      const metadata = item.metadata[getPluginId("metadata")];
      return Boolean(isPlainObject(metadata) && metadata.enabled);
    });

    for (const item of itemsSelected) {
      // Find all markers attached to this item
      const attachedMarkers = conditionMarkers.filter(
        (marker) => marker.attachedTo === item.id
      );

      // Find all markers of the selected name
      const matchedMarkers = attachedMarkers.filter(
        (marker) => marker.name.includes(condition)
      );

      // Delete the marker if it is selected else add a new marker
      if (selected) {
        markersToDelete.push(...matchedMarkers.map((marker) => marker.id));
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

    for (let i = 0; i < itemsWithChangedMarkers.length; i++) {
      repositionConditionMarker(itemsWithChangedMarkers[i]);
    }
  }
}