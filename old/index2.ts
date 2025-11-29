import randomize from "./functions/Randomize";
import { createGrid, addSquareListeners } from "./functions/Grid";
import { BrushType } from "./functions/Brush";
import {
  saveMapToLocalStorage,
  loadMapFromLocalStorage,
  MapData,
  removeMapFromLocalStorage,
  getSavedMapNames
} from "./functions/Save";
import {back, BackType} from "./functions/Background";

document.addEventListener('DOMContentLoaded', () => {
  let brushType: string = 'cross';
  let backType: BackType = 'earth';
  let gridCols: number = 15;
  let gridRows: number = 15;
  const gridContainer: HTMLElement = document.getElementById('grid-container') as HTMLElement;

  getSavedMapNames();

  // Active every square selected.
  const createGridBtn: HTMLButtonElement = document.getElementById('create-grid-btn') as HTMLButtonElement;
  createGridBtn.addEventListener('click', () => {
    gridRows = parseInt((document.getElementById('grid-range-rows') as HTMLInputElement).value);
    gridCols = parseInt((document.getElementById('grid-range') as HTMLInputElement).value);
    createGrid(gridRows, gridCols, brushType as BrushType);
    createGridBtn.disabled = true;
  });
  (document.getElementById('clear-btn') as HTMLButtonElement).addEventListener('click', () => {
    createGrid(gridRows, gridCols, brushType as BrushType);
  });

  (document.getElementById('grid-range-rows') as HTMLElement).addEventListener('change', (e: Event | null) => {
    gridRows = parseInt((e?.target as HTMLInputElement).value);
    (document.getElementById('grid-label') as HTMLElement).innerText = gridCols + 'x' + gridRows;
    createGridBtn.disabled = false;
  });
  (document.getElementById('grid-range') as HTMLElement).addEventListener('change', (e: Event | null) => {
    gridCols = parseInt((e?.target as HTMLInputElement).value);
    (document.getElementById('grid-label') as HTMLElement).innerText = gridCols + 'x' + gridRows;
    createGridBtn.disabled = false;
  });

  (document.getElementById('randomize-btn') as HTMLButtonElement).addEventListener('click', randomize);
  // Chiama la funzione di randomizzazione al click del pulsante.

  (document.getElementById('save-btn') as HTMLButtonElement).addEventListener('click', () => {
    const mapName = (document.getElementById('map-name') as HTMLInputElement).value;
    saveMapToLocalStorage(gridContainer, mapName, gridRows, gridCols, backType);
  });
  (document.getElementById('load-btn') as HTMLButtonElement).addEventListener('click', () => {
    const mapName = (document.getElementById('map-names') as HTMLInputElement).value;
    const mapData: MapData | null = loadMapFromLocalStorage(mapName);
    gridRows = mapData?.rows ?? gridRows;
    gridCols = mapData?.cols ?? gridCols;
    createGrid(gridRows, gridCols, brushType as BrushType);
    backType = (mapData?.back ?? backType) as BackType;
    back(gridContainer, backType);
    // Applica lo stato salvato a ogni quadrato della griglia
    const squares = Array.from(gridContainer.children) as HTMLElement[];
    mapData?.squares?.forEach((data, index) => {
      if (data.s) {
        squares[index].classList.add('active');
      } else {
        squares[index].classList.remove('active');
      }
    });
  });
  (document.getElementById('delete-btn') as HTMLButtonElement).addEventListener('click', () => {
    const mapName = (document.getElementById('map-names') as HTMLInputElement).value;
    removeMapFromLocalStorage(mapName);
  });

  (document.querySelectorAll('input[name="brush-options"]')).forEach(radio => {
    radio.addEventListener('click', (e: Event) => {
      brushType = (e?.target as HTMLInputElement).value;
      console.log('brushType: ', brushType);
      addSquareListeners(brushType as BrushType, gridCols);
    });
  });
  (document.querySelectorAll('input[name="back-options"]')).forEach(radio => {
    radio.addEventListener('click', (e: Event) => {
      backType = (e?.target as HTMLInputElement).value as BackType;
      back(gridContainer, backType);
    });
  });

  gridContainer.addEventListener('contextmenu', (e) => e.preventDefault());
  // Crea una griglia di dimensioni predefinite all'avvio della pagina
  createGrid(gridRows, gridCols, brushType as BrushType);
});
