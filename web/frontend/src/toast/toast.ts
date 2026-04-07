class Toast {
  container: HTMLElement;

  constructor() {
    let el = document.getElementById("toast-container");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-container";
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show(message: string, type: "success"|"error"|"info" = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => this.container.removeChild(toast), 300);
    }, duration);
  }
}

export const toast = new Toast();