const TABS = [
  ["tab-calc","view-calc"],
  ["tab-pot","view-pot"],
  ["tab-list","view-list"],
  ["tab-prices","view-prices"],
  ["tab-about","view-about"]
];

function selectTab(id){
  TABS.forEach(([t,v]) => {
    $(t).setAttribute("aria-selected", String(t === id));
    $(v).hidden = t !== id;
  });
  window.scrollTo(0, 0);
  $(id).scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
}

TABS.forEach(([t]) => $(t).addEventListener("click", () => selectTab(t)));

// edge fades on the nav pill row, so a scrollable overflow on small screens
// reads as "more here" rather than text getting silently clipped
(function navFades(){
  const nav = $("primaryNav");
  const fadeL = $("navFadeL");
  const fadeR = $("navFadeR");
  if(!nav || !fadeL || !fadeR) return;
  function update(){
    const scrollable = nav.scrollWidth > nav.clientWidth + 1;
    fadeL.classList.toggle("show", scrollable && nav.scrollLeft > 2);
    fadeR.classList.toggle("show", scrollable && nav.scrollLeft < nav.scrollWidth - nav.clientWidth - 2);
  }
  nav.addEventListener("scroll", update, { passive:true });
  window.addEventListener("resize", update);
  update();
})();
