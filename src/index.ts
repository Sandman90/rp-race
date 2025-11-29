// import { resetCreaturePositions } from "./functions/Reset";
// import { Creature } from "./functions/Creature";

document.addEventListener('DOMContentLoaded', () => {

  // script.ts

  interface Creature {
    element: HTMLElement;
    id: string;
  }

  const creaturesElements = document.querySelectorAll<HTMLElement>('.creature');
  const startButton = document.getElementById('startButton') as HTMLButtonElement;
  const resetButton = document.getElementById('resetButton') as HTMLButtonElement;
  const trackElement = document.querySelector('.track') as HTMLElement;
  const finishLineElement = document.querySelector('.finish-line') as HTMLElement;

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
  const startDelay = 500;             // Ritardo prima del movimento del terreno (0.5s)
  const lineDescentDuration = 3000;   // Durata della discesa della linea (4.0s)
  const lineDescentStart = 12000;      // La linea inizia a scendere a 1000ms
  const CRASH_PROBABILITY = 0.5;      // 50% di probabilità di crash

// Posizioni (Ricalibrate per l'altezza 760px)
  const FINISH_LINE_START_TOP = 0;
  const FINISH_LINE_END_TOP = 596;    // CORREZIONE: 700px per un container di 760px.
  const WINNER_LIFT_OFFSET = '-30px';
  const FAKE_WINNER_LIFT_OFFSET = '-15px';
  const CRASH_RETREAT_OFFSET = '500px';

// Array delle creature
  const creatures: Creature[] = Array.from(creaturesElements).map(el => ({
    element: el,
    id: el.id,
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
      // Imposta top: 0px per abilitare le transizioni
      creature.element.style.top = '0px';
      creature.element.style.transform = '';
      creature.element.style.opacity = '1';
      creature.element.classList.remove('winner', 'fake-winner', 'crashed');
    });

    // Resetta la linea del traguardo
    finishLineElement.style.opacity = '0';
    finishLineElement.classList.remove('active');

    // Resetta la posizione del top della linea e riabilita la transizione
    finishLineElement.style.transition = 'none';
    finishLineElement.style.top = `${FINISH_LINE_START_TOP}px`;

    void finishLineElement.offsetWidth;
    finishLineElement.style.transition = `opacity 0.5s ease-in, top ${lineDescentDuration / 1000}s linear`;
  }

// --- Logica Crash (Rimanere Indietro) ---

  function setupCrashEvent(nonParticipants: Creature[]) {
    // 1. Probabilità: L'evento si verifica solo il 50% delle volte
    if (Math.random() > CRASH_PROBABILITY || nonParticipants.length === 0) {
      return;
    }

    // 2. Scegli una vittima a caso tra i non-vincenti
    const crashVictim = nonParticipants[Math.floor(Math.random() * nonParticipants.length)];

    // 3. Determina un momento casuale per l'uscita di pista
    // Deve succedere dopo l'inizio effettivo (500ms) e prima dello scatto finale (1000ms)
    const crashTime = Math.random() * (lineDescentStart - startDelay) + startDelay;

    console.log(`Creatura ${crashVictim.id} designata per rimanere indietro a ${crashTime.toFixed(0)}ms.`);

    crashTimeout = window.setTimeout(() => {
      // Applica gli stili CSS per arretrare e scomparire morbidamente
      crashVictim.element.classList.add('crashed');

      // Lo spostamento verso il basso (indietro nella prospettiva di corsa)
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

      // Se la creatura è "crashata" (rimasta indietro), ferma l'oscillazione e non fare nulla.
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

    console.log(`Race finished! Winner: ${winner ? winner.id : 'N/A'}`);
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
