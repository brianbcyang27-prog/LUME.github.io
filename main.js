/* =========================
   HERO SLIDER (slide-left)
========================= */
const heroImages = [
  "Image/landscape/1.png",
  "Image/landscape/2.png",
  "Image/landscape/3.png",
  "Image/landscape/4.png",
  "Image/landscape/5.png"
];

let currentHeroIndex = 0;
let heroTimer = null;

function initHeroSlider(){
  const track = document.getElementById("hero-track");
  const dotsWrap = document.getElementById("hero-dots");
  const slider = document.getElementById("hero-slider");
  if (!track || !dotsWrap || !slider) return;

  // build slides
  track.innerHTML = "";
  heroImages.forEach((src) => {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.innerHTML = `<img src="${src}" alt="Hero slide">`;
    track.appendChild(slide);
  });

  // build dots
  dotsWrap.innerHTML = "";
  heroImages.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "hero-dot";
    b.type = "button";
    b.dataset.index = String(i);
    b.addEventListener("click", () => goToHero(i, true));
    dotsWrap.appendChild(b);
  });

  // initial
  updateHeroDots();
  applyHeroTransform(false);

  // autoplay
  resetHeroTimer();
}

function applyHeroTransform(animate=true){
  const track = document.getElementById("hero-track");
  if (!track) return;
  if (!animate) track.style.transition = "none";
  else track.style.transition = "";

  track.style.transform = `translateX(-${currentHeroIndex * 100}%)`;

  if (!animate) {
    requestAnimationFrame(() => { track.style.transition = ""; });
  }
}

function updateHeroDots(){
  const dots = document.querySelectorAll("#hero-dots .hero-dot");
  dots.forEach((d, i) => {
    d.classList.remove("active","inactive");
    if (i === currentHeroIndex) d.classList.add("active");
    else d.classList.add("inactive");
  });
}

function goToHero(index, user=true){
  currentHeroIndex = index;
  updateHeroDots();
  applyHeroTransform(true);
  if (user) resetHeroTimer();
}

function autoPlayHero(){
  const slider = document.getElementById("hero-slider");
  if (!slider) return;
  const next = (currentHeroIndex + 1) % heroImages.length;
  goToHero(next, false);
}

function resetHeroTimer(){
  const slider = document.getElementById("hero-slider");
  if (!slider) return;
  clearInterval(heroTimer);
  heroTimer = setInterval(autoPlayHero, 3500);
}

/* =========================
   FEATURED DRINKS (WHEEL)
========================= */
const drinks = [
  { id: 0, name: "Mango Passion Blast", description: "A tropical explosion of fresh crushed mango, passionfruit seeds, and a hint of mint served over ice.", image: "Image/rm bg/Mango Passion Blast.png" },
  { id: 1, name: "Berry Taro Dream", description: "Creamy taro blended to perfection, topped with sweet berry drizzle, whipped cream, and fresh grapes.", image: "Image/rm bg/Berry Taro Dream.png" },
  { id: 2, name: "Citrus Mango Crush", description: "Zesty lime and sweet mango chunks crushed with ice for the ultimate sweet-and-sour refreshment.", image: "Image/rm bg/Citrus Mango Crush.png" },
  { id: 3, name: "Strawberry Sunset", description: "Vibrant strawberries, fresh orange slices, and passionfruit layered perfectly in an iced cooler.", image: "Image/rm bg/Strawberry Sunset.png" },
  { id: 4, name: "Blue Ocean Fizz", description: "A cool, bubbly blue curacao treat featuring fresh blueberries, pineapple chunks, and a slice of lime.", image: "Image/rm bg/Blue Ocean Fizz.png" },
  { id: 5, name: "The Green Oasis", description: "A crisp and revitalizing blend of green apple, cool cucumber, and a splash of freshly squeezed lime.", image: "Image/rm bg/The Green Oasis.png" },
  { id: 6, name: "Watermelon Frost Oasis", description: "An icy, thirst-quenching watermelon slushie, perfectly sweetened to beat the summer heat.", image: "Image/rm bg/Watermelon Frost Oasis.png" },
  { id: 7, name: "Zesty Lime Cooler", description: "A sharp, invigorating blast of freshly squeezed lime and mint, sparkling with every sip.", image: "Image/rm bg/Zesty Lime Cooler.png" },
  { id: 8, name: "The Classic Boba", description: "Our signature rich black tea mixed with velvety milk and sweet, chewy tapioca pearls.", image: "Image/rm bg/The Classic Boba.png" },
  { id: 9, name: "Matcha Cloud Macchiato", description: "Earthy, premium matcha layered over cold milk and crowned with a sweet, fluffy cloud foam.", image: "Image/rm bg/Matcha Cloud Macchiato.png" },
  { id: 10, name: "The Peachy Keen Cooler", description: "Sweet, juicy peach flavors mixed with iced tea for a perfectly balanced, fruity sip.", image: "Image/rm bg/The Peachy Keen Cooler.png" },
];

