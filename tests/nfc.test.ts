import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isWebNfcSupported,
  readNfcSerial,
  simulatedTap,
} from "@/lib/nfc";

describe("Web NFC helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported when window is absent", () => {
    expect(isWebNfcSupported()).toBe(false);
  });

  it("rejects reads with a friendly message when unsupported", async () => {
    await expect(readNfcSerial()).rejects.toThrow(
      "NFC is not supported on this device or connection.",
    );
  });

  it("reports supported when NFC and a secure context are available", () => {
    vi.stubGlobal("window", {
      NDEFReader: class {},
      isSecureContext: true,
    });

    expect(isWebNfcSupported()).toBe(true);
  });

  it("reads the serial number from the first tag reading", async () => {
    class FakeNdefReader {
      listener: ((event: Event & { serialNumber: string }) => void) | undefined;

      addEventListener(
        _type: "reading",
        listener: (event: Event & { serialNumber: string }) => void,
      ) {
        this.listener = listener;
      }

      async scan() {
        this.listener?.({ serialNumber: "tag-123" } as Event & {
          serialNumber: string;
        });
      }
    }

    vi.stubGlobal("window", {
      NDEFReader: FakeNdefReader,
      isSecureContext: true,
    });

    await expect(readNfcSerial()).resolves.toBe("tag-123");
  });

  it("reports denied NFC permission with a friendly message", async () => {
    class DeniedNdefReader {
      addEventListener() {}

      async scan() {
        throw new DOMException("Denied", "NotAllowedError");
      }
    }

    vi.stubGlobal("window", {
      NDEFReader: DeniedNdefReader,
      isSecureContext: true,
    });

    await expect(readNfcSerial()).rejects.toThrow("NFC permission was denied.");
  });

  it("reports other read failures with a friendly message", async () => {
    class FailedNdefReader {
      addEventListener() {}

      async scan() {
        throw new Error("Failed");
      }
    }

    vi.stubGlobal("window", {
      NDEFReader: FailedNdefReader,
      isSecureContext: true,
    });

    await expect(readNfcSerial()).rejects.toThrow("Unable to read the NFC tag.");
  });

  it("returns the simulated tap object", () => {
    expect(simulatedTap("wallet-1")).toEqual({
      method: "simulated",
      walletId: "wallet-1",
    });
  });
});
