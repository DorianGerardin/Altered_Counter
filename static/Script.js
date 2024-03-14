const biomesValuesTable = {
    'biomesValueForestTopLeft' : 'biomesValueForestBottomLeft',
    'biomesValueMountainTopLeft' : 'biomesValueMountainBottomLeft',
    'biomesValueWaterTopLeft' : 'biomesValueWaterBottomLeft',
    'biomesValueForestTopRight' : 'biomesValueForestBottomRight',
    'biomesValueMountainTopRight' : 'biomesValueMountainBottomRight',
    'biomesValueWaterTopRight' : 'biomesValueWaterBottomRight',

    'biomesValueForestBottomLeft' : 'biomesValueForestTopLeft',
    'biomesValueMountainBottomLeft' : 'biomesValueMountainTopLeft',
    'biomesValueWaterBottomLeft': 'biomesValueWaterTopLeft',
    'biomesValueForestBottomRight': 'biomesValueForestTopRight',
    'biomesValueMountainBottomRight': 'biomesValueMountainTopRight',
    'biomesValueWaterBottomRight' : 'biomesValueWaterTopRight'
}

const biomesSidesTable = {
    "BottomRightSide" : "right",
    "TopRightSide" : "right",
    "BottomLeftSide" : "left",
    "TopLeftSide" : "left",
}

function isMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}

if(isMobile()) {
    document.addEventListener('DOMContentLoaded', function () { // document.getElementById('addToHomeScreen').addEventListener('click', function () and add <button id="addToHomeScreen">Add to Home Screen</button> somewhere on your page to get a button instead.
        window.AddToHomeScreenInstance = new window.AddToHomeScreen({
            appName: 'Altered Counter',
            appIconUrl: 'static/Assets/appIcon_256.png',           // App icon link (square, at least 40 x 40 pixels).
            assetUrl: 'https://cdn.jsdelivr.net/gh/philfung/add-to-homescreen@1.8/dist/assets/img/',  // Link to directory of library image assets.
                                                                                                      // Required.
            showErrorMessageForUnsupportedBrowsers: window.AddToHomeScreen.SHOW_ERRMSG_UNSUPPORTED.ALL, // Show an error message if add-to-home-screen is not supported for this browser
                                                                                                        // (e.g.  "adding to home screen is not supported in IOS Firefox, please open this [website] in IOS Safari instead." or "adding to home screen is not supported on desktop, please open this [website] in your mobile browser instead".  You can also set more granular permissions to show error messages only on mobile browsers and not on desktop browsers, etc)
                                                                                                        // Optional. Default: window.AddToHomeScreen.SHOW_ERRMSG_UNSUPPORTED.ALL
            allowUserToCloseModal: true,                          // Allow user to close the 'Add to Homescreen' message? Not allowing will increase installs.
            maxModalDisplayCount: -1                               // If set, the modal will only show this many times.
                                                                   // Optional. Default: -1 (no limit).  (Debugging: Use this.clearModalDisplayCount() to reset the count)
        });

        if(!localStorage.getItem('visited') && !window.matchMedia('(display-mode: fullscreen)').matches) {
            window.AddToHomeScreenInstance.show();
            localStorage.setItem('visited', 'true');
        }
    });
}

let currentPlaySideAddingCharacter = null
let timeoutID;
let timerInterval;
let currentZoom = 1
let MAX_ZOOM = 1.2
let MIN_ZOOM = 0.8
let defaultBodyFontSize = getDefaultBodyFontSize()
let timerSeconds = 0;
let timerMinutes = 0;
let isTimerPaused = true

let topRightSideNode = document.getElementById("TopRightSide")
let topLeftSideNode = document.getElementById("TopLeftSide")
let bottomRightSideNode = document.getElementById("BottomRightSide")
let bottomLeftSideNode = document.getElementById("BottomLeftSide")

let biomesValuesBottomRight = bottomRightSideNode.querySelectorAll(".biomesValueOriginal")
let biomesValuesBottomLeft = bottomLeftSideNode.querySelectorAll(".biomesValueOriginal")
let biomesValuesTopRight = topRightSideNode.querySelectorAll(".biomesValueOriginal")
let biomesValuesTopLeft = topLeftSideNode.querySelectorAll(".biomesValueOriginal")

let rightTopArrow = document.getElementById("advanceTopRightArrow")
let rightBottomArrow = document.getElementById("advanceBottomRightArrow")
let leftBottomArrow = document.getElementById("advanceBottomLeftArrow")
let leftTopArrow = document.getElementById("advanceTopLeftArrow")