let currentIndex = 0;
const VISIBLE_COUNT = 7;
const ITEM_H = 54;
const HALF = Math.floor(VISIBLE_COUNT / 2);

let autoplayTimer = null;
const AUTOPLAY_MS = 2500;

let wheelAccumulator = 0;
let wheelCooldown = false;
const WHEEL_THRESHOLD = 170;
const WHEEL_COOLDOWN_MS = 230;

let wheelAnimating = false;
const WHEEL_ANIM_MS = 420;

function mod(n, m) { return ((n % m) + m) % m; }

function getDirection(newIndex) {
  const n = drinks.length;
  const forwardSteps = (newIndex - currentIndex + n) % n;
  const backwardSteps = (currentIndex - newIndex + n) % n;
  return forwardSteps <= backwardSteps ? "forward" : "back";
}

function initFeatured() {
  const mainImg = document.getElementById("main-drink-img");
  const titleEl = document.getElementById("drink-title");
  const descEl = document.getElementById("drink-desc");

  const wheelEl = document.getElementById("name-wheel");
  const wheelClip = document.getElementById("wheel-clip");
  const wheelUpBtn = document.getElementById("wheel-up");
  const wheelDownBtn = document.getElementById("wheel-down");

  const thumbStrip = document.getElementById("thumb-strip");
  const thumbTrack = document.getElementById("thumb-track");

  if (!mainImg || !titleEl || !descEl || !wheelEl || !wheelClip || !thumbStrip || !thumbTrack) return;

  function renderThumbs() {
    thumbTrack.innerHTML = "";
    drinks.forEach((drink, index) => {
      const item = document.createElement("div");
      item.className = "thumb-item";
      item.id = `thumbItem-${index}`;

      const img = document.createElement("img");
      img.src = drink.image;
      img.alt = drink.name;

      item.appendChild(img);
      item.onclick = () => {
        stopAutoplayTemporarily();
        updateDisplay(index);
      };

      thumbTrack.appendChild(item);
    });
  }

  function setActiveThumb(index) {
    drinks.forEach((_, i) => {
      const el = document.getElementById(`thumbItem-${i}`);
      if (!el) return;
      if (i === index) el.classList.add("active");
      else el.classList.remove("active");
    });
  }

  function centerThumb(index) {
    const stripRect = thumbStrip.getBoundingClientRect();
    const item = document.getElementById(`thumbItem-${index}`);
    if (!item) return;

    const itemRect = item.getBoundingClientRect();
    const targetCenterX = stripRect.left + stripRect.width / 2;
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const delta = targetCenterX - itemCenterX;

    const current = getComputedStyle(thumbTrack).transform;
    let currentX = 0;
    if (current && current !== "none") {
      const parts = current.match(/matrix\((.+)\)/);
      if (parts) currentX = parseFloat(parts[1].split(", ")[4]);
    }

    thumbTrack.style.transform = `translateX(${currentX + delta}px)`;
  }

  function renderNameWheel(activeIndex, { animate = true } = {}) {
    if (!animate) {
      wheelClip.innerHTML = "";
      buildWheelItems(activeIndex);
      return;
    }
    if (wheelAnimating) return;
    wheelAnimating = true;

    const oldItems = Array.from(wheelClip.children);
    oldItems.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px) scale(0.98)";
    });

    setTimeout(() => {
      wheelClip.innerHTML = "";
      buildWheelItems(activeIndex);

      const newItems = Array.from(wheelClip.children);
      newItems.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(-10px) scale(0.98)";
      });

      requestAnimationFrame(() => {
        newItems.forEach((el) => {
          el.style.opacity = "";
          el.style.transform = "";
        });
      });

      setTimeout(() => { wheelAnimating = false; }, WHEEL_ANIM_MS);
    }, 120);
  }

  function buildWheelItems(activeIndex) {
    for (let pos = -HALF; pos <= HALF; pos++) {
      const idx = mod(activeIndex + pos, drinks.length);
      const isActive = (pos === 0);

      const dist = Math.abs(pos);
      const opacity = dist === 0 ? 1 : dist === 1 ? 0.85 : dist === 2 ? 0.65 : 0.45;
      const scale = dist === 0 ? 1.0 : dist === 1 ? 0.96 : dist === 2 ? 0.92 : 0.88;

      const item = document.createElement("button");
      item.type = "button";
      item.className = "wheel-item absolute left-0 w-full text-left flex items-center gap-3";
      item.style.top = `${(pos + HALF) * ITEM_H}px`;
      item.style.opacity = opacity;
      item.style.transform = `scale(${scale})`;

      item.onclick = () => {
        stopAutoplayTemporarily();
        updateDisplay(idx);
      };

      item.innerHTML = `
        <div class="w-4 h-4 rotate-45 ${isActive ? "bg-[#e04f43]" : "bg-[#1a1a1a]"}"></div>
        <span class="${isActive ? "text-white" : "text-black"} ${isActive ? "text-2xl" : "text-xl"} font-bold tracking-wide">
          ${drinks[idx].name}
        </span>
      `;

      if (isActive) {
        item.style.padding = "6px 10px";
        item.style.borderRadius = "10px";
        item.style.background = "rgba(0,0,0,0.18)";
        item.style.backdropFilter = "blur(2px)";
      }

      wheelClip.appendChild(item);
    }
  }

  function updateDisplay(index, opts = { animate: true }) {
    const dir = getDirection(index);
    currentIndex = index;
    const selected = drinks[index];

    renderNameWheel(index, { animate: opts.animate });
    setActiveThumb(index);
    setTimeout(() => centerThumb(index), 0);

    if (!opts.animate) {
      mainImg.src = selected.image;
      titleEl.textContent = selected.name;
      descEl.textContent = selected.description;
      return;
    }

    mainImg.classList.remove("drink-exit-left","drink-exit-right","drink-enter-from-left","drink-enter-from-right");
    if (dir === "forward") mainImg.classList.add("drink-exit-left");
    else mainImg.classList.add("drink-exit-right");

    setTimeout(() => {
      titleEl.textContent = selected.name;
      descEl.textContent = selected.description;
      mainImg.src = selected.image;

      mainImg.classList.remove("drink-exit-left","drink-exit-right");
      if (dir === "forward") mainImg.classList.add("drink-enter-from-right");
      else mainImg.classList.add("drink-enter-from-left");

      requestAnimationFrame(() => {
        mainImg.classList.remove("drink-enter-from-left","drink-enter-from-right");
      });
    }, 220);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => updateDisplay(mod(currentIndex + 1, drinks.length)), AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  function stopAutoplayTemporarily() {
    stopAutoplay();
    setTimeout(startAutoplay, 4500);
  }
  function step(delta) {
    updateDisplay(mod(currentIndex + delta, drinks.length));
  }

  // init
  renderThumbs();
  updateDisplay(0, { animate: false });
  setActiveThumb(0);
  setTimeout(() => centerThumb(0), 0);
  startAutoplay();

  wheelEl.style.height = `${VISIBLE_COUNT * ITEM_H}px`;
  if (wheelUpBtn) wheelUpBtn.onclick = () => step(-1);
  if (wheelDownBtn) wheelDownBtn.onclick = () => step(1);

  wheelEl.addEventListener("wheel", (e) => {
    e.preventDefault();
    stopAutoplayTemporarily();
    if (wheelCooldown || wheelAnimating) return;

    wheelAccumulator += e.deltaY;
    if (Math.abs(wheelAccumulator) >= WHEEL_THRESHOLD) {
      const d = wheelAccumulator > 0 ? 1 : -1;
      wheelAccumulator = 0;
      wheelCooldown = true;
      step(d);
      setTimeout(() => { wheelCooldown = false; }, WHEEL_COOLDOWN_MS);
    }
  }, { passive: false });

  wheelEl.addEventListener("mouseenter", stopAutoplay);
  wheelEl.addEventListener("mouseleave", startAutoplay);
}

