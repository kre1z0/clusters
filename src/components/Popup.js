import {
  popupTemplate,
  popupFooterTemplate,
} from "../templates/popup-template";
import styles from "../styles.css";
import mustache from "mustache";
import { removeFadeOut } from '../utils/node';

class Popup {
  constructor({
    container,
    props = {},
    animationContent = false,
    closePopupCallback,
    onChangeCard,
  }) {
    this.props = props;
    this.container = container;
    this.animationContent = animationContent;
    this.popup = null;
    this.closePopup = this.closePopup.bind(this);
    this.closePopupCallback = closePopupCallback;
    this.onChangeCard = onChangeCard;
    this.renderPopup();
  }

  closePopup() {
    removeFadeOut(this.popup, 400);
    this.closePopupCallback();
  }

  renderPopup() {
    const popup = mustache.render(popupTemplate, this.props);
    const footer = mustache.render(popupFooterTemplate, this.props);
    const node = document.createElement("div");

    if (this.props.amount > 1) {
      node.innerHTML = popup + footer;
      this.prevBtn = node.querySelector(`.${styles.prev}`);
      this.nextBtn = node.querySelector(`.${styles.next}`);
      this.prevBtn.addEventListener("click", () => this.onChangeCard(-1));
      this.nextBtn.addEventListener("click", () => this.onChangeCard(1));
    } else {
      node.innerHTML = popup;
    }

    node.classList.add(styles.popup);

    if (this.animationContent) {
      node.querySelector(":first-child").classList.add(styles.fadeIn);
    } else {
      node.classList.add(styles.fadeIn);
    }

    const closeBtn = document.createElement("div");

    closeBtn.classList.add(styles.closeBtn);
    closeBtn.innerHTML = "&#10005;";
    closeBtn.addEventListener("click", this.closePopup);
    node.appendChild(closeBtn);
    this.container.appendChild(node);
    this.popup = node;
  }
}

export default Popup;