screen.orientation.addEventListener("change", handleOrientation);
window.addEventListener("resize", () => {
    let newDefault = getDefaultBodyFontSize()
    if(defaultBodyFontSize === newDefault) {
        return
    }
    defaultBodyFontSize = getDefaultBodyFontSize()
    zoom(0)
});
handleOrientation()
setAllChangeBiomesValueButtons()

function getDefaultBodyFontSize() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--default-body-font-size'))
}

function preventPullToRefreshPWA() {
    if(!window.matchMedia('(display-mode: fullscreen)').matches) {
        return
    }
    document.body.style.overscrollBehaviorY = "contain"
}
preventPullToRefreshPWA()

function SetPreferences() {
    let theme = localStorage.getItem('theme');
    theme ? toggleTheme(theme) : toggleTheme("light")
    let useTimer = localStorage.getItem('useTimer');
    useTimer ? toggleTimer(JSON.parse(useTimer)) : toggleTimer(false)
    let zoomValue = localStorage.getItem('zoomValue');
    if(zoomValue) {
        zoom((1 - zoomValue) * -1)
    }
    let useSoloMode = localStorage.getItem('soloMode');
    useSoloMode ? toggleSoloMode(JSON.parse(useSoloMode)) : toggleSoloMode(false)
    let useBiomesIcons = localStorage.getItem('biomesIcons');
    useBiomesIcons ? toggleBiomesIcons(JSON.parse(useBiomesIcons)) : toggleBiomesIcons(false)
}
SetPreferences()

function handleOrientation(event) {
    let orientationType = screen.orientation.type;

    switch (orientationType) {
        case "landscape-primary":
        case "landscape-secondary":
            document.getElementById("portraitModeWarning").style.display = "none"
            document.getElementById("app").style.display = "flex"
            break;
        case "portrait-primary":
        case "portrait-secondary":
            document.getElementById("portraitModeWarning").style.display = "flex"
            document.getElementById("app").style.display = "none"
            break;
        default:
            console.log("Orientation non reconnue.");
    }
}

function TogglePlayButtons() {
    let playTimersButtons = document.querySelectorAll(".playTimer");
    playTimersButtons.forEach((button) => {
        let playIcon = button.querySelector('.icon')
        if(isTimerPaused) {
            playIcon.style.setProperty('--icon-url', 'url("Assets/play.svg")');
            button.removeEventListener("click", pauseTimer)
            button.addEventListener("click", startTimer)
        } else {
            playIcon.style.setProperty('--icon-url', 'url("Assets/pause.svg")');
            button.removeEventListener("click", startTimer)
            button.addEventListener("click", pauseTimer)
        }
    })
}
TogglePlayButtons()

function startTimer() {
    isTimerPaused = false
    timerInterval = setInterval(updateTimer, 1000);
    TogglePlayButtons()
}

function pauseTimer() {
    isTimerPaused = true
    clearInterval(timerInterval);
    TogglePlayButtons()
}

function stopTimer() {
    isTimerPaused = true
    clearInterval(timerInterval);
    timerSeconds = 0;
    timerMinutes = 0;
    setTimerText(timerSeconds, timerMinutes)
    TogglePlayButtons()
}

function setTimerText(sec, min) {
    let secondsString = sec < 10 ? "0" + sec : sec;
    let minutesString = min < 10 ? "0" + min : min;
    let timerText=  minutesString + " : " + secondsString
    let timerNodes = document.querySelectorAll(".timerText");
    timerNodes.forEach((timer) => {
        timer.textContent = timerText
    })
}

function updateTimer() {
    timerSeconds++;
    if (timerSeconds >= 60) {
        timerSeconds = 0;
        timerMinutes++;
    }
    setTimerText(timerSeconds, timerMinutes)
}


function toggleTheme(value) {
    switch (value) {
        case "light":
            document.documentElement.classList.remove("darkMode")
            document.getElementById("lightModeButton").checked = true
            localStorage.setItem('theme', 'light');
            break
        case "dark":
            document.documentElement.classList.add("darkMode")
            document.getElementById("darkModeButton").checked = true
            localStorage.setItem('theme', 'dark');
            break
        case "system":
            if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add("darkMode")
            } else {
                document.documentElement.classList.remove("darkMode")
            }
            document.getElementById("systemModeButton").checked = true
            localStorage.setItem('theme', 'system');
    }
}
function toggleBiomesIcons(isOn) {
    let toggleButton = document.getElementById("toggleBiomesIcons")
    let biomesIcons = Array.from(document.querySelectorAll('.biomesIconBottom')).concat(Array.from(document.querySelectorAll('.biomesIconTop')))
    biomesIcons.forEach((biomesIcon) => {
        if(isOn) {
            biomesIcon.classList.replace("hidden", "visible")
            localStorage.setItem('biomesIcons', 'true');
        } else {
            biomesIcon.classList.replace("visible", "hidden")
            localStorage.setItem('biomesIcons', 'false');
        }
    })
    toggleButton.checked = isOn
}

