// Discrete navigation for gallery sliders.
//
// The slider itself is pure CSS: a horizontally scrolling flex row with scroll
// snapping. That serves a swipe well, but leaves anyone on a mouse with no way
// to move exactly one picture, and a scroll gesture can come to rest between
// two of them.
//
// The controls are injected here rather than rendered server-side so that a
// browser without JavaScript keeps the plain scrollable slider instead of
// buttons that would do nothing.

function slideWidth(gallery) {
	const figure = gallery.querySelector("figure");
	return figure ? figure.getBoundingClientRect().width : gallery.clientWidth;
}

function currentSlide(gallery) {
	const width = slideWidth(gallery);
	return width ? Math.round(gallery.scrollLeft / width) : 0;
}

// Scrolling by index rather than by offset, so repeated presses cannot drift
// away from a slide boundary.
//
// The position is set outright instead of animated. A smooth scroll here is
// not reliably observable: it depends on the browser actually running scroll
// animations, and where it does not, the button does nothing at all rather
// than jumping. Snapping already makes the movement read as one step.
function goToSlide(gallery, index) {
	const count = gallery.querySelectorAll("figure").length;
	const target = Math.min(Math.max(index, 0), count - 1);
	gallery.scrollLeft = target * slideWidth(gallery);
}

function step(gallery, direction) {
	goToSlide(gallery, currentSlide(gallery) + direction);
}

function addNavigation(gallery) {
	const slides = gallery.querySelectorAll("figure").length;
	// A single picture is not a slider.
	if (slides < 2) {
		return;
	}

	const button = (name, label) => {
		const element = document.createElement("button");
		element.type = "button";
		element.className = "gallery_nav_button gallery_nav_" + name;
		element.setAttribute("aria-label", label);
		return element;
	};

	const previous = button("prev", "Previous image");
	const next = button("next", "Next image");

	const nav = document.createElement("div");
	nav.className = "gallery_nav";
	nav.append(previous, next);

	// After the overlay so the buttons sit above the counter and the dots,
	// before the slides so it does not add a scroll position of its own.
	gallery.insertBefore(nav, gallery.querySelector("figure"));

	const syncEnabled = () => {
		const index = currentSlide(gallery);
		previous.disabled = index <= 0;
		next.disabled = index >= slides - 1;
	};

	// Refreshed right after moving rather than only from the scroll event.
	// Setting scrollLeft is not guaranteed to deliver one - where it does not,
	// the buttons would keep the state they had on load and the first press
	// would leave "previous" disabled forever.
	const move = (direction) => {
		step(gallery, direction);
		syncEnabled();
	};

	previous.addEventListener("click", () => move(-1));
	next.addEventListener("click", () => move(1));

	// Swiping and sideways scrolling still have to update the buttons.
	gallery.addEventListener("scroll", syncEnabled, { passive: true });
	syncEnabled();

	// Arrow keys work once one of the buttons has focus; the event bubbles
	// from the button up to the gallery.
	gallery.addEventListener("keydown", (event) => {
		if (event.key === "ArrowLeft") {
			move(-1);
			event.preventDefault();
		} else if (event.key === "ArrowRight") {
			move(1);
			event.preventDefault();
		}
	});
}

window.addEventListener("load", () => {
	document.querySelectorAll(".gallery").forEach(addNavigation);
});
