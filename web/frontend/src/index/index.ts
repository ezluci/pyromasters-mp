import "../toast/toast.css";
import { toast } from "../toast/toast";
import "../topbar";

const roomInput = document.querySelector('#room') as HTMLInputElement;
const joinButton = document.querySelector('#join-button') as HTMLButtonElement;
const platformSelectElm = document.querySelector('#platform-select') as HTMLSelectElement;

joinButton.addEventListener('click', () => {
  const room = roomInput.value;
  let errorMsg = '';
  if (!room) {
    errorMsg = 'please put something ...';
  } else if (room.length > 15) {
    errorMsg = 'max 15 characters :(';
  } else if (! /^[ -~]{1,15}$/.test(room)) {
    errorMsg = 'please use printable ascii characters 🦆🦆';
  } else {
    document.location.href = `game${platformSelectElm.value==='mobile' ? 'mobile' : 'pc'}?room=${encodeURIComponent(room)}`;
  }

  if (errorMsg) {
    toast.show(errorMsg, 'error');
  }
});