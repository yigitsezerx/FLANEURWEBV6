import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

export function initLoader() {
    gsap.registerPlugin(SplitText);
    gsap.registerPlugin(CustomEase);
    CustomEase.create("hop", "0.9, 0, 0.1, 1")

    const splitText = (selector, type, className) => {
        return SplitText.create(selector, {
            type: type,
            [`${type}Class`]: className,
            mask: type,
        });
    };

    const headerSplit = splitText(".header h1", "chars", "char");
    const navSplit = splitText(".nav-links a", "words", "word");
    const footerSplit = splitText(".hero-footer a", "words", "word");

    const counterProgress = document.querySelector(".preloader-counter h1");
    const counterContainer = document.querySelector(".preloader-counter");
    const progressBar = document.querySelector(".progress-bar");
    const counter = { value: 0 };

    const tl = gsap.timeline();

    tl.to(counter, {
        value: 100,
        duration: 3,
        ease: "power3.out",

        onUpdate: () => {
            if (counterProgress) counterProgress.textContent = Math.round(counter.value);
        },

        onComplete: () => {
            if (!counterProgress) return;
            gsap.to(counterContainer, {
                opacity: 0,
                duration: 0.75,
                ease: "power3.out",
                delay: 0.5,
                onComplete: () => {
                    if (counterContainer) counterContainer.remove();
                },
            });
        },
    });

    if (counterContainer) {
        tl.to(counterContainer, {
            scale: 1,
            duration: 3,
            ease: "power3.out",
        }, "<");
    }

    if (progressBar) {
        tl.to(progressBar, {
            scaleX: 1,
            duration: 3,
            ease: "power3.out",
        }, "<");
    }

    tl.to(".hero-bg", {
        clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
        duration: 1.5,
        ease: "hop",
    }, 4.5);

    tl.to(".hero-bg img", {
        scale: 1.5,
        duration: 1.5,
        ease: "hop",
    }, "<");

    tl.to(".hero-bg", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 2,
        ease: "hop",
    }, 6);

    tl.to(".hero-bg img", {
        scale: 1,
        duration: 2,
        ease: "hop",
    }, 6);

    tl.to(".progress", {
        scaleX: 1,
        duration: 2,
        ease: "hop",
    }, 6);

    if (progressBar) {
        tl.to(progressBar, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
        }, 6.5);
    }

    tl.to(".hero-logo", {
        opacity: 1,
        y: 0,
        duration: 2,
        ease: "power4.out",
    }, 6.5);

    tl.to("nav a .word", {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
    }, 7.5);
}
