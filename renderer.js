// The renderer: ordinary browser JavaScript for the page. It can't use Node.js; it talks to
// the main process only through window.desktop, which preload.js provides.
const clock = document.getElementById('clock');
const dateLine = document.getElementById('date');
const form = document.getElementById('reminderForm');
const textInput = document.getElementById('text');
const minutesInput = document.getElementById('minutes');
const message = document.getElementById('message');
const list = document.getElementById('list');

function tick() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  dateLine.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
tick();
setInterval(tick, 1000);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = textInput.value.trim() || 'Time is up!';
  const result = await window.desktop.remind(minutesInput.value, text);
  if (!result.ok) {
    message.textContent = result.error;
    return;
  }
  const at = new Date(result.due).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  message.textContent = `Okay! I'll remind you at ${at}.`;
  const li = document.createElement('li');
  li.textContent = `${at}: ${text}`;
  list.append(li);
  textInput.value = '';
});

window.desktop.onReminderDone((text) => {
  message.textContent = `🔔 ${text}`;
  const item = [...list.children].find((li) => li.textContent.endsWith(`: ${text}`) && !li.classList.contains('done'));
  if (item) item.classList.add('done');
});

const v = window.desktop.versions;
document.getElementById('versions').textContent = `Electron ${v.electron} · Chromium ${v.chrome} · Node ${v.node}`;
