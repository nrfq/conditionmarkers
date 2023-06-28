import blinded from "./images/blinded.svg";
import deafened from "./images/deafened.svg";
import exhausted from "./images/exhausted.svg";
import grappled from "./images/grappled.svg";
import incapacitated from "./images/incapacitated.svg";
import invisible from "./images/invisible.svg";
import paralyzed from "./images/paralyzed.svg";
import petrified from "./images/petrified.svg";
import poisoned from "./images/poisoned.svg";
import prone from "./images/prone.svg";

/** Get the reverse domain name id for this plugin at a given path */
export function getImage(image: string) {
    switch (image.toLowerCase()) {
        case "blinded":
            return blinded;
        case "charmed":
            return blinded; //TODO
        case "deafened":
            return deafened;
        case "frightened":
            return deafened; //TODO
        case "exhausted":
            return exhausted;
        case "grappled":
            return grappled;
        case "incapacitated":
            return incapacitated;
        case "invisible":
            return invisible;
        case "paralyzed":
            return paralyzed;
        case "petrified":
            return petrified;
        case "poisoned":
            return poisoned;
        case "prone":
            return prone;
        case "restrained": //TODO
            return prone;
        case "stunned": //TODO
            return prone;
        case "unconscious":
            return prone; //TODO
        default:
            return blinded;
    }
  }
  