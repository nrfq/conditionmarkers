import blinded from "./images/blinded.svg";
import charmed from "./images/charmed.svg";
import deafened from "./images/deafened.svg";
import exhausted from "./images/exhausted.svg";
import frightened from "./images/frightened.svg";
import grappled from "./images/grappled.svg";
import incapacitated from "./images/incapacitated.svg";
import invisible from "./images/invisible.svg";
import paralyzed from "./images/paralyzed.svg";
import petrified from "./images/petrified.svg";
import poisoned from "./images/poisoned.svg";
import prone from "./images/prone.svg";
import restrained from "./images/restrained.svg";
import stunned from "./images/stunned.svg";
import unconscious from "./images/unconscious.svg";
import baned from "./images/baned.svg";
import blessed from "./images/blessed.svg";
import concentrating from "./images/concentrating.svg";
import dodge from "./images/dodge.svg";
import hastened from "./images/hastened.svg";
import hexed from "./images/hexed.svg";
import holding_action from "./images/holding_action.svg";
import hunters_mark from "./images/hunters_mark.svg";
import raging from "./images/raging.svg";
import reaction_used from "./images/reaction_used.svg";

/** Get the reverse domain name id for this plugin at a given path */
export function getImage(image: string) {
    switch (image.toLowerCase().replace(" ", "_").replace("'", "").replace("-", "")) {
        case "blinded":
            return blinded;
        case "charmed":
            return charmed;
        case "deafened":
            return deafened;
        case "frightened":
            return frightened; 
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
        case "restrained":
            return restrained;
        case "stunned":
            return stunned;
        case "unconscious":
            return unconscious;
        case "baned":
            return baned;
        case "blessed":
            return blessed;
        case "concentrating":
            return concentrating;
        case "dodge":
            return dodge;
        case "hastened":
            return hastened;
        case "hexed":
            return hexed;
        case "holding_action":
            return holding_action;
        case "hunters_mark":
            return hunters_mark;
        case "raging":
            return raging;
        case "reaction_used":
            return reaction_used;
        default:
            return blinded;
    }
  }
  