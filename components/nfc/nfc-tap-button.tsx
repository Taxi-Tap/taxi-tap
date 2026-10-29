"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import {
  isWebNfcSupported,
  readNfcSerial,
  simulatedTap,
} from "@/lib/nfc";

type NfcTapResult =
  | { method: "nfc"; serial: string }
  | { method: "simulated" };

type NfcTapButtonProps = {
  onResult: (result: NfcTapResult) => void;
  onError: (message: string) => void;
};

function subscribeToNfcSupport() {
  return () => {};
}

function getNfcSupportSnapshot(): boolean | null {
  return isWebNfcSupported();
}

function getServerNfcSupportSnapshot(): boolean | null {
  return null;
}

export function NfcTapButton({ onResult, onError }: NfcTapButtonProps) {
  const supported = useSyncExternalStore(
    subscribeToNfcSupport,
    getNfcSupportSnapshot,
    getServerNfcSupportSnapshot,
  );
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  async function handleNfcTap() {
    const controller = new AbortController();
    controllerRef.current = controller;
    setWaiting(true);
    setMessage("Hold your phone near the tag");

    try {
      const serial = await readNfcSerial(controller.signal);
      if (controllerRef.current !== controller) return;

      controllerRef.current = null;
      setWaiting(false);
      setMessage("NFC tag read successfully.");
      onResult({ method: "nfc", serial });
    } catch (error) {
      if (controllerRef.current !== controller) return;

      controllerRef.current = null;
      setWaiting(false);
      if (controller.signal.aborted) {
        setMessage("NFC read cancelled.");
        return;
      }

      const friendlyMessage =
        error instanceof Error
          ? error.message
          : "Unable to read the NFC tag.";
      setMessage(friendlyMessage);
      onError(friendlyMessage);
    }
  }

  function cancelNfcTap() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setWaiting(false);
    setMessage("NFC read cancelled.");
  }

  function handleSimulatedTap() {
    const result = simulatedTap("");
    setMessage("Tap simulated.");
    onResult({ method: result.method });
  }

  return (
    <div className="space-y-2">
      {supported === null ? (
        <p role="status">Checking NFC availability…</p>
      ) : supported ? (
        <Button
          className="min-h-12 w-full"
          onClick={waiting ? cancelNfcTap : handleNfcTap}
          type="button"
          variant={waiting ? "outline" : "default"}
        >
          {waiting ? "Cancel" : "Tap NFC tag"}
        </Button>
      ) : (
        <Button
          className="min-h-12 w-full"
          onClick={handleSimulatedTap}
          type="button"
        >
          Simulate tap
        </Button>
      )}
      {message && (
        <p aria-live="polite" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