/* =========================
   VALUES (Images & Accordion)
========================= */
function initValues() {
  const accordionContainer = document.getElementById("interactive-accordion");
  if (!accordionContainer) return;

  // Make sure your images are placed in an "aspects" folder inside your "Image" folder!
  const aspectsData = [
    { 
      id: 1, 
      title: "Freshness", 
      description: "We source only the ripest, most vibrant natural ingredients for every cup.", 
      image: "Image/aspects/Freshness & Quality Ingredients.png" 
    },
    { 
      id: 2, 
      title: "Craftsmanship", 
      description: "Every drink is hand-crafted with precision, expertise, and passion.", 
      image: "Image/aspects/Craftsmanship & Expertise.png" 
    },
    { 
      id: 3, 
      title: "Joy", 
      description: "Vibrant, refreshing flavors designed specifically to bring a smile to your face.", 
      image: "Image/aspects/Joy & Refreshment.png" 
    },
    { 
      id: 4, 
      title: "Community", 
      description: "Creating a welcoming space to connect, share stories, and make memories.", 
      image: "Image/aspects/Community & Connection.png" 
    },
    { 
      id: 5, 
      title: "Sustainability", 
      description: "Committed to eco-friendly practices and respecting the nature that provides for us.", 
      image: "Image/aspects/Sustainability & Nature.png" 
    }
  ];

  function renderAccordion() {
    accordionContainer.innerHTML = "";
    
    aspectsData.forEach((aspect, index) => {
      const col = document.createElement("div");
      
      // Tailwind's transition classes for a smooth expand/collapse effect
      col.className = "accordion-item relative h-full flex items-end overflow-hidden border-r-2 border-white last:border-r-0 cursor-pointer transition-all duration-500 ease-in-out group";
      col.style.flex = "1";
      col.style.backgroundImage = `url('${aspect.image}')`;
      col.style.backgroundSize = "cover";
      col.style.backgroundPosition = "center";

      // The inner HTML contains the gradient overlays and text that fade in
      col.innerHTML = `
        <div class="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500" id="grad-${index}"></div>
        <div class="relative z-10 p-8 opacity-0 transition-opacity duration-500 w-full" id="content-${index}">
           <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md tracking-tight whitespace-nowrap">${aspect.title}</h2>
           <p class="text-white/90 text-lg md:text-xl font-medium leading-snug drop-shadow-md hidden md:block opacity-0 transition-opacity duration-300" id="desc-${index}">${aspect.description}</p>
        </div>
      `;

      col.addEventListener("mouseenter", () => expandAccordion(index));
      accordionContainer.appendChild(col);
    });
    
    accordionContainer.addEventListener("mouseleave", resetAccordion);
  }

  function expandAccordion(activeIdx) {
    const cols = accordionContainer.querySelectorAll(".accordion-item");
    cols.forEach((col, idx) => {
      // Expand the active column, shrink the others
      col.style.flex = (idx === activeIdx) ? "4" : "1";
      
      const grad = col.querySelector(`#grad-${idx}`);
      const content = col.querySelector(`#content-${idx}`);
      const desc = col.querySelector(`#desc-${idx}`);

      if (idx === activeIdx) {
        grad.classList.remove("opacity-0");
        content.classList.remove("opacity-0");
        // Slight delay on the description text makes it look very premium
        setTimeout(() => desc.classList.remove("opacity-0", "hidden"), 150);
      } else {
        grad.classList.add("opacity-0");
        content.classList.add("opacity-0");
        desc.classList.add("opacity-0", "hidden");
      }
    });
  }

  function resetAccordion() {
    const cols = accordionContainer.querySelectorAll(".accordion-item");
    cols.forEach((col, idx) => {
      // Reset all columns back to equal width
      col.style.flex = "1";
      
      const grad = col.querySelector(`#grad-${idx}`);
      const content = col.querySelector(`#content-${idx}`);
      const desc = col.querySelector(`#desc-${idx}`);

      grad.classList.add("opacity-0");
      content.classList.add("opacity-0");
      desc.classList.add("opacity-0", "hidden");
    });
  }

  renderAccordion();
}

