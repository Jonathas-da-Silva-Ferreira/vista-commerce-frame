import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Why: React Router does NOT reset the scroll position between routes. Without
// this side-effect a user landing on a long product page and clicking a header
// link would arrive halfway down the next view, which reads as a "broken" jump
// and contributes to the perception of a flash/layout shift during navigation.
// Keeping this as a tiny mounted-once component (returns null) means it has
// zero render cost and runs purely as an effect tied to pathname changes.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // `instant` (default) avoids smooth-scroll animations that would otherwise
    // overlap with the new page's mount transition and feel sluggish.
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
