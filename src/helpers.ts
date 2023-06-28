import OBR, { Item, buildImage, isImage } from "@owlbear-rodeo/sdk";
import type { Image } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

export function isPlainObject(
  item: unknown
): item is Record<keyof any, unknown> {
  return (
    item !== null && typeof item === "object" && item.constructor === Object
  );
}

/** Update the selected state of the condition buttons */
export async function updateConditionButtons(items: Item[]) {
  const selection = await OBR.player.getSelection();
  // Remove all previous selected states
  document.querySelectorAll(".condition-button").forEach((element) => {
    element.classList.remove("selected");
  });
  // Get all the status rings that are attached to our current selection
  for (const item of items) {
    const metadata = item.metadata[getPluginId("metadata")];
    if (
      isPlainObject(metadata) &&
      metadata.enabled &&
      isImage(item) &&
      item.attachedTo &&
      selection?.includes(item.attachedTo)
    ) {
      // Add selected state to this rings color
      const condition = item.name.replace("Condition Tracker - ", "");
      document.getElementById(condition)?.classList.add("selected");
    }
  }
}

/**
 * Helper to build a circle shape with the proper size to match
 * the input image's size
 */
export function buildConditionTracker(
  name: String,
  attached: Image,
  scale: number
) {
  const imgWidth = attached.image.width;
  const imgHeight = attached.image.height;
  const offsetX = (attached.grid.offset.x / attached.image.width) * imgWidth;
  const offsetY = (attached.grid.offset.y / attached.image.height) * imgHeight;
  const position = {
    x: attached.position.x - offsetX + imgWidth / 2,
    y: attached.position.y - offsetY + imgHeight / 2,
  };
  //TODO get the real image url
  const theImage = {
    width: 150,
    height: 150,
    mime: "image/jpg",
    url: `https://conditiontracker.onrender.com/images/${name.toLowerCase()}.png`
  }
  const tracker = buildImage(theImage, attached.grid)
    .scale({ x: scale, y: scale })
    .position(position)
    .attachedTo(attached.id)
    .locked(true)
    .name(`Condition Tracker - ${name}`)
    .metadata({ [getPluginId("metadata")]: { enabled: true } })
    .layer("ATTACHMENT")
    .disableHit(true)
    .visible(attached.visible)
    .build();

  return tracker;
}
