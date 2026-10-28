type NdefReadingEvent = Event & {
  serialNumber: string;
};

type NdefReaderLike = {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  addEventListener(
    type: "reading",
    listener: (event: NdefReadingEvent) => void,
    options?: { once?: boolean },
  ): void;
};

type NfcWindow = Window & {
  NDEFReader?: new () => NdefReaderLike;
};

export function isWebNfcSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "NDEFReader" in window &&
    window.isSecureContext
  );
}

export function readNfcSerial(signal?: AbortSignal): Promise<string> {
  if (!isWebNfcSupported()) {
    return Promise.reject(
      new Error("NFC is not supported on this device or connection."),
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const Reader = (window as NfcWindow).NDEFReader;
      if (!Reader) {
        reject(new Error("NFC is not supported on this device or connection."));
        return;
      }

      const reader = new Reader();
      reader.addEventListener(
        "reading",
        (event) => resolve(event.serialNumber),
        { once: true },
      );

      reader.scan({ signal }).catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "NotAllowedError"
        ) {
          reject(new Error("NFC permission was denied."));
          return;
        }
        reject(new Error("Unable to read the NFC tag."));
      });
    } catch {
      reject(new Error("Unable to read the NFC tag."));
    }
  });
}

export function simulatedTap(
  walletId: string,
): { method: "simulated"; walletId: string } {
  return { method: "simulated", walletId };
}
