/* =========================
   GAMEVAULT JAVASCRIPT
========================= */


/* =========================
   GAME DATA
========================= */

const allGames = [
    {
        name: "Shadow Protocol",
        price: 19.99,
        category: "ACTION",
        image: "shadow-protocol.jpeg",
        description:
            "Enter the shadows and take on high-risk missions in a world where every move matters."
    },
    {
        name: "Realm of Legends",
        price: 24.99,
        category: "RPG",
        image: "realm-of-legends.jpeg",
        description:
            "Build your hero, explore a legendary world and fight your way through powerful enemies."
    },
    {
        name: "Lost Horizon",
        price: 17.99,
        category: "ADVENTURE",
        image: "lost-horizon.jpeg",
        description:
            "Explore an unknown world filled with danger, mystery and unforgettable discoveries."
    },
    {
        name: "Velocity X",
        price: 14.99,
        category: "RACING",
        image: "velocity-x.jpeg",
        description:
            "Push your limits, dominate the track and become the fastest driver in Velocity X."
    },
    {
        name: "Dark Descent",
        price: 13.99,
        category: "HORROR",
        image: "dark-descent.jpeg",
        description:
            "Descend into darkness and survive the terrifying threats waiting around every corner."
    },
    {
        name: "Ultimate Football",
        price: 11.99,
        category: "SPORTS",
        image: "ultimate-football.jpeg",
        description:
            "Take control of your team, compete against the best and chase football glory."
    }
];


/* =========================
   PAGE ELEMENTS
========================= */

const currencySelector =
    document.getElementById("currencySelector");

const searchInput =
    document.getElementById("gameSearch");

const searchBtn =
    document.getElementById("searchBtn");

const searchResults =
    document.getElementById("searchResults");


/* =========================
   CURRENCY
========================= */

const currencySymbols = {
    USD: "$",
    NGN: "₦",
    GBP: "£",
    EUR: "€"
};

let exchangeRates = {
    USD: 1
};


/* =========================
   CART
========================= */

let cart =
    JSON.parse(
        localStorage.getItem("gameVaultCart")
    ) || [];


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const cartCount =
        document.querySelectorAll(
            ".cart-btn span"
        );

    cartCount.forEach(counter => {

        counter.textContent =
            cart.length;

    });

}


/* =========================
   SAVE CART
========================= */

function saveCart() {

    localStorage.setItem(
        "gameVaultCart",
        JSON.stringify(cart)
    );

    updateCartCount();

}


/* =========================
   CURRENCY RATES
========================= */

async function loadExchangeRates() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/exchange-rates"
            );

        if (!response.ok) {

            throw new Error(
                "Exchange rate request failed"
            );

        }

        const data =
            await response.json();

        if (
            data.status !== "success" ||
            !data.rates
        ) {

            throw new Error(
                "Invalid exchange rate response"
            );

        }

        exchangeRates = {

            USD: data.rates.USD,

            NGN: data.rates.NGN,

            GBP: data.rates.GBP,

            EUR: data.rates.EUR

        };

        console.log(
            "BACKEND CURRENCY RATES:",
            exchangeRates
        );

    } catch (error) {

        console.error(
            "Currency rates could not be loaded:",
            error
        );

        exchangeRates = {
            USD: 1
        };

    }

}


/* =========================
   GET CURRENT CURRENCY
========================= */

function getCurrentCurrency() {

    if (currencySelector) {

        return (
            currencySelector.value ||
            "USD"
        );

    }

    return (
        localStorage.getItem(
            "gameVaultCurrency"
        ) || "USD"
    );

}


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(
    usdPrice,
    currency
) {

    const rate =
        exchangeRates[currency];

    const symbol =
        currencySymbols[currency] || "$";

    if (
        typeof rate !== "number" ||
        !isFinite(rate)
    ) {

        return currency === "USD"
            ? `${symbol}${usdPrice.toFixed(2)}`
            : "RATE UNAVAILABLE";

    }

    const convertedPrice =
        usdPrice * rate;

    if (currency === "USD") {

        return `${symbol}${convertedPrice.toFixed(2)}`;

    }

    return `${symbol}${Math.round(
        convertedPrice
    ).toLocaleString()}`;

}


