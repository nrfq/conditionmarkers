import OBR, { Image } from "@owlbear-rodeo/sdk";
import { conditions } from "./conditions";
import { getPluginId } from "./getPluginId";
import { buildConditionTracker, isPlainObject, updateConditionButtons } from "./helpers";
import "./style.css";
import { getImage } from "./images";

/**
 * This file represents the HTML of the popover that is shown once
 * the status ring context menu item is clicked.
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
              <div class="selectedIcon" id="${condition}Select">
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
  const selectedButton = button.querySelector<HTMLDivElement>(".selectedIcon");
  if (selectedButton) {
    if (selectedButton.classList.contains("visible")) {
      selected = true;
    }
  } //Whether this button was already selected or not
  const selection = await OBR.player.getSelection();

  if (selection) {
    //Create a condition tracker and attach to the item
    // Get all selected items
    const itemsSelected = await OBR.scene.items.getItems<Image>(selection);
    // Get the grid dpi so we can scale the rings
    const trackersToAdd: Image[] = [];
    const trackersToDelete: string[] = [];
    //Get all already made condition trackers on the scene
    const conditionTrackers = await OBR.scene.items.getItems<Image>((item) => {
      const metadata = item.metadata[getPluginId("metadata")];
      return Boolean(isPlainObject(metadata) && metadata.enabled);
    });

    for (const item of itemsSelected) {
      // Find all rings attached to this item
      const attachedTrackers = conditionTrackers.filter(
        (tracker) => tracker.attachedTo === item.id
      );

      // Find all trackers of the selected name
      const matchedTrackers = attachedTrackers.filter(
        (tracker) => tracker.name.includes(condition)
      );

      // Delete the tracker if it is selected else add a new ring
      if (selected) {
        trackersToDelete.push(...matchedTrackers.map((tracker) => tracker.id));
      } else {
        trackersToAdd.push(buildConditionTracker(condition, item, item.scale.x));
      }
    }
    
    if (trackersToAdd.length > 0) {
      await OBR.scene.items.addItems(trackersToAdd);
    }
    if (trackersToDelete.length > 0) {
      await OBR.scene.items.deleteItems(trackersToDelete);
    }
  }
}