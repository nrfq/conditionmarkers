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
  document.querySelectorAll(".selected-icon").forEach((element) => {
    element.classList.remove("visible");
  });
  // Get all the markers that are attached to our current selection
  for (const item of items) {
    const metadata = item.metadata[getPluginId("metadata")];
    if (
      isPlainObject(metadata) &&
      metadata.enabled &&
      isImage(item) &&
      item.attachedTo &&
      selection?.includes(item.attachedTo)
    ) {
      // Add selected state to this marker
      const condition = item.name.replace("Condition Marker - ", "");
      document.getElementById(`${condition}Select`)?.classList.add("visible");
    }
  }
}

/**
 * Helper to build a circle shape with the proper size to match
 * the input image's size
 */
export async function buildConditionMarker(
  name: String,
  attached: Image,
  scale: number,
  attachedCount: number,
) {

  const markerReturn = await getMarkerPosition(attached, attachedCount);

  const position = {
    x: markerReturn.x,
    y: markerReturn.y,
  };

  const rotation = markerReturn.rotation;
  
  const theImage = {
    width: markerReturn.size,
    height: markerReturn.size,
    mime: "image/jpg",
    url: `https://conditiontracker.onrender.com/images/${name.toLowerCase().replace(" ", "_").replace("'", "").replace("-", "")}.png`
  }
  const marker = buildImage(theImage, attached.grid)
    .scale({ x: scale, y: scale })
    .rotation(rotation)
    .position(position)
    .attachedTo(attached.id)
    .locked(true)
    .name(`Condition Marker - ${name}`)
    .metadata({ [getPluginId("metadata")]: { enabled: true } })
    .layer("ATTACHMENT")
    .disableHit(true)
    .visible(attached.visible)
    .build();

  return marker;
}

async function getMarkerPosition(item: Image, count: number) {
  const imgWidth = item.image.width;
  const imgHeight = item.image.height;

  let markersWide = 0;
  let markersTall = 0;
  let markerDimensionPos = 0;
  let markerDimensionSize = 0;
  const bounds = await OBR.scene.items.getItemBounds([item.id]);

  //Figure out the image's aspect ratio
  //Divide the image's aspect ratio in to a grid (w/ a minimum of 3 on the shortest side)
  if (imgHeight / imgWidth > 1) {
    const height = imgHeight / imgWidth;
    markersWide = 5;
    markersTall = Math.round(height * 5);
    markerDimensionPos = bounds.height / markersTall;
    markerDimensionSize = imgHeight / markersTall;
  }
  else {
    const width = imgWidth / imgHeight;
    markersWide = Math.round(width * 5);
    markersTall = 5;
    markerDimensionPos = bounds.width / markersWide;
    markerDimensionSize = imgWidth / markersWide;
  }

  const left = item.position.x;
  const top = item.position.y;

  let row = Math.floor(count / markersWide);
  let col = count % markersWide;
  
  let markerLeft = left + markerDimensionPos * col;
  let markerTop = top + markerDimensionPos * row;

  //Reposition item based on rotation
  if (item.rotation !== 0) {
    //TODO
  }

  return {
    x: markerLeft,
    y: markerTop,
    size: markerDimensionSize,
    rotation: item.rotation,
  }
}

/**
 * Helper to build a circle shape with the proper size to match
 * the input image's size
 */
export async function repositionConditionMarker(item: Image) {
  //Look through this item's attached markers and reposition them
  const conditionMarkers = await OBR.scene.items.getItems<Image>((item) => {
    const metadata = item.metadata[getPluginId("metadata")];
    return Boolean(isPlainObject(metadata) && metadata.enabled);
  });
  // Find all markers attached to this item
  const attachedMarkers = conditionMarkers.filter(
    (marker) => marker.attachedTo === item.id
  );

  const newMarkerInfo: { x: number; y: number, size: number }[] = [];
  for (let i = 0; i < attachedMarkers.length; i++) {
    newMarkerInfo.push(await getMarkerPosition(item, i));
  }

  // Reposition the markers based on their new array positions
  await OBR.scene.items.updateItems(attachedMarkers, (images) => {
    for (let i = 0; i < images.length; i++) {
      images[i].position.x = newMarkerInfo[i].x;
      images[i].position.y = newMarkerInfo[i].y;
    }
  });
}