/* =========================
   UPDATE GAME PRICES
========================= */

function updatePrices() {

    const currency =
        getCurrentCurrency();

    const prices =
        document.querySelectorAll(
            ".game-price"
        );

    prices.forEach(priceElement => {

        const originalPrice =
            parseFloat(
                priceElement.dataset.price
            );

        if (isNaN(originalPrice)) {
            return;
        }

        priceElement.textContent =
            formatPrice(
                originalPrice,
                currency
            );

    });

    updateCartDisplay();

}


/* =========================
   CURRENCY SELECTOR
========================= */

if (currencySelector) {

    const savedCurrency =
        localStorage.getItem(
            "gameVaultCurrency"
        );

    if (savedCurrency) {

        currencySelector.value =
            savedCurrency;

    }

    currencySelector.addEventListener(
        "change",
        () => {

            localStorage.setItem(
                "gameVaultCurrency",
                currencySelector.value
            );

            updatePrices();

            updateCartSummary();

            updateCheckoutSummary();

            updateCheckoutTotal();

            renderCheckout();

            renderGameDetails();

        }
    );

}


/* =========================
   SEARCH
========================= */

function createGameSlug(gameName) {

    return gameName
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );

}


function performSearch() {

    if (
        !searchInput ||
        !searchResults
    ) {

        return;

    }

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    searchResults.innerHTML = "";
    
    if (!query) {

    const gameCards =
        document.querySelectorAll(
            ".game-grid .game-card"
        );

    gameCards.forEach(card => {
        card.style.display = "";
    });

    searchResults.classList.remove(
        "active"
    );

    return;

}

    const matches =
        allGames.filter(game => {

            const gameName =
                game.name.toLowerCase();

            const category =
                game.category.toLowerCase();

            return (
                gameName.includes(query) ||
                category.includes(query)
            );

        });

    const gameCards =
    document.querySelectorAll(
        ".game-grid .game-card"
    );
    
    gameCards.forEach(card => {
        
        const title =
        card.querySelector("h3");
        
        const category =
        card.dataset.category ||
        card.querySelector(
            ".game-category"
        )?.textContent
            .trim()
            .toUpperCase();
            
            if (!title) {
                return;
    }
    
    const gameName =
        title.textContent
            .trim()
            .toLowerCase();

    const matchesSearch =
    
    gameName.includes(query) ||
    category === query.toUpperCase();
        
        card.style.display =
        matchesSearch
            ? ""
            : "none";
        
        });

    if (matches.length === 0) {

        searchResults.innerHTML = `

            <div class="search-no-results">
                NO GAMES FOUND
            </div>

        `;

        searchResults.classList.add(
            "active"
        );

        return;

    }

    matches.forEach(game => {

        const result =
            document.createElement(
                "div"
            );

        result.className =
            "search-result-item";

        result.innerHTML = `

            <span>
                ${game.name}
            </span>

            <small>
                ${game.category}
            </small>

        `;

        result.addEventListener(
            "click",
            () => {

                const gameSlug =
                    createGameSlug(
                        game.name
                    );
                    
                    window.location.href = `games.html?search=${encodeURIComponent(game.name)}#explore-games`;

            }
        );

        searchResults.appendChild(
            result
        );

    });

    searchResults.classList.add(
        "active"
    );

}


/* =========================
   SEARCH EVENTS
========================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        performSearch
    );

    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch();

            }

        }
    );

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            if (!searchInput) {
                return;
            }

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            if (query) {

                window.location.href =
                    `games.html?search=${encodeURIComponent(query)}`;

            }

        }
    );

}


/* =========================
   CLOSE SEARCH RESULTS
========================= */

document.addEventListener(
    "click",
    event => {

        if (
            searchResults &&
            !event.target.closest(
                ".search-box"
            )
        ) {

            searchResults.classList.remove(
                "active"
            );

        }

    }
);


/* =========================
   CATEGORY FILTERS
========================= */

function setupCategoryFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );

    const gameCards =
        document.querySelectorAll(
            ".game-grid .game-card"
        );

    if (!filterButtons.length) {
        return;
    }

    filterButtons.forEach(button => {

        if (!button.dataset.filter) {

            button.dataset.filter =
                button.textContent
                    .trim()
                    .toUpperCase();

        }

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );

                const filter =
                    button.dataset.filter
                        .toUpperCase();

                gameCards.forEach(card => {

                    const category =
                        card.dataset.category ||
                        card.querySelector(
                            ".game-category"
                        )?.textContent
                            .trim()
                            .toUpperCase();

                    if (
                        filter === "ALL" ||
                        category === filter
                    ) {

                        card.style.display =
                            "";

                    } else {

                        card.style.display =
                            "none";

                    }

                });

            }
        );

    });

}


/* =========================
   GAME CARDS
========================= */

function setupGameCards() {

    const gameCards =
        document.querySelectorAll(
            ".game-card"
        );

    gameCards.forEach(card => {

        if (!card.dataset.category) {

            const category =
                card.querySelector(
                    ".game-category"
                );

            if (category) {

                card.dataset.category =
                    category.textContent
                        .trim()
                        .toUpperCase();

            }

        }

        const price =
            card.querySelector(
                ".game-price"
            );

        if (
            price &&
            !price.dataset.price
        ) {

            const gameTitle =
                card.querySelector(
                    "h3"
                )?.textContent.trim();

            const game =
                allGames.find(
                    item =>
                        item.name ===
                        gameTitle
                );

            if (game) {

                price.dataset.price =
                    game.price;

            }

        }

    });

}


/* =========================
   GAME DETAILS LINKS
========================= */

function setupGameDetailsLinks() {

    const gameCards =
        document.querySelectorAll(
            ".game-card"
        );

    gameCards.forEach(card => {

        const overlay =
            card.querySelector(
                ".game-overlay"
            );

        const title =
            card.querySelector(
                "h3"
            );

        if (!overlay || !title) {
            return;
        }

        if (
            overlay.tagName.toLowerCase() ===
            "a"
        ) {

            return;

        }

        const gameName =
            title.textContent.trim();

        const gameSlug =
            createGameSlug(
                gameName
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            `game.html?game=${gameSlug}`;

        link.className =
            overlay.className;

        link.textContent =
            overlay.textContent.trim();

        overlay.replaceWith(
            link
        );

    });

}


/* =========================
   GAME DETAILS PAGE
========================= */

function renderGameDetails() {

    const gameDetails =
        document.getElementById(
            "gameDetails"
        );

    if (!gameDetails) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const gameSlug =
        params.get("game");

    if (!gameSlug) {

        gameDetails.innerHTML = `

            <div class="empty-cart">

                <p class="section-label">
                    GAMEVAULT
                </p>

                <h2>
                    GAME NOT FOUND
                </h2>

                <p>
                    No game was selected.
                </p>

                <a
                    href="games.html"
                    class="primary-btn"
                >
                    BACK TO GAMES
                </a>

            </div>

        `;

        return;

    }

    const game =
        allGames.find(item => {

            return (
                createGameSlug(
                    item.name
                ) === gameSlug
            );

        });

    if (!game) {

        gameDetails.innerHTML = `

            <div class="empty-cart">

                <p class="section-label">
                    GAMEVAULT
                </p>

                <h2>
                    GAME NOT FOUND
                </h2>

                <p>
                    We couldn't find that game.
                </p>

                <a
                    href="games.html"
                    class="primary-btn"
                >
                    BACK TO GAMES
                </a>

            </div>

        `;

        return;

    }

    const currency =
        getCurrentCurrency();

    const displayPrice =
        formatPrice(
            game.price,
            currency
        );

    const isInCart =
        cart.some(
            item =>
                item.name ===
                game.name
        );

    gameDetails.innerHTML = `

        <div class="game-details-image">

            <img
                src="${game.image}"
                alt="${game.name}"
            >

        </div>

        <div class="game-details-info">

            <p class="game-category">
                ${game.category}
            </p>

            <h1>
                ${game.name}
            </h1>

            <p class="game-details-description">
                ${game.description}
            </p>

            <p
                class="game-price game-details-price"
                data-price="${game.price}"
            >
                ${displayPrice}
            </p>

            <button
                class="add-cart-btn game-details-cart-btn"
                data-game="${game.name}"
                data-price="${game.price}"
            >
                ${isInCart ? "IN CART" : "ADD TO CART"}
            </button>

            <a
                href="games.html"
                class="secondary-btn"
            >
                BACK TO GAMES
            </a>

        </div>

    `;

    const addButton =
        gameDetails.querySelector(
            ".add-cart-btn"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                const alreadyInCart =
                    cart.some(
                        item =>
                            item.name ===
                            game.name
                    );

                if (alreadyInCart) {

                    addButton.textContent =
                        "IN CART";

                    return;

                }

                cart.push({

                    name: game.name,

                    price: game.price

                });

                saveCart();

                addButton.textContent =
                    "ADDED ✓";

                addButton.classList.add(
                    "added"
                );

                setTimeout(
                    () => {

                        addButton.textContent =
                            "IN CART";

                    },
                    1200
                );

            }
        );

    }

}


