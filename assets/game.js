const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector(".start"),
  win: document.querySelector(".win"),
};

let state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

const shuffle = (array) => {
  const clonedArray = [...array];

  for (let index = clonedArray.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const originalItem = clonedArray[index];
    const randomItem = clonedArray[randomIndex];

    clonedArray[index] = randomItem;
    clonedArray[randomIndex] = originalItem;
  }

  return clonedArray;
};

const pickRandom = (array, itemsLength) => {
  const clonedArray = [...array];
  const randomPicks = [];

  for (let index = 0; index < itemsLength; index++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length);
    const randomItem = clonedArray[randomIndex];

    randomPicks.push(randomItem);
    clonedArray.splice(randomIndex, 1);
  }

  return randomPicks;
};

const generateGame = () => {
  const emojis = ["🥔", "🍒", "🥑", "🌽", "🥕", "🍇", "🍉", "🍌", "🥭", "🍍"];

  const dimensions = Number(selectors.board.getAttribute("data-dimension"));
  const dimensionsAreInvalid = dimensions % 2 !== 0;

  if (dimensionsAreInvalid) {
    throw new Error("The dimension of the board must be an even number.");
  }

  const uniqueItemsLength = (dimensions * dimensions) / 2;
  const picks = pickRandom(emojis, uniqueItemsLength);

  const itemsToShuffle = [...picks, ...picks];
  const shuffledItems = shuffle(itemsToShuffle);

  const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${shuffledItems
              .map(
                (item) => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `
              )
              .join("")}
       </div>
    `;

  const parser = new DOMParser().parseFromString(cards, "text/html");

  selectors.board.replaceWith(parser.querySelector(".board"));
};

const disableStartButton = () => {
  selectors.start.classList.add("disabled");
};

const updateStats = () => {
  state.totalTime++;

  selectors.moves.innerText = `${state.totalFlips} moves`;
  selectors.timer.innerText = `time: ${state.totalTime} sec`;
};

const startGame = () => {
  disableStartButton();

  state.gameStarted = true;
  state.loop = setInterval(updateStats, 1000);
};

const flipCardsBack = () => {
  document.querySelectorAll(".card:not(.matched)").forEach((card) => {
    card.classList.remove("flipped");
  });

  state.flippedCards = 0;
};

const showWinMessage = () => {
  const { totalFlips, totalTime, loop } = state;

  const winText = `
          <span class="win-text">
              You won!<br />
              with <span class="highlight">${totalFlips}</span> moves<br />
              under <span class="highlight">${totalTime}</span> seconds
          </span>
      `;

  setTimeout(() => {
    selectors.boardContainer.classList.add("flipped");
    selectors.win.innerHTML = winText;

    clearInterval(loop);
  }, 1000);
};

const checkIfGameEnded = () => {
  const noMoreCardsToFlip = !document.querySelectorAll(".card:not(.flipped)")
    .length;

  if (noMoreCardsToFlip) showWinMessage();
};

// -----------------------------------------------------------------
// FLIP CARD FUNCTIONALITY
// -----------------------------------------------------------------

const incrementFlips = () => {
  state.flippedCards++;
  state.totalFlips++;
};

const getFlipsInfo = () => {
  return {
    shouldAddFlippedCssClass: state.flippedCards <= 2,
    flippedTwoCards: state.flippedCards === 2,
  };
};

const getFlippedCardsInfo = () => {
  const FLIPPED_CARDS_CONTENT_SELECTOR =
    ".card.flipped:not(.matched) .card-back";

  const flippedCardsContent = document.querySelectorAll(
    FLIPPED_CARDS_CONTENT_SELECTOR
  );

  const firstCard = flippedCardsContent[0]?.parentElement;
  const secondCard = flippedCardsContent[1]?.parentElement;

  const firstCardContent = flippedCardsContent[0]?.innerHTML;
  const secondCardContent = flippedCardsContent[1]?.innerHTML;

  const cardsContentMatch = firstCardContent === secondCardContent;

  return {
    firstCard,
    secondCard,
    firstCardContent,
    secondCardContent,
    cardsContentMatch,
  };
};

const addMatchedCssClass = () => {
  const { firstCard, secondCard } = getFlippedCardsInfo();

  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
};

const addFlippedCssClass = (card) => {
  card.classList.add("flipped");
};

const flipCard = (card) => {
  if (!state.gameStarted) startGame();

  incrementFlips();

  const { shouldAddFlippedCssClass, flippedTwoCards } = getFlipsInfo();

  if (shouldAddFlippedCssClass) addFlippedCssClass(card);

  if (getFlippedCardsInfo().cardsContentMatch) addMatchedCssClass();
  if (flippedTwoCards) setTimeout(flipCardsBack, 500);

  checkIfGameEnded();
};

const attachEventListeners = () => {
  document.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const eventParent = eventTarget.parentElement;

    const isStartButton =
      eventTarget.className.includes("start") &&
      !eventTarget.className.includes("disabled");

    const isCard =
      eventTarget.className.includes("card") &&
      !eventParent.className.includes("flipped");

    if (isStartButton) startGame();
    if (isCard) flipCard(eventParent);
  });
};

generateGame();
attachEventListeners();
