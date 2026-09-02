const TABS = [["tab-calc","view-calc"],["tab-pot","view-pot"],["tab-list","view-list"],["tab-prices","view-prices"]];
const moreIds = new Set(["tab-list","tab-prices"]);

function closeMore(){
  $("tab-more").setAttribute("aria-expanded","false");
  $("moreMenu").hidden = true;
}

function selectTab(id){
  TABS.forEach(([t,v]) => {
    $(t).setAttribute("aria-selected", String(t === id));
    $(v).hidden = t !== id;
  });
  $("tab-more").setAttribute("aria-selected", String(moreIds.has(id)));
  closeMore();
  window.scrollTo(0, 0);
}

TABS.forEach(([t]) => $(t).addEventListener("click", () => selectTab(t)));

$("tab-more").addEventListener("click", e => {
  e.stopPropagation();
  const open = $("tab-more").getAttribute("aria-expanded") === "true";
  $("tab-more").setAttribute("aria-expanded", String(!open));
  $("moreMenu").hidden = open;
});

document.addEventListener("click", e => {
  if(!$("switchMore").contains(e.target)) closeMore();
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape") closeMore();
});
// Claude did this part