/* =========================
   URL CATEGORY FILTER
========================= */

function applyUrlCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    if (!category) {
        return;
    }

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );

    const gameCards =
        document.querySelectorAll(
            ".game-grid .game-card"
        );

    const target =
        category.toUpperCase();

    filterButtons.forEach(button => {

        const filter =
            (
                button.dataset.filter ||
                button.textContent
            )
            .trim()
            .toUpperCase();

        if (filter === target) {

            button.classList.add(
                "active"
            );

        } else {

            button.classList.remove(
                "active"
            );

        }

    });

    gameCards.forEach(card => {

        const cardCategory =
            card.dataset.category
                ?.toUpperCase();

        if (
            cardCategory === target
        ) {

            card.style.display = "";

        } else {

            card.style.display =
                "none";

        }

    });

}


/* =========================
   URL SEARCH
========================= */

function applyUrlSearch() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const query =
        params.get("search");

    if (!query) {
        return;
    }

    const search =
        query.toLowerCase();

    const gameCards =
        document.querySelectorAll(
            ".game-grid .game-card"
        );

    gameCards.forEach(card => {

        const title =
            card.querySelector("h3");

        if (!title) {
            return;
        }

        const gameName =
            title.textContent
                .trim()
                .toLowerCase();

        if (
            gameName.includes(search)
        ) {

            card.style.display = "";

        } else {

            card.style.display =
                "none";

        }

    });

    if (searchInput) {

        searchInput.value =
            query;

    }

}


/* =========================
   ADD TO CART
========================= */

function setupAddToCartButtons() {

    const buttons =
        document.querySelectorAll(
            ".add-cart-btn"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const gameName =
                    button.dataset.game;

                const price =
                    parseFloat(
                        button.dataset.price
                    );

                if (
                    !gameName ||
                    isNaN(price)
                ) {

                    return;

                }

                const alreadyInCart =
                    cart.some(
                        item =>
                            item.name ===
                            gameName
                    );

                if (alreadyInCart) {

                    button.textContent =
                        "IN CART";

                    return;

                }

                cart.push({

                    name: gameName,

                    price: price

                });

                saveCart();

                button.textContent =
                    "ADDED ✓";

                button.classList.add(
                    "added"
                );

                setTimeout(
                    () => {

                        button.textContent =
                            "IN CART";

                    },
                    1200
                );

                updateCartDisplay();

            }
        );

    });

}


/* =========================
   CART DISPLAY
========================= */

function updateCartDisplay() {

    updateCartCount();

    if (
        document.getElementById(
            "cartItems"
        )
    ) {

        renderCart();

    }

}


/* =========================
   RENDER CART
========================= */