function toggleSoloMode(isOn) {
    let toggleButton = document.getElementById("toggleSoloMode")
    let soloMode = document.getElementById("soloPlayer")
    let twoPlayersMode = document.getElementById("twoPlayers")
    toggleButton.checked = isOn
    stopTimer()
    if(isOn) {
        twoPlayersMode.classList.replace("visible", "hidden")
        soloMode.classList.replace("hidden", "visible")
        localStorage.setItem('soloMode', 'true');
    } else {
        soloMode.classList.replace("visible", "hidden")
        twoPlayersMode.classList.replace("hidden", "visible")
        localStorage.setItem('soloMode', 'false');
    }
}

function zoom(addPercent) {
    let newZoom = parseFloat((parseFloat(currentZoom) + parseFloat(addPercent)).toFixed(2))
    if(newZoom > MAX_ZOOM || newZoom < MIN_ZOOM) {
        return
    }
    let zoomValueNode = document.getElementById("zoomValue")
    let zoomInButton = document.getElementById("zoomInButton")
    zoomInButton.classList.remove("inactive")
    let zoomOutButton = document.getElementById("zoomOutButton")
    zoomOutButton.classList.remove("inactive")
    currentZoom = newZoom
    let newFontSize = defaultBodyFontSize * currentZoom
    zoomValueNode.textContent = `${(currentZoom * 100).toFixed(0)}%`
    document.body.style.fontSize = `${newFontSize}px`
    if(currentZoom >= MAX_ZOOM) {
        zoomInButton.classList.add("inactive");
    }
    if(currentZoom <= MIN_ZOOM) {
        zoomOutButton.classList.add("inactive")
    }
    localStorage.setItem('zoomValue', currentZoom);
}

function toggleTimer(isOn) {
    let toggleButton = document.getElementById("toggleTimerButton")
    toggleButton.checked = isOn
    if (isOn) {
        document.querySelectorAll('.timerContainer').forEach((timer) => {
            timer.classList.replace("hidden", "visible")
            localStorage.setItem('useTimer', 'true');
        })
    } else {
        document.querySelectorAll('.timerContainer').forEach((timer) => {
            timer.classList.replace("visible", "hidden")
            stopTimer()
            localStorage.setItem('useTimer', 'false');
        })
    }
}

function toggleSettings(isOn) {
    if(isOn) {
        document.getElementById("settings").style.scale = "1"
    } else {
        document.getElementById("settings").style.scale = "0"
    }
}

function pressEndHandler(e) {
    e.preventDefault()
    clearTimeout(timeoutID);
}

function setChangeBiomesValueButtonsPressEvents(buttons, operator, pressStart, pressEnd, pressCancel) {
    buttons.forEach((button) => {
        let target = button.getAttribute('data-target')
        button.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
        button.addEventListener(pressStart, () => {
            button.classList.add('pressed');
            ChangeBiomesValueStayTouch(target, operator);
        });
        button.addEventListener(pressEnd, (e) => {
            button.classList.remove('pressed');
            pressEndHandler(e)
        });
        button.addEventListener(pressCancel, (e) => {
            button.classList.remove('pressed');
            pressEndHandler(e)
        });
    })
}

function setChangeBiomesValueButtonsByClass(classValue) {
    let changeButtons = document.querySelectorAll(classValue);
    let operator = null
    switch (classValue) {
        case '.plusButtonTop':
            operator = 'minus'
            break
        case '.minusButtonTop':
            operator = 'plus'
            break
        case '.plusButtonBottom':
            operator = 'plus'
            break
        case '.minusButtonBottom':
            operator = "minus"
            break

    }
    if (isMobile()) {
        setChangeBiomesValueButtonsPressEvents(changeButtons, operator, 'touchstart', 'touchend', 'touchcancel')
    } else {
        setChangeBiomesValueButtonsPressEvents(changeButtons, operator, 'mousedown', 'mouseup', 'mouseleave')
    }
}

