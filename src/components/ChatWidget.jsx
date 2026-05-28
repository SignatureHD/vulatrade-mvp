import { useEffect } from "react";

const CHAT_WIDGET_ID = "6a0c4b54a490b94b8e3b6539";

export default function ChatWidget({ pathname }) {
  useEffect(() => {
    if (pathname.startsWith("/b/") || pathname.startsWith("/review/")) {
      const existingScript = document.querySelector(`script[data-widget-id="${CHAT_WIDGET_ID}"]`);
      if (existingScript) existingScript.remove();
    }
  }, [pathname]);

  return null;
}