function renderCart() {

    const cartItems =
        document.getElementById(
            "cartItems"
        );

    if (!cartItems) {
        return;
    }

    const currency =
        getCurrentCurrency();

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <p class="section-label">
                    CART STATUS
                </p>

                <h3>
                    YOUR CART IS EMPTY.
                </h3>

                <p>
                    You haven't added any games yet.
                </p>

                <a
                    href="games.html"
                    class="primary-btn"
                >
                    EXPLORE GAMES
                </a>

            </div>

        `;

        updateCartSummary();

        return;

    }

    cart.forEach(
        (item, index) => {

            const displayPrice =
                formatPrice(
                    item.price,
                    currency
                );

            const gameData =
                allGames.find(
                    game =>
                        game.name ===
                        item.name
                );

            const category =
                gameData
                    ? gameData.category
                    : "GAME";

            const cartItem =
                document.createElement(
                    "div"
                );

            cartItem.className =
                "cart-item";

            cartItem.innerHTML = `

                <div class="cart-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ${category}
                    </p>

                </div>

                <div class="cart-item-price">
                    ${displayPrice}
                </div>

                <button
                    class="remove-cart-btn"
                    data-index="${index}"
                >
                    REMOVE
                </button>

            `;

            cartItems.appendChild(
                cartItem
            );

        }
    );

    document
        .querySelectorAll(
            ".remove-cart-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        parseInt(
                            button.dataset.index
                        );

                    cart.splice(
                        index,
                        1
                    );

                    saveCart();

                    renderCart();

                }
            );

        });

    updateCartSummary();

}


/* =========================
   CART SUMMARY
========================= */

function updateCartSummary() {

    const itemCount =
        document.getElementById(
            "cartItemCount"
        );

    const subtotal =
        document.getElementById(
            "cartSubtotal"
        );

    const total =
        document.getElementById(
            "cartTotal"
        );

    if (
        !itemCount &&
        !subtotal &&
        !total
    ) {

        return;

    }

    const currency =
        getCurrentCurrency();

    const cartTotal =
        cart.reduce(
            (sum, item) =>
                sum + item.price,
            0
        );

    const displayTotal =
        formatPrice(
            cartTotal,
            currency
        );

    if (itemCount) {

        itemCount.textContent =
            cart.length;

    }

    if (subtotal) {

        subtotal.textContent =
            displayTotal;

    }

    if (total) {

        total.textContent =
            displayTotal;

    }

}


/* =========================
   CHECKOUT SUMMARY
========================= */

function updateCheckoutSummary() {

    const itemCount =
        document.getElementById(
            "checkoutItemCount"
        );

    const subtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    if (
        !itemCount &&
        !subtotal
    ) {

        return;

    }

    const currency =
        getCurrentCurrency();

    const cartTotal =
        cart.reduce(
            (sum, item) =>
                sum + item.price,
            0
        );

    const displayTotal =
        formatPrice(
            cartTotal,
            currency
        );

    if (itemCount) {

        itemCount.textContent =
            cart.length;

    }

    if (subtotal) {

        subtotal.textContent =
            displayTotal;

    }

}


/* =========================
   CHECKOUT
========================= */

function renderCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    if (!checkoutItems) {

        updateCheckoutSummary();

        return;

    }

    const currency =
        getCurrentCurrency();

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="empty-cart">

                <h3>
                    YOUR CART IS EMPTY.
                </h3>

                <p>
                    Add a game before checking out.
                </p>

                <a
                    href="games.html"
                    class="primary-btn"
                >
                    BROWSE GAMES
                </a>

            </div>

        `;

        updateCheckoutSummary();

        updateCheckoutTotal();

        return;

    }

    cart.forEach(item => {

        const displayPrice =
            formatPrice(
                item.price,
                currency
            );

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "checkout-item";

        row.innerHTML = `

            <span>
                ${item.name}
            </span>

            <strong>
                ${displayPrice}
            </strong>

        `;

        checkoutItems.appendChild(
            row
        );

    });

    updateCheckoutSummary();

    updateCheckoutTotal();

}


/* =========================
   CHECKOUT TOTAL
========================= */

function updateCheckoutTotal() {

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    if (!checkoutTotal) {
        return;
    }

    const currency =
        getCurrentCurrency();

    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.price,
            0
        );

    const displayTotal =
        formatPrice(
            total,
            currency
        );

    checkoutTotal.textContent =
        displayTotal;

}


/* =========================
   PLACE ORDER
========================= */

