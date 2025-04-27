const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('login-error');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const password = formData.get('password');

    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.text();

    if (data === 'Login successful') {
      window.location.href = '/dashboard'; // You can create this page next
    } else {
      loginError.style.display = 'block';
      loginError.innerText = data;
    }
  });
}