/* =========================
   MENU PAGE DATA + SEARCH & CART
========================= */
const fullMenuDatabase = [
  { id: 1, name: "Mango Passion Blast", description: "Tropical mango and passionfruit over crushed ice. Bright, sweet, and super refreshing.", image: "Image/rm bg/Mango Passion Blast.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 2, name: "Berry Taro Dream", description: "Creamy taro blended smooth with berry drizzle and fresh grapes—dessert in a cup.", image: "Image/rm bg/Berry Taro Dream.png", category: "Milkshake", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 3, name: "Citrus Mango Crush", description: "Zesty citrus and mango chunks crushed with ice for a sweet-and-sour kick.", image: "Image/rm bg/Citrus Mango Crush.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 4, name: "Strawberry Sunset", description: "Layered strawberry and orange with a bright, juicy finish—light, fruity, and clean.", image: "Image/rm bg/Strawberry Sunset.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 5, name: "Blue Ocean Fizz", description: "Bubbly citrus with blueberries and pineapple for a crisp, ocean-blue sparkle.", image: "Image/rm bg/Blue Ocean Fizz.png", category: "Sparkling", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 6, name: "The Green Oasis", description: "Cool green grape and cucumber freshness with a clean, hydrating taste.", image: "Image/rm bg/The Green Oasis.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 7, name: "Watermelon Frost Oasis", description: "An icy, thirst-quenching watermelon slush, perfectly sweet and freezing cold.", image: "Image/rm bg/Watermelon Frost Oasis.png", category: "Slush", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 8, name: "Zesty Lime Cooler", description: "A sharp, invigorating blast of freshly squeezed lime, mint, and sparkling water.", image: "Image/rm bg/Zesty Lime Cooler.png", category: "Sparkling", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 9, name: "The Classic Boba", description: "Our signature rich black tea mixed with creamy milk and sweet, chewy tapioca pearls.", image: "Image/rm bg/The Classic Boba.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 10, name: "Matcha Cloud Macchiato", description: "Earthy, premium matcha layered with fresh milk and topped with a sweet cloud foam.", image: "Image/rm bg/Matcha Cloud Macchiato.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 11, name: "The Peachy Keen Cooler", description: "Sweet, juicy peach flavors mixed with iced tea for a perfectly balanced summer sip.", image: "Image/rm bg/The Peachy Keen Cooler.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 12, name: "Tropical Fruit Blast", description: "A vibrant medley of chopped tropical fruits steeped in iced green tea.", image: "Image/rm bg/Tropicalfruit.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 13, name: "Taro Smoothie", description: "Rich, nutty taro root blended with ice and milk for a thick, purple delight.", image: "Image/rm bg/tarosmoothie.png", category: "Slush", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 14, name: "Martin's Iced Matcha", description: "A classic iced matcha latte with a deep, robust green tea flavor.", image: "Image/rm bg/Martin Machata.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Refreshing" },
  { id: 15, name: "Strawberry Lime Breeze", description: "Sweet muddled strawberries cut with tart lime juice and sparkling water.", image: "Image/rm bg/Strawberry Lime Breeze.png", category: "Sparkling", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 16, name: "Classic Black Tea", description: "Strong, aromatic black tea brewed to perfection and served ice cold.", image: "Image/rm bg/The Classic Black Tea.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 17, name: "Velvet Ube Swirl", description: "Creamy ube blended with milk for a vibrant purple, sweet, and nutty treat.", image: "Image/rm bg/Velvet Ube Swirl.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 18, name: "Peach Slushy", description: "An ice-blended peach sensation that's sweet, frosty, and incredibly refreshing.", image: "Image/rm bg/Peachslushy.png", category: "Slush", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 19, name: "Chocolate Frappe", description: "A decadent, frosty blend of rich cocoa, milk, and ice, topped with whipped cream.", image: "Image/rm bg/chocolatefrappe.png", category: "Slush", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 20, name: "Dragonfruit Lemonade", description: "Vibrant pink dragonfruit shaken with zesty lemonade for a tropical, tart refreshment.", image: "Image/rm bg/Dragonfruitlemonade.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 21, name: "Matcha Frappuccino", description: "An ice-blended matcha treat, perfectly sweetened and topped with fresh whipped cream.", image: "Image/rm bg/Matchafrappuchino.png", category: "Slush", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 22, name: "Mango Coconut Cloud", description: "Tropical mango pureed with creamy coconut milk for an island getaway in a cup.", image: "Image/rm bg/mangococonut.png", category: "Milkshake", allergyFree: "Nut-Free", likes: "Fruity" },
  { id: 23, name: "Mango Cool Slush", description: "A straightforward, icy mango slush packed with pure, sweet fruit flavor.", image: "Image/rm bg/mangocool.png", category: "Slush", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 24, name: "Brown Sugar Tiger Milk", description: "Warm, caramelized brown sugar swirled with cold milk and chewy boba pearls.", image: "Image/rm bg/Brown Sugar Tiger Milk with Boba.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 25, name: "Iced Caramel Macchiato", description: "Smooth milk and coffee laced with buttery caramel syrup and topped with cream.", image: "Image/rm bg/Icedcaramel.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 26, name: "Layered Strawberry Matcha", description: "A beautiful layered drink featuring fresh strawberry puree, milk, and a hint of matcha.", image: "Image/rm bg/Layered strawberry.png", category: "Milk Tea", allergyFree: "Nut-Free", likes: "Sweet" },
  { id: 27, name: "Strawberry Smoothie", description: "A classic, creamy blend of ripe strawberries, milk, and ice.", image: "Image/rm bg/Strawberrysmoothie.png", category: "Slush", allergyFree: "Nut-Free", likes: "Fruity" },
  { id: 28, name: "Tropical Sunset Tea", description: "A vivid blend of tropical juices layered beautifully over iced tea.", image: "Image/rm bg/Tropical Sunset Tea.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Fruity" },
  { id: 29, name: "Golden Citrus Glow", description: "A radiant, sunny blend of orange, lemon, and iced green tea.", image: "Image/rm bg/Golden Citrus Glow.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Refreshing" },
  { id: 30, name: "Ruby Red Grapefruit Tea", description: "Slightly tart ruby red grapefruit mixed with floral jasmine tea.", image: "Image/rm bg/Ruby Red Grapefruit Tea.png", category: "Fruit Tea", allergyFree: "Dairy-Free", likes: "Refreshing" }
];

let cart = [];
const DEFAULT_PRICE = 5.50; // Using a default price since DB doesn't have prices yet

function initMenuPage() {
  const menuGrid = document.getElementById("menu-grid");
  const searchInput = document.getElementById("search-input");
  const filterPills = document.querySelectorAll(".filter-pill");
  if (!menuGrid) return;

  let currentCategory = "All";
  let searchQuery = "";

  function renderMenu(list) {
    menuGrid.innerHTML = "";
    if (!list.length) {
      menuGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
          <span class="text-6xl mb-4">🧋</span>
          <p class="text-2xl font-bold text-gray-500 text-center">No drinks match your search.</p>
        </div>`;
      return;
    }

    list.forEach(drink => {
      const card = document.createElement("div");
      card.className = "menu-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer";
      card.innerHTML = `
        <div class="bg-gradient-to-b from-gray-100 to-white w-full h-56 flex items-center justify-center p-6 relative overflow-hidden">
          <img src="${drink.image}" alt="${drink.name}" class="w-full h-full object-contain relative z-10 drop-shadow-lg" />
        </div>
        <div class="p-6 flex flex-col flex-1">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-2xl font-extrabold text-[#1a1a1a] leading-tight">${drink.name}</h3>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6 flex-1">${drink.description}</p>
          
          <div class="flex justify-between items-center mt-auto">
            <div class="flex gap-2 flex-wrap">
              <span class="text-[10px] uppercase tracking-wider font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">${drink.category}</span>
              ${drink.allergyFree !== "None" ? `<span class="text-[10px] uppercase tracking-wider font-bold bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100">${drink.allergyFree}</span>` : ''}
            </div>
            
            <button class="add-to-cart-btn bg-[#1a1a1a] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e04f43] transition-colors shadow-md" data-id="${drink.id}">
              <span class="text-xl leading-none block transform translate-y-[-1px]">+</span>
            </button>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });

    // Attach Cart Logic
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const drinkId = parseInt(e.currentTarget.dataset.id);
        const drink = fullMenuDatabase.find(d => d.id === drinkId);
        addToCart(drink);
      });
    });
  }

  function handleFilter() {
    const filtered = fullMenuDatabase.filter(d => {
      const matchCategory = currentCategory === "All" || d.category === currentCategory;
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
    renderMenu(filtered);
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", (e) => {
      filterPills.forEach(p => p.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.dataset.filter;
      handleFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      handleFilter();
    });
  }

  renderMenu(fullMenuDatabase);
}