function setupCheckout() {

    const checkoutForm =
        document.getElementById(
            "checkoutForm"
        );

    const placeOrderBtn =
        document.getElementById(
            "payNowBtn"
        );

    if (
        !checkoutForm ||
        !placeOrderBtn
    ) {

        return;

    }

    checkoutForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const firstName =
                document
                    .getElementById(
                        "firstName"
                    )
                    ?.value
                    .trim();

            const lastName =
                document
                    .getElementById(
                        "lastName"
                    )
                    ?.value
                    .trim();

            const email =
                document
                    .getElementById(
                        "email"
                    )
                    ?.value
                    .trim();

            const phone =
                document
                    .getElementById(
                        "phone"
                    )
                    ?.value
                    .trim();

            const country =
                document
                    .getElementById(
                        "country"
                    )
                    ?.value;

            const address =
                document
                    .getElementById(
                        "address"
                    )
                    ?.value
                    .trim();

            const city =
                document
                    .getElementById(
                        "city"
                    )
                    ?.value
                    .trim();

            const postalCode =
                document
                    .getElementById(
                        "postalCode"
                    )
                    ?.value
                    .trim();

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }

            if (
                !firstName ||
                !lastName ||
                !email ||
                !phone ||
                !country ||
                !address ||
                !city ||
                !postalCode
            ) {

                alert(
                    "Please complete all your details before placing the order."
                );

                return;

            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailPattern.test(
                    email
                )
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }

            const fullName =
                `${firstName} ${lastName}`;

            placeOrderBtn.disabled =
                true;

            placeOrderBtn.textContent =
                "CONNECTING...";

            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/create-payment",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        fullName,

                                    email,

                                    phone,

                                    country,

                                    address,

                                    city,

                                    postalCode,

                                    currency:
                                        getCurrentCurrency(),

                                    items:
                                        cart.map(
                                            item => ({

                                                name:
                                                    item.name,

                                                quantity:
                                                    item.quantity ||
                                                    1

                                            })
                                        )

                                })
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    data.status !==
                        "success"
                ) {

                    throw new Error(
                        data.message ||
                        "Payment could not be created."
                    );

                }

                if (!data.payment_link) {

                    throw new Error(
                        "Payment link was not returned by the server."
                    );

                }

                window.location.href =
                    data.payment_link;

            } catch (error) {

                console.error(
                    "Payment error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to connect to the payment provider. Please try again."
                );

                placeOrderBtn.disabled =
                    false;

                placeOrderBtn.textContent =
                    "PAY NOW";

            }

        }
    );

}


/* =========================
   CHECKOUT BUTTON
========================= */

function setupCheckoutButton() {

    const checkoutBtn =
        document.getElementById(
            "checkoutBtn"
        );

    if (!checkoutBtn) {
        return;
    }

    checkoutBtn.addEventListener(
        "click",
        event => {

            if (cart.length === 0) {

                event.preventDefault();

                alert(
                    "Your cart is empty."
                );

            }

        }
    );

}




/* =========================
   INITIALIZATION
========================= */

async function initializeGameVault() {

    setupGameCards();

    setupGameDetailsLinks();

    setupCategoryFilters();

    applyUrlCategory();

    applyUrlSearch();

    setupAddToCartButtons();

    setupCheckout();

    setupCheckoutButton();

    updateCartCount();

    updateCartDisplay();

    renderGameDetails();

    await loadExchangeRates();

    if (currencySelector) {

        const savedCurrency =
            localStorage.getItem(
                "gameVaultCurrency"
            );

        if (savedCurrency) {

            currencySelector.value =
                savedCurrency;

        }

    }

    updatePrices();

    updateCartSummary();

    updateCheckoutSummary();

    updateCheckoutTotal();

    renderCheckout();

    renderGameDetails();

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeGameVault
);


/* =========================
   RESET CHECKOUT BUTTON
   AFTER BACK/FORWARD
========================= */

window.addEventListener(
    "pageshow",
    () => {

        const payNowBtn =
            document.getElementById(
                "payNowBtn"
            );

        if (!payNowBtn) {
            return;
        }

        payNowBtn.disabled = false;

        payNowBtn.textContent =
            "PAY NOW";

    }
);

const workstationViews =
    document.querySelectorAll(
        ".workstation-view"
    );

let workstationScreen = 0;

setInterval(() => {

    if (!workstationViews.length) {
        return;
    }

    workstationViews[
        workstationScreen
    ].classList.remove(
        "workstation-library"
    );

    workstationScreen =
        (workstationScreen + 1) %
        workstationViews.length;

    workstationViews[
        workstationScreen
    ].classList.add(
        "workstation-library"
    );

}, 5000);