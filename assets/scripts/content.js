async function main () {
  const { loadOptions } = await import("./lib.js");

  let hideIcons = false;

  /** @type {Record<string, string>} */
  let renameMap = {};

  async function reloadOptions () {
    await loadOptions().then((options) => {
      hideIcons = options.hide_icons;
      renameMap = options.rename_map;
    });
  }

  await reloadOptions();

  // Tweak favorite bar items
  function tweak () {
    // Hide icons
    document.querySelectorAll("#awsc-nav-header ol li div:has(>img)").forEach((node) => {
      node.style.display = hideIcons ? "none" : "";
    });

    // Customize item names
    document.querySelectorAll("#awsc-nav-header ol li span").forEach((node) => {
      if (node.innerText in renameMap) {
        node.textContent = renameMap[node.innerText];
      }
    });
  }

  // Run tweak when header changed
  const observer = new MutationObserver(tweak);
  observer.observe(document.getElementById("consoleNavHeader"), {
    attributes: false,
    childList: true,
    subtree: true,
  });

  // Reload options when it changed
  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    console.log(`change received in ${namespace}`, changes);
    await reloadOptions();
    tweak();
  });
}

main().then(() => {
  console.log("contents script loaded successfully!");
});
