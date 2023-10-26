import { createEffect, createSignal } from "solid-js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://slfiurejebbbktmimjfe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZml1cmVqZWJiYmt0bWltamZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNzk0NTIsImV4cCI6MjAxMzg1NTQ1Mn0.kyx1fZkIbSveiAjIQrNeoavztiL0n86br9soU5R0o0U";
const supabase = createClient(supabaseUrl, supabaseKey);

const startConnection = async ({ onEvent, onConnectionChange }) => {
  try {
    await supabase.channel("time").unsubscribe();
    await supabase
      .channel("time")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "countries" },
        (payload) => {
          onEvent(payload);
        },
      )
      .subscribe((e) => {
        onConnectionChange(e);
      });
  } catch (err) {
    onConnectionChange(`Exception ${err.message}`);
  }
};

function App() {
  const [log, setLog] = createSignal("Started");
  const [isVisible, setIsVisible] = createSignal(!document.hidden);

  // Listen for the tab/window to become visible again
  // With that we try to reconnect:
  document.addEventListener("visibilitychange", () => {
    setLog((l) => l + `\n visible: ${!document.hidden}`);
    setIsVisible(!document.hidden);
  });

  createEffect(() => {
    if (isVisible()) {
      setLog((l) => l + `\n Is vis changed`);
      startConnection({
        onEvent: (e) => setLog((l) => l + `\n ${e}`),
        onConnectionChange: (e) => setLog((l) => l + `\n ${e}`),
      });
    }
  });

  return (
    <div>
      <p>Test</p>
      <pre>{log()}</pre>
    </div>
  );
}

export default App;