// Global Toast Function
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="text-green-400 text-xl">✓</span> ${message}`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* =========================
   CART LOGIC
========================= */
function addToCart(drink) {
  const existingItem = cart.find(item => item.id === drink.id);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...drink, qty: 1, price: DEFAULT_PRICE });
  }
  
  updateCartUI();
  showToast(`Added ${drink.name} to order!`);
}

function updateCartUI() {
  const cartList = document.getElementById("cart-items-list");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total-price");
  const cartContainer = document.getElementById("shopping-cart");

  if (!cartList || !cartCount || !cartTotal || !cartContainer) return;

  cartList.innerHTML = "";
  let totalCost = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    totalCost += (item.price * item.qty);
    totalItems += item.qty;

    const li = document.createElement("li");
    li.className = "cart-item-row flex justify-between items-center bg-gray-50 p-2 rounded-lg";
    li.innerHTML = `
      <div class="flex flex-col">
        <span class="text-sm font-bold text-[#1a1a1a]">${item.name}</span>
        <span class="text-xs text-gray-500">$${item.price.toFixed(2)} x ${item.qty}</span>
      </div>
      <button class="cart-item-remove text-red-500 hover:text-red-700 font-bold px-2 py-1" data-index="${index}">×</button>
    `;
    cartList.appendChild(li);
  });

  cartCount.textContent = `(${totalItems})`;
  cartTotal.textContent = totalCost.toFixed(2);

  // Show/Hide Cart Based on items
  if (totalItems > 0) {
    cartContainer.classList.remove("cart-hidden");
  } else {
    cartContainer.classList.add("cart-hidden");
  }

  // Attach remove events
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      cart.splice(idx, 1);
      updateCartUI();
    });
  });
}

/* =========================
   MOBILE MENU (safe nav)
========================= */
function initMobileMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!menuBtn || !closeMenuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("-translate-x-full");
  });

  closeMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.add("-translate-x-full");
  });

  // Close menu automatically when clicking a link
  const menuLinks = mobileMenu.querySelectorAll(".menu-link");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("-translate-x-full");
    });
  });
}

/* =========================
   GLOBAL INITIALIZATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initFeatured();
  initValues();
  initMenuPage();
  initMobileMenu();
});