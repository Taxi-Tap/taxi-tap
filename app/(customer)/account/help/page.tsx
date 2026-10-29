import { MessageCircle, Phone } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  { q: "How do I top up my wallet?", a: "Go to Wallet, tap Recharge, choose an amount and confirm. In this prototype the funds are simulated." },
  { q: "What if my QR code expires?", a: "QR codes last 60 seconds and work once. Open the Pay screen again to get a new one." },
  { q: "How do I report a failed payment?", a: "Open the payment in History, then tap Report an issue with this payment." },
  { q: "Can I link a bank account?", a: "Not yet. Taxi Tap uses a demo wallet while the prototype is being tested." },
  { q: "How do drivers verify my fares?", a: "The reader shows the amount and a green or red result. Your receipt in History has the same reference." },
];

export default function HelpPage() {
  return (
    <main>
      <AppHeader title="Help" backHref="/account" />
      <section className="mt-4 px-4" aria-label="FAQ">
        <h2 className="mb-1 text-xs font-bold">FAQ</h2>
        <Accordion>
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section className="mt-6 px-4" aria-label="Contact">
        <h2 className="mb-1 text-xs font-bold">CONTACT</h2>
        <ul className="divide-y">
          <li>
            <a href="mailto:support@taxitap.example" className="flex items-center gap-3 py-4 text-base">
              <MessageCircle className="size-5" aria-hidden="true" /> Chat with support
            </a>
          </li>
          <li>
            <a href="tel:+270000000000" className="flex items-center gap-3 py-4 text-base">
              <Phone className="size-5" aria-hidden="true" /> Call +27 00 000 0000
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