function setAllChangeBiomesValueButtons() {
    setChangeBiomesValueButtonsByClass('.plusButtonTop')
    setChangeBiomesValueButtonsByClass('.minusButtonTop')
    setChangeBiomesValueButtonsByClass('.plusButtonBottom')
    setChangeBiomesValueButtonsByClass('.minusButtonBottom')
}

function TryRemoveClass(node, ...classNames) {
    classNames.forEach((className) => {
        node.classList.remove(className)
    })
}

function ResetBiomesValue(playerSideId) {
    let playerSideNode = document.getElementById(playerSideId)
    const allBiomesValueOriginal = playerSideNode.querySelectorAll(".biomesValueOriginal")
    allBiomesValueOriginal.forEach((biomesValueNode) => {
        SetBiomesValue(biomesValueNode, 0)
    })
    playerSideNode.querySelectorAll(".biomesInactive").forEach((biomes) => {
        biomes.classList.replace("biomesInactive", "biomesActive")
    })
}

function AddBiomesValue(biomesValueNode, addValue) {
    let currentValue = parseInt(biomesValueNode.innerText)
    SetBiomesValue(biomesValueNode, currentValue + addValue)

}

function Boost(playSideNodeId, addValue) {
    let playSideNode = document.getElementById(playSideNodeId)
    const allBiomesValueOriginal = playSideNode.querySelectorAll(".biomesValueOriginal")
    allBiomesValueOriginal.forEach((biomesValueNode) => {
        AddBiomesValue(biomesValueNode, addValue)
    })
}

function ToggleModal(modalSideId, playSideId, toggle) {
    let modalSideNode = document.getElementById(modalSideId)
    if(toggle) {
        document.getElementById("AddCharacterModal").style.scale = '1'
        modalSideNode.classList.remove("hidden")
        modalSideNode.classList.add("visible")
        currentPlaySideAddingCharacter = playSideId
    }
    else {
        document.getElementById("AddCharacterModal").style.scale = '0'
        modalSideNode.classList.remove("visible")
        modalSideNode.classList.add("hidden")
        currentPlaySideAddingCharacter = null
        const allBiomesValueModalOriginal = modalSideNode.querySelectorAll(".biomesValueOriginal")
        allBiomesValueModalOriginal.forEach((biomesValueNode) => {
            SetBiomesValue(biomesValueNode, 1);
        })
    }
}

function ToggleBiomes(biomesNode) {
    let biomesInactiveClass = 'biomesInactive'
    let biomesActiveClass = 'biomesActive'
    if(biomesNode.classList.contains(biomesInactiveClass)) {
        biomesNode.classList.replace(biomesInactiveClass, biomesActiveClass)
    } else {
        biomesNode.classList.replace(biomesActiveClass, biomesInactiveClass)
    }

    if(!biomesNode.classList.contains("biomesModal")) {
        let playSide = GetPlaySideByBiomesNode(biomesNode)
        let advancingSide = GetAdvancingSide(playSide)
        SetAdvancingSide(advancingSide, playSide)
    }
}

function ValidateCharacter(modalSideId) {
    if(!currentPlaySideAddingCharacter) {
        return
    }
    let playSideNode = document.getElementById(currentPlaySideAddingCharacter)
    let modalSideNode = document.getElementById(modalSideId)
    let addValues = []
    const allBiomesValueModalOriginal = modalSideNode.querySelectorAll(".biomesValueOriginal")
    allBiomesValueModalOriginal.forEach((biomesValueNode) => {
        addValues.push(parseInt(biomesValueNode.innerText))
    })
    const allBiomesValueOriginal = playSideNode.querySelectorAll(".biomesValueOriginal")
    for (let i = 0; i < allBiomesValueOriginal.length; i++) {
        AddBiomesValue(allBiomesValueOriginal[i], addValues[i])
    }
    ToggleModal(modalSideId, '', false)
}

function GetOpponentNode(biomesValueNode) {
    return document.getElementById(biomesValuesTable[biomesValueNode.id])
}

