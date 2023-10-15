import { default_settings, loadOptions, saveOptions, validateOptions } from "./lib.js";

function updateLineNumbers () {
  const renameMap = document.getElementById('rename_map');
  const lineCount = Math.max(renameMap.value.split(/\r|\r\n|\n/).length, 25);

  const lineNumbers = document.getElementById('line_numbers');
  let linesContent = '';
  for (let i = 1; i <= lineCount; i++) {
    linesContent += `${i}.\n`;
  }
  lineNumbers.value = linesContent;
}

function setErrorMessage (msg) {
  document.getElementById('error_msg').innerText = msg;
}

function setSaveMessage (msg) {
  if (!msg) {
    msg = "";
  }

  document.getElementById("save_msg").innerText = msg;
}

function showSaveMessage () {
  setSaveMessage("Saved!");
  setTimeout(() => setSaveMessage(), 1500);
}

function getOptions () {
  setErrorMessage("");

  const hideIcons = document.getElementById('hide_icons');
  const renameMap = document.getElementById('rename_map');

  // Validate JSON
  let options = {};
  try {
    options = {
      "hide_icons": hideIcons.checked,
      "rename_map": JSON.parse(renameMap.value),
    };
  } catch (e) {
    setErrorMessage(`ERROR: failed to parse JSON: ${e.message}`);
    return null;
  }

  // Validate rules
  const { valid, errors } = validateOptions(options);
  if (!valid) {
    setErrorMessage(errors.join("\n"));
    return null;
  }

  return options;
}

/**
 * @param {{[p: string]: *}} options
 */
function setOptions (options) {
  const hideIcons = document.getElementById('hide_icons');
  const renameMap = document.getElementById('rename_map');

  hideIcons.checked = options.hide_icons;
  renameMap.value = JSON.stringify(options.rename_map, null, 2);

  updateLineNumbers();
  getOptions();
}

function waitInputDone (callback, delay) {
  let timer = null;
  return (() => {
    clearTimeout(timer);

    timer = setTimeout(callback, delay);
  });
}

async function main () {
  const lineNumbers = document.getElementById('line_numbers');
  const renameMap = document.getElementById('rename_map');

  // Sync editor pane's resize to line number pane
  renameMap.addEventListener('resize', () => {
    lineNumbers.innerHeight = renameMap.innerHeight;
  });

  // Sync editor pane's scroll to line number pane
  renameMap.addEventListener('scroll', () => {
    lineNumbers.scrollTop = renameMap.scrollTop;
  });

  // Detect changes and validate
  renameMap.addEventListener("input", updateLineNumbers);
  renameMap.addEventListener("input", waitInputDone(getOptions, 1000));

  // Save action
  const save = document.getElementById("save");
  save.addEventListener("click", () => {
    const options = getOptions();
    if (!options) {
      return;
    }

    saveOptions(options).then(showSaveMessage);
  });

  // Reset action
  const reset = document.getElementById("reset");
  reset.addEventListener("click", () => {
    setOptions(default_settings);
  });

  await loadOptions().then(setOptions);
}

window.addEventListener("load", () => {
  main().then(() => {
    console.log("main function has executed successfully");
  });
});
