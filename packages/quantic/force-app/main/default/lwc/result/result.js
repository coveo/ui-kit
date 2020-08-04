// @ts-check
import { LightningElement, api } from "lwc";

export default class Result extends LightningElement {
  /** @type {import("coveo").Result} */
  @api result;

  get icon() {
    if (this.objectType()) {
      return this.objectType();
    }
    if (this.fileType()) {
      return this.fileType();
    }

    return "doctype:unknown";
  }

  objectType() {
    const objType = this.result.raw.objecttype;
    if (!objType) {
      return undefined;
    }
    switch (objType.toLowerCase()) {
      case "faq":
        return "standard:question_feed";
      case "message":
        return "standard:note";
      case "city":
        return "standard:household";
      default:
        return `standard:${objType.toLowerCase()}`;
    }
  }

  fileType() {
    const fileType = this.result.raw.filetype;
    if (!fileType) {
      return undefined;
    }

    const lower = fileType.toLowerCase();
    if (lower.indexOf("youtube") !== -1) {
      return "doctype:video";
    }
    if (lower.indexOf("doc")) {
      return "doctype:gdoc";
    }
    if (lower.indexOf("xls")) {
      return "doctype:excel";
    }
    return `dcotype:${lower}`;
  }
}