function SetBiomesValue(biomesValueNode, newValue) {
    if(newValue > 99 || newValue < 0) {
        return
    }

    if(!biomesValueNode.classList.contains("modalValue")) {
        let biomesValueMirrorNode = document.getElementById(`${biomesValueNode.id}_Mirror`);
        let biomesValueOpponentNode = GetOpponentNode(biomesValueNode)
        let biomesValueOpponentMirrorNode = document.getElementById(`${biomesValueOpponentNode.id}_Mirror`);

        TryRemoveClass(biomesValueNode, 'biomesValueSuperior', 'biomesValueInferior')
        TryRemoveClass(biomesValueMirrorNode, 'biomesValueSuperior', 'biomesValueInferior')
        TryRemoveClass(biomesValueOpponentNode, 'biomesValueSuperior', 'biomesValueInferior')
        TryRemoveClass(biomesValueOpponentMirrorNode, 'biomesValueSuperior', 'biomesValueInferior')


        if(newValue > biomesValueOpponentNode.innerText) {
            biomesValueNode.classList.add('biomesValueSuperior')
            biomesValueMirrorNode.classList.add('biomesValueSuperior')
            biomesValueOpponentNode.classList.add('biomesValueInferior')
            biomesValueOpponentMirrorNode.classList.add('biomesValueInferior')
        } else if(newValue < biomesValueOpponentNode.innerText) {
            biomesValueNode.classList.add('biomesValueInferior')
            biomesValueMirrorNode.classList.add('biomesValueInferior')
            biomesValueOpponentNode.classList.add('biomesValueSuperior')
            biomesValueOpponentMirrorNode.classList.add('biomesValueSuperior')
        }

        biomesValueMirrorNode.innerText = newValue;
    }

    biomesValueNode.innerText = newValue;
    if(!biomesValueNode.classList.contains("modalValue")) {
        let playSide = GetPlaySideByBiomesValueNode(biomesValueNode)
        let advancingSide = GetAdvancingSide(playSide)
        SetAdvancingSide(advancingSide, playSide)
    }
}

function GetPlaySideByBiomesValueNode(valueNode) {
    return biomesSidesTable[valueNode.closest(".playSide").id]
}

function GetPlaySideByBiomesNode(biomesNode) {
    return biomesSidesTable[biomesNode.closest(".playSide").id]
}

function GetBiomesByValue(valueNode) {
    return valueNode.closest(".biomes")
}

function GetStrongestValueNode(valueNode1, valueNode2) {
    let value1 = parseInt(valueNode1.innerText)
    let value2 = parseInt(valueNode2.innerText)
    if(value1 > value2) {
        return valueNode1
    } else if(value2 > value1) {
        return valueNode2
    } else return null
}

// 0 Bottom Advance; 1 Top advance, -1 Nobody advance
function GetAdvancingSide(side) {
    let result = [-1, -1, -1]
    let strongestValueNode
    let biomesNode
    for (let i = 0; i < 3; i++) {
        if (side === 'right') {
            strongestValueNode = GetStrongestValueNode(biomesValuesBottomRight[i], biomesValuesTopRight[i])
        }
        else if(side === 'left') {
            strongestValueNode = GetStrongestValueNode(biomesValuesBottomLeft[i], biomesValuesTopLeft[i])
        }
        if(strongestValueNode) {
            biomesNode = GetBiomesByValue(strongestValueNode)
            if(biomesNode.classList.contains("biomesActive")) {
                result[i] = strongestValueNode.classList.contains('biomesValueTop') ? 1 : 0;
            }
        }
    }
    return result
}

function SetAdvancingSide(advanceArray, side) {
    let topArrow
    let bottomArrow
    if(side === "right") {
        topArrow = rightTopArrow
        bottomArrow = rightBottomArrow
    } else if(side === "left") {
        topArrow = leftTopArrow
        bottomArrow = leftBottomArrow
    }
    if(advanceArray.includes(0) && advanceArray.includes(1)) {
        topArrow.classList.replace("hidden", "visible")
        bottomArrow.classList.replace("hidden", "visible")
    } else if(advanceArray.includes(0)) {
        topArrow.classList.replace("visible", "hidden")
        bottomArrow.classList.replace("hidden", "visible")
    } else if(advanceArray.includes(1)) {
        topArrow.classList.replace("hidden", "visible")
        bottomArrow.classList.replace("visible", "hidden")
    } else {
        topArrow.classList.replace("visible", "hidden")
        bottomArrow.classList.replace("visible", "hidden")
    }
}

function ChangeBiomesValue(id, operator) {
    let biomesValueNode = document.getElementById(id);
    let currentValue = parseInt(biomesValueNode.innerText);
    let newValue;

    if (operator === 'plus') {
        newValue = currentValue + 1;
    } else if (operator === 'minus') {
        newValue = currentValue - 1;
    }

    SetBiomesValue(biomesValueNode, newValue);
}

function ChangeBiomesValueStayTouch(id, operator) {
    clearTimeout(timeoutID)
    ChangeBiomesValue(id, operator)
    timeoutID = setTimeout(() => {
        ChangeBiomesValueStayTouch(id, operator)
    }, 150);
}

