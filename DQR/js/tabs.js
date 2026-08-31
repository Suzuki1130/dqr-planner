[["tab-calc","view-calc"],["tab-list","view-list"],["tab-prices","view-prices"]].forEach(([t,v],_,all) => {
  $(t).addEventListener("click", () => {
    all.forEach(([t2,v2]) => {
      $(t2).setAttribute("aria-selected", String(t2 === t));
      $(v2).hidden = v2 !== v;
    });
    window.scrollTo(0, 0);
  });
});
// Claude did this part