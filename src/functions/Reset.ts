

function resetCreaturePositions() {
  creatures.forEach(creature => {
    // Imposta top: 0px per abilitare le transizioni (come discusso)
    creature.element.style.top = '0px';
    creature.element.style.transform = '';
    creature.element.style.opacity = '1'; // Riporta l'opacità a 1
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

export { resetCreaturePositions,  };