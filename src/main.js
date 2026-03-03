import gsap from "gsap";
import Lenis from '@studio-freight/lenis';
import { initLoader } from "./animations/loader.js";
import { loadArticle, loadArticleLists } from "./articleLoader.js";

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Reading Progress Bar Logic
    const readingProgressBar = document.querySelector('.reading-progress-bar');
    if (readingProgressBar) {
        lenis.on('scroll', (e) => {
            // e.progress gives a 0 to 1 value for the scroll progress
            readingProgressBar.style.width = `${e.progress * 100}%`;
        });
    }



    // Initialize the GSAP Loader Timeline if on the index page
    if (document.querySelector('.preloader-counter')) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        lenis.stop();
        initLoader(lenis);
    }

    if (document.body.classList.contains('article-page')) {
        loadArticle();
    }

    // Load dynamic lists on index and archive pages
    loadArticleLists();
});