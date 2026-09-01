let count = 0;

const countEl = document.querySelector('[data-testid="count"]');
const incrementBtn = document.querySelector('[data-testid="increment"]');
const resetBtn = document.querySelector('[data-testid="reset"]');

function render() {
  countEl.textContent = String(count);
}

incrementBtn.addEventListener('click', () => {
  count += 1;
  render();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  render();
});

render();
