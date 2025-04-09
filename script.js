// Variabili globali
let timeInSeconds = 0;
let timerSeconds = 0;
let isRunningTimecode = false;
let timerInterval;
let counter = 2;
let lastUpdateTime;

const frameRate = 25;

function formatTimecode(totalFrames) {
  const hours = String(Math.floor(totalFrames / (frameRate * 3600))).padStart(2, '0');
  const minutes = String(Math.floor((totalFrames % (frameRate * 3600)) / (frameRate * 60))).padStart(2, '0');
  const seconds = String(Math.floor((totalFrames % (frameRate * 60)) / frameRate)).padStart(2, '0');
  const frames = String(totalFrames % frameRate).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}:${frames}`;
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimecode() {
  const projectName = document.getElementById('projectName').value.trim();
  if (!projectName) {
    alert('Inserisci il nome del progetto prima di avviare il timecode.');
    return;
  }
  if (!isRunningTimecode) {
    isRunningTimecode = true;
    lastUpdateTime = Date.now();
    requestAnimationFrame(updateTimecode);
    document.getElementById('startTimecodeButton').disabled = true;
    document.getElementById('stopTimecodeButton').disabled = false;
  }
}

function updateTimecode() {
  if (!isRunningTimecode) return;
  const now = Date.now();
  const elapsed = now - lastUpdateTime;
  lastUpdateTime = now;
  timeInSeconds += elapsed / 1000;
  updateTimecodeDisplay();
  requestAnimationFrame(updateTimecode);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
  document.getElementById('startTimerButton').disabled = true;
  document.getElementById('stopTimerButton').disabled = false;
}

function stopTimecode() {
  isRunningTimecode = false;
  document.getElementById('startTimecodeButton').disabled = false;
  document.getElementById('stopTimecodeButton').disabled = true;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerSeconds = 0;
  updateTimerDisplay();
  document.getElementById('startTimerButton').disabled = false;
  document.getElementById('stopTimerButton').disabled = true;
}

function resetTimecode() {
  isRunningTimecode = false;
  clearInterval(timerInterval);
  timeInSeconds = 0;
  timerSeconds = 0;
  updateTimecodeDisplay();
  updateTimerDisplay();
  document.getElementById('startTimecodeButton').disabled = false;
  document.getElementById('stopTimecodeButton').disabled = true;
  document.getElementById('startTimerButton').disabled = false;
  document.getElementById('stopTimerButton').disabled = true;
  document.getElementById('timecodeOutput').innerText =
    `001  C  V  00:00:00:00  00:00:00:00  00:00:00:00  00:00:00:00\n\n` +
    `Rumore - Purple, Pausa - Sky, Ripete - Red, In/Out - Cream  |C:ResolveColorPink |M:Edizione |D:0\n\n`;
  document.getElementById('customMessage').value = '';
  document.getElementById('customTimecode').value = '';
  counter = 2;
}

function updateTimecodeDisplay() {
  const totalFrames = Math.floor(timeInSeconds * frameRate);
  document.getElementById('timecode').innerText = formatTimecode(totalFrames);
}

function updateTimerDisplay() {
  document.getElementById('timer').innerText = formatTimer(timerSeconds);
}

function validateCustomTimecode(input) {
  const regex = /^\d{1,2}\.\d{1,2}$/;
  return regex.test(input);
}

function parseCustomTimecode(input) {
  const [minutes, seconds] = input.split('.').map(Number);
  return (minutes * 60) + seconds;
}

function toggleCustomTimecodeInput() {
  const checkbox = document.getElementById('useCustomTimecode');
  document.getElementById('customTimecode').disabled = !checkbox.checked;
}

function addCustomMessage() {
  const customMessage = document.getElementById('customMessage').value.trim();
  const useCustomTimecode = document.getElementById('useCustomTimecode').checked;
  const customTimecodeInput = document.getElementById('customTimecode').value.trim();
  const warning = document.getElementById('timecodeWarning');

  let markerTimeSeconds;

  if (useCustomTimecode) {
    if (!validateCustomTimecode(customTimecodeInput)) {
      warning.style.display = 'block';
      return;
    } else {
      warning.style.display = 'none';
      markerTimeSeconds = parseCustomTimecode(customTimecodeInput);
      if (markerTimeSeconds > timerSeconds) {
        alert('Il valore inserito supera il tempo attuale del timer.');
        return;
      }
    }
  } else {
    markerTimeSeconds = timerSeconds;
  }

  if (!customMessage) {
    alert('Il messaggio personalizzato non può essere vuoto.');
    return;
  }

  const correspondingTimecodeFrames = Math.floor((timeInSeconds - (timerSeconds - markerTimeSeconds)) * frameRate);
  const timecodeText = formatTimecode(correspondingTimecodeFrames);
  const sequenceNumber = String(counter).padStart(3, '0');
  const formattedText = `${sequenceNumber}  C  V  ${timecodeText}  ${timecodeText}  ${timecodeText}  ${timecodeText}\n\n${customMessage} |C:ResolveColorBlue |M:Edizione |D:0\n`;

  const outputBox = document.getElementById('timecodeOutput');
  const span = document.createElement('span');
  span.innerText = formattedText + '\n\n';
  outputBox.appendChild(span);
  outputBox.scrollTop = outputBox.scrollHeight;

  document.getElementById('customMessage').value = '';
  document.getElementById('customTimecode').value = '';
  counter++;
}

function generateFormattedText(label) {
  const timecodeText = formatTimecode(Math.floor(timeInSeconds * frameRate));
  const sequenceNumber = String(counter).padStart(3, '0');
  const formattedText = `${sequenceNumber}  C  V  ${timecodeText}  ${timecodeText}  ${timecodeText}  ${timecodeText}\n\n${getLabelForButton(label)} |C:ResolveColor${getColorForLabel(label)} |M:Edizione |D:0\n`;
  const outputBox = document.getElementById('timecodeOutput');
  const span = document.createElement('span');
  span.innerText = formattedText + '\n\n';
  span.classList.add(label);
  outputBox.appendChild(span);
  outputBox.scrollTop = outputBox.scrollHeight;
  counter++;
}

function getLabelForButton(label) {
  const labelMap = {
    'pausa': 'Pausa',
    'rumore': 'Rumore',
    'ripete': 'Ripete',
    'In': 'In',
    'Out': 'Out'
  };
  return labelMap[label] || 'Messaggio';
}

function getColorForLabel(label) {
  const colorMap = {
    'pausa': 'Sky',
    'rumore': 'Purple',
    'ripete': 'Red',
    'In': 'Cream',
    'Out': 'Cream'
  };
  return colorMap[label] || 'Sky';
}

document.addEventListener('keydown', (event) => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
  const keyActions = {
    'r': () => generateFormattedText('rumore'),
    'p': () => generateFormattedText('pausa'),
    't': () => generateFormattedText('ripete'),
    'i': () => generateFormattedText('In'),
    'o': () => generateFormattedText('Out'),
    'c': () => copyTimecode(),
    's': () => startTimecode(),
    'e': () => stopTimecode()
  };
  const action = keyActions[event.key.toLowerCase()];
  if (action) {
    event.preventDefault();
    action();
  }
});

function copyTimecode() {
  const outputText = document.getElementById('timecodeOutput').innerText;
  navigator.clipboard.writeText(outputText).then(() => {
    const alertBox = document.getElementById('copyAlert');
    alertBox.style.display = 'block';
    setTimeout(() => alertBox.style.display = 'none', 2000);
  });
}

function downloadEDL() {
  const outputText = document.getElementById('timecodeOutput').innerText;
  const headerText = `TITLE: Edizione\nFCM: NON DROP FRAME\n\n`;
  const completeText = headerText + outputText + '\n\n';
  const blob = new Blob([completeText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Edizione.edl`;
  link.click();
}

window.onload = () => {
  resetTimecode();
};
