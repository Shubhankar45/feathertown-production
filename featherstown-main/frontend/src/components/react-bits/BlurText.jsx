import { useEffect, useState, useRef } from "react";

/**
 * BlurText from React Bits
 * High-craft staggered blurred text reveal for hero headlines & section titles
 */
export default function BlurText({
  text = "",
  delay = 50,
  className = "",
  animateBy = "words", // 'words' | 'letters'
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
}) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-2 ${className}`}>
      {elements.map((segment, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            filter: inView ? "blur(0px)" : "blur(10px)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(14px)",
            transitionDelay: `${i * delay}ms`,
          }}
          onTransitionEnd={() => {
            if (i === elements.length - 1 && onAnimationComplete) {
              onAnimationComplete();
            }
          }}
        >
          {segment}
          {animateBy === "words" ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
