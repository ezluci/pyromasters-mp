import { toast } from "./toast/toast";

if (document.querySelector('#login-div')) {
  // is logged out
  const loginDiv = document.querySelector('#login-div') as HTMLDivElement;
  const loginUsernameElm = document.querySelector('#login-username') as HTMLInputElement;
  const loginPasswordElm = document.querySelector('#login-password') as HTMLInputElement;
  const loginButtonElm = document.querySelector('#login-button') as HTMLButtonElement;
  const gotoRegisterElm = document.querySelector('#goto-register') as HTMLAnchorElement;

  const registerDiv = document.querySelector('#register-div') as HTMLDivElement;
  const registerUsernameElm = document.querySelector('#register-username') as HTMLInputElement;
  const registerPasswordElm = document.querySelector('#register-password') as HTMLInputElement;
  const registerButtonElm = document.querySelector('#register-button') as HTMLButtonElement;
  const gotoLoginElm = document.querySelector('#goto-login') as HTMLAnchorElement;

  gotoLoginElm.addEventListener('click', switchToLoginDiv);
  gotoRegisterElm.addEventListener('click', switchToRegisterDiv);

  loginButtonElm.addEventListener('click', login);
  registerButtonElm.addEventListener('click', register);

  // press enter in inputs
  document.addEventListener('keydown', ev => {
    if (!(ev.target instanceof HTMLInputElement)) {
      return;
    }

    if (ev.key === 'Enter' && ev.target.dataset.enterTarget) {
      const targetId = ev.target.dataset.enterTarget;
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.click();
      }
    }
  });

  function switchToLoginDiv() {
    loginDiv.hidden = false;
    registerDiv.hidden = true;
  }

  function switchToRegisterDiv() {
    loginDiv.hidden = true;
    registerDiv.hidden = false;
  }

  async function login() {
    const body = `username=${encodeURIComponent(loginUsernameElm.value)}&password=${encodeURIComponent(loginPasswordElm.value)}`;
    postData('/api/login', body)
      .then(res => {
        if (!res || res.error) {
          toast.show(res.error, 'error');
        } else {
          toast.show('login successful', 'success');
          location.reload();
        }
      });
  }

  async function register() {
    const body = `username=${encodeURIComponent(registerUsernameElm.value)}&password=${encodeURIComponent(registerPasswordElm.value)}`;
    postData('/api/register', body)
      .then(res => {
        if (!res || res.error) {
          toast.show(res.error, 'error');
        } else {
          toast.show('registration successful. now login', 'success');
          switchToLoginDiv();
        }
      });
  }
} else {
  // is logged in
  const logoutElm = document.querySelector('#logout') as HTMLAnchorElement;

  logoutElm.addEventListener('click', logout);

  async function logout() {
    postData('/api/logout', '')
      .then(res => {
        if (!res || res.error) {
          toast.show(res.error, 'error');
        } else {
          toast.show('logout successful', 'success');
          location.reload();
        }
      });
  }
}

async function postData(url: string, body: string): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body,
    credentials: 'include'
  });

  const json = await res.json();
  return json;
}