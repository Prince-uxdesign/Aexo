import { HardDrive, Link2, Lock } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { revealDelay, scrollOffsets } from "./motion";
import { SectionHeading, SmallFeature, sectionClass } from "./section-heading";

export function SecuritySection() {
  return (
    <section
      id="security"
      aria-labelledby="security-title"
      className={`${sectionClass} overflow-hidden`}
    >
      <Container>
        <SectionHeading id="security-title" title="Your invoices are safe" />

        <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 lg:gap-6">
          <SmallFeature icon={Lock} title="Private by default">
            Saved invoices belong to your account. No one else can open, edit or list them.
          </SmallFeature>
          <SmallFeature icon={Link2} title="Links only you hand out" index={1}>
            Share links use long random tokens. Turn sharing off and the link stops working straight
            away.
          </SmallFeature>
          <SmallFeature icon={HardDrive} title="Drafts stay on your device" index={2}>
            Until you choose to save, a draft lives only in your browser. Nothing is uploaded.
          </SmallFeature>
        </ul>

        <Padlock />
      </Container>
    </section>
  );
}

/**
 * A soft, drawn padlock with the Aexo mark as its keyhole. Decorative.
 * The body zooms in, then the shackle starts open and clicks shut as it
 * scrolls into place.
 */
function Padlock() {
  return (
    <div
      aria-hidden
      data-scene="enter"
      className="relative mx-auto mt-6 flex w-56 flex-col items-center sm:w-64"
    >
      {/* Shackle */}
      <div
        className="scroll-settle relative z-0 h-32 w-36 rounded-t-pill bg-linear-to-r from-muted-soft/50 via-mist to-muted-soft/70 sm:h-36 sm:w-40"
        style={scrollOffsets({ y: -56 })}
      >
        <div className="absolute inset-x-5 top-5 bottom-0 rounded-t-pill bg-white" />
      </div>
      {/* Body */}
      <div
        data-reveal="zoom"
        className="relative z-10 -mt-6 flex size-56 items-center justify-center rounded-pill bg-linear-to-br from-sky-800 via-ink to-ink shadow-lift sm:size-64"
      >
        <div className="absolute inset-3 rounded-pill bg-linear-to-tl from-white/0 via-white/5 to-white/15" />
        <span
          data-reveal="pop"
          style={revealDelay(450)}
          className="relative flex size-20 items-center justify-center rounded-xl bg-white shadow-float"
        >
          <LogoMark className="size-10" />
        </span>
      </div>
      <div className="mx-auto mt-2 h-8 w-48 rounded-pill bg-sky-200/50 blur-2xl" />
    </div>
  );
}
