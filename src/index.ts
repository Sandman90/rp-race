// import { resetCreaturePositions } from "./functions/Reset";
// import { Creature } from "./functions/Creature";

document.addEventListener('DOMContentLoaded', () => {
  interface Creature {
    element: HTMLElement;
    id: string;
    name: string; // AGGIUNTO: Nome della creatura
  }

  const creaturesElements = document.querySelectorAll<HTMLElement>('.creature');
  const startButton = document.getElementById('startButton') as HTMLButtonElement;
  const resetButton = document.getElementById('resetButton') as HTMLButtonElement;
  const trackElement = document.querySelector('.track') as HTMLElement;
  const finishLineElement = document.querySelector('.finish-line') as HTMLElement;

// AGGIUNTO: Elementi per il display del vincitore
  const winnerDisplay = document.getElementById('winnerDisplay') as HTMLElement;
  const winnerText = document.getElementById('winnerText') as HTMLElement;

// Suoni
  const startSound = document.getElementById('startSound') as HTMLAudioElement;
  const endSound = document.getElementById('endSound') as HTMLAudioElement;
  const raceSound = document.getElementById('raceSound') as HTMLAudioElement;

// Variabili per i timer
  let raceTimeout: number;
  let raceDelayTimeout: number;
  let finishMarkerTimeout: number;
  let fakeWinTimeout: number;
  let crashTimeout: number | undefined;
  let isRaceRunning: boolean = false;
  let winner: Creature | null = null;
  let fakeWinner: Creature | null = null;

// Configurazione della Corsa
  const totalRaceDuration = 15000;     // Durata totale della corsa (5.0s)
  const startDelay = 900;             // Ritardo prima del movimento del terreno (0.5s)
  const lineDescentDuration = 3000;   // Durata della discesa della linea (4.0s)
  const lineDescentStart = 12000;      // La linea inizia a scendere a 1000ms
  const CRASH_PROBABILITY = 0.7;      // 50% di probabilità di crash

// Posizioni (Finali, ottimizzate)
  const FINISH_LINE_START_TOP = 0;
  const FINISH_LINE_END_TOP = 596;
  const WINNER_LIFT_OFFSET = '-30px';
  const FAKE_WINNER_LIFT_OFFSET = '-15px';
  const CRASH_RETREAT_OFFSET = '150px'; // Di quanto arretra la creatura in caso di crash.

// AGGIUNTO: Nomi delle creature
  const creatureNames = ['forziere', 'boccale', 'barile', 'sgabello', 'scopa'];

// Array delle creature (modificato per includere il nome)
  const creatures: Creature[] = Array.from(creaturesElements).map((el, index) => ({
    element: el,
    id: el.id,
    name: creatureNames[index] // Assegna il nome in base all'ordine
  }));

// --- Funzioni di Utilità ---

  function showStartButton() {
    startButton.style.display = 'inline-block';
    resetButton.style.display = 'none';
  }

  function showResetButton() {
    startButton.style.display = 'none';
    resetButton.style.display = 'inline-block';
  }

  function resetCreaturePositions() {
    creatures.forEach(creature => {
      creature.element.style.top = '0px';
      creature.element.style.transform = '';
      creature.element.style.opacity = '1';
      creature.element.classList.remove('winner', 'fake-winner', 'crashed');
    });

    // Nasconde il display del vincitore al reset
    winnerDisplay.classList.remove('show');

    // Resetta la linea del traguardo
    finishLineElement.style.opacity = '0';
    finishLineElement.classList.remove('active');

    finishLineElement.style.transition = 'none';
    finishLineElement.style.top = `${FINISH_LINE_START_TOP}px`;

    void finishLineElement.offsetWidth;
    finishLineElement.style.transition = `opacity 0.5s ease-in, top ${lineDescentDuration / 1000}s linear`;
  }

// --- Logica Crash (Rimanere Indietro) ---

  function setupCrashEvent(nonParticipants: Creature[]) {
    if (Math.random() > CRASH_PROBABILITY || nonParticipants.length === 0) {
      return;
    }

    const crashVictim = nonParticipants[Math.floor(Math.random() * nonParticipants.length)];
    const crashTime = (Math.random() * (lineDescentStart - startDelay) + startDelay);

    console.log(`Creatura ${crashVictim.name} (${crashVictim.id}) designata per rimanere indietro a ${crashTime.toFixed(0)}ms.`);

    crashTimeout = window.setTimeout(() => {
      crashVictim.element.classList.add('crashed');
      crashVictim.element.style.top = CRASH_RETREAT_OFFSET;

    }, crashTime);
  }

// --- Funzioni di Gestione della Corsa ---

  function startRace() {
    if (isRaceRunning) return;

    isRaceRunning = true;
    startButton.disabled = true;
    resetButton.disabled = true;
    showResetButton();

    // 1. Determina vincitore e quasi-vincitore
    const winnerIndex = Math.floor(Math.random() * creatures.length);
    winner = creatures[winnerIndex];

    let fakeWinnerIndex = winnerIndex;
    while (fakeWinnerIndex === winnerIndex) {
      fakeWinnerIndex = Math.floor(Math.random() * creatures.length);
    }
    fakeWinner = creatures[fakeWinnerIndex];

    // 2. Prepara i non-partecipanti per il crash
    const nonParticipants = creatures.filter(c => c !== winner && c !== fakeWinner);
    setupCrashEvent(nonParticipants);


    // 3. Fischio d'inizio e start del suono continuo
    startSound.play();
    raceSound.currentTime = 0;
    raceSound.play();

    // 4. Avvio della corsa effettiva
    raceDelayTimeout = window.setTimeout(() => {
      trackElement.classList.add('racing');
      creatures.forEach(creature => {
        animateCreatureRunning(creature.element);
      });
    }, startDelay);

    // 5. L'effetto "quasi vincitore" a metà corsa
    fakeWinTimeout = window.setTimeout(() => {
      if (fakeWinner) {
        fakeWinner.element.classList.add('fake-winner');
        void fakeWinner.element.offsetWidth;
        fakeWinner.element.style.top = FAKE_WINNER_LIFT_OFFSET;
      }
    }, 2000);

    // 6. Attivazione della linea del traguardo e scatto del vincitore
    finishMarkerTimeout = window.setTimeout(() => {
      // Linea
      finishLineElement.style.opacity = '1';
      finishLineElement.classList.add('active');
      finishLineElement.style.top = `${FINISH_LINE_END_TOP}px`;

      // Vincitore
      if (winner) {
        winner.element.classList.add('winner');
        void winner.element.offsetWidth;
        winner.element.style.top = WINNER_LIFT_OFFSET;
      }

    }, lineDescentStart);

    // 7. Fine della corsa
    raceTimeout = window.setTimeout(() => {
      endRace();
    }, totalRaceDuration);
  }


  function animateCreatureRunning(creatureElement: HTMLElement) {
    let oscillation = 0;
    const oscillationSpeed = Math.random() * 0.2 + 0.1;
    const oscillationHeight = Math.random() * 5 + 3;

    function frame() {
      if (!isRaceRunning) return;

      if (creatureElement.classList.contains('crashed')) {
        return;
      }

      oscillation += oscillationSpeed;
      const yOffset = Math.sin(oscillation) * oscillationHeight;
      creatureElement.style.transform = `translateY(${yOffset}px)`;
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function endRace() {
    isRaceRunning = false;
    startButton.disabled = false;
    resetButton.disabled = false;

    // Fermiamo le animazioni
    trackElement.classList.remove('racing');
    creatures.forEach(creature => {
      if (!creature.element.classList.contains('crashed')) {
        creature.element.style.transform = '';
      }
    });
    finishLineElement.classList.remove('active');

    // Suono di fine corsa
    endSound.play();
    raceSound.pause();

    // Mostra il vincitore al centro
    if (winner) {
      winnerText.textContent = `Il mimic ${winner.name}`; // Messaggio dinamico
      winnerDisplay.classList.add('show'); // Rende visibile il div
    }

    console.log(`Race finished! Winner: ${winner ? winner.name : 'N/A'}`);
  }

  function resetRace() {
    // Pulisce tutti i timeout
    window.clearTimeout(raceTimeout);
    window.clearTimeout(raceDelayTimeout);
    window.clearTimeout(finishMarkerTimeout);
    window.clearTimeout(fakeWinTimeout);
    if (crashTimeout !== undefined) {
      window.clearTimeout(crashTimeout);
    }
    isRaceRunning = false;

    startButton.disabled = false;
    resetButton.disabled = false;

    raceSound.pause();
    raceSound.currentTime = 0;

    trackElement.classList.remove('racing');
    resetCreaturePositions();
    showStartButton();
  }

// --- Event Listeners e Inizializzazione ---

  startButton.addEventListener('click', startRace);
  resetButton.addEventListener('click', resetRace);

  resetCreaturePositions();
  showStartButton();


});
