// === Menu Toggle Script ===
// Works for all screen sizes. Handles open/close animation, accessibility, and outside click.

(function(){
  const btn = document.querySelector('.menu-toggle');
  const panel = document.getElementById('menu-panel');

  if(!btn || !panel) return;

  function openPanel(){
  panel.hidden = false;                // make it present for a11y/transition
  requestAnimationFrame(()=>{          // next frame: add open class
    panel.classList.add('is-open');
  });
  btn.setAttribute('aria-expanded','true');
  document.documentElement.classList.add('menu-open');  // enables blur + locks scroll
}

function closePanel(){
  panel.classList.remove('is-open');
  btn.setAttribute('aria-expanded','false');
  document.documentElement.classList.remove('menu-open');
  // hide after the slide transition completes
  panel.addEventListener('transitionend', function te(e){
    if(e.propertyName !== 'transform') return;
    panel.hidden = true;
    panel.removeEventListener('transitionend', te);
  });
}

  function toggle(){
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  }

  btn.addEventListener('click', toggle);

  // Close on Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true'){
      closePanel();
      btn.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e)=>{
    if(btn.getAttribute('aria-expanded') !== 'true') return;
    if(e.target.closest('.menu-panel') || e.target.closest('.menu-toggle')) return;
    closePanel();
  });
})();
