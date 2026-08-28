"use client";

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
      setChecking(false);
    }

    checkAuth();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
   }, []);

  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setVisibleImages((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.3 }
    );

    imageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="bg-page text-ink overflow-x-hidden font-sans">
\        <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-page/80 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-display font-bold italic"
            >
              UnsaidWords<span className="text-plum">.</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-landing-surface border border-landing-border">
              <div className="w-2 h-2 rounded-full bg-plum animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-landing-muted">
                Active Session
              </span>
            </div>
          </div>

          <div className="hidden md:flex bg-landing-surface p-1 rounded-full border border-landing-border">
            <a
              href="/"
              className="px-6 py-2 rounded-full bg-page text-ink shadow-card transition-all duration-300"
            >
              Home
            </a>

            <a
              href="#about"
              className="px-6 py-2 rounded-full text-landing-muted hover:text-ink transition-all duration-300"
            >
              Manifesto
            </a>

            <a
              href="#features"
              className="px-6 py-2 rounded-full text-landing-muted hover:text-ink transition-all duration-300"
            >
              Features
            </a>
          </div>

          <div className="flex items-center gap-4">
            {!checking && isLoggedIn ? (
              <Link
                href="/home"
                className="bg-plum text-white px-6 py-2 rounded-full text-sm hover:bg-[#5a3849] transition-colors"
              >
                Go to my archive
              </Link>
            ) : !checking ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-landing-muted hover:text-plum"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="bg-plum text-white px-6 py-2 rounded-full text-sm hover:bg-[#5a3849] transition-colors"
                >
                  Join Now
                </Link>
              </>
            ) : null}
          </div>
        </nav>

        <header className="relative min-h-fit sm:min-h-screen flex items-center pt-24 pb-16 sm:pb-0 overflow-hidden">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-landing-muted">
                ARCHIVE / VOL. I
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold leading-[0.95] italic">
                Rest your
                <br />
                unsaid
                <br />
                words here.
              </h1>

              <p className="text-lg text-landing-muted max-w-sm leading-relaxed">
                For every feeling that didn&apos;t find its voice, for every
                word that stayed held back.. Find its sanctuary in your private
                archive.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={isLoggedIn ? "/home" : "/signup"}
                  className="bg-plum text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                  {isLoggedIn ? "Go to my archive" : "Start Writing"}
                </Link>

                <a
                  href="#about"
                  className="bg-landing-surface border border-landing-border px-8 py-4 rounded-2xl font-bold hover:bg-page transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative h-[280px] sm:h-[400px] md:h-[600px] block">
              <div className="absolute inset-0 flex flex-col gap-4">
                <div className="w-2/3 h-1/2 rounded-2xl overflow-hidden shadow-soft transform translate-y-12">
                  <img
                    className="w-full h-full object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_ffd3d7c74e_36b4aa78b5c7047a.png"
                    alt="A quiet writing desk at dusk"
                  />
                </div>

                <div className="w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-soft ml-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_71ab98e184_d8814bd8a34d2c1d.png"
                    alt="Ink bleeding into textured paper"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_70%_40%,rgba(107,67,86,0.08),transparent_60%)]" />
        </header>

        <section
          id="about"
          className="py-16 sm:py-24 md:py-32 bg-page relative"
        >
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-12 gap-6 md:gap-12 items-start">
              <div className="md:col-span-4 sticky top-32">
                <span className="text-[10px] uppercase tracking-[0.3em] text-landing-muted block mb-4">
                  Why UnsaidWords?
                </span>

                <div className="w-12 h-px bg-plum mb-8" />
              </div>

              <div className="md:col-span-8 space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-display italic font-bold leading-snug md:leading-tight bg-landing-surface p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[40px] shadow-soft">
                  We write here because speech is sometimes heavy. The apology
                  never uttered, the gratitude lost, the quiet frustration..
                  it all deserves a safe space, away from watching eyes.
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-16 sm:py-24 md:py-32 bg-page"
        >
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-10 sm:mb-14 md:mb-20">
              <h2 className="text-5xl font-display font-bold italic">
                How it works.
              </h2>

              <span className="text-[10px] uppercase tracking-[0.3em] text-landing-muted">
                UTILITIES / FEATURES
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                          {[
              {
                img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_b6d47184fd_357874396f293374.png",
                alt: "Hands sealing an envelope with wax",
                title: "Private Sanctuary",
                desc: "Your entries are encrypted. A space where no one can look but you.",
              },
              {
                img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_fe7a15b797_3b80e8c437e34338.png",
                alt: "A ceramic coffee mug on a windowsill",
                title: "Moments of Reflection",
                desc: "Gentle reminders to capture your feelings before they fade with time.",
              },
              {
                img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_bb99656a0c_fcf5417b96e192aa.png",
                alt: "Abstract ink strokes on textured paper",
                title: "Emotional Patterns",
                desc: "Quietly discover how your feelings evolve and transform over time.",
              },
            ].map((f, index) => {
              const isVisible = visibleImages.has(index);
              return (
                <div key={f.title} className="group cursor-pointer">
                  <div
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                    data-index={index}
                    className="aspect-[4/5] overflow-hidden rounded-3xl mb-6 bg-elevated border border-border"
                  >
                    <img
                      className={`w-full h-full object-cover transition-all duration-700 scale-100 md:group-hover:scale-105 ${
                        isVisible ? "grayscale-0" : "grayscale"
                      } md:grayscale md:group-hover:grayscale-0`}
                      src={f.img}
                      alt={f.alt}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-landing-muted">{f.desc}</p>
                </div>
              );
            })}
            </div>
          </div>
        </section>

        <footer className="bg-page border-t border-landing-border pt-12 sm:pt-16 md:pt-24 pb-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <Link
                  href="/"
                  className="text-2xl font-display font-bold italic"
                >
                  UnsaidWords<span className="text-plum">.</span>
                </Link>

                <p className="text-landing-muted mt-3 text-xs tracking-wider">
                  A silent sanctuary in a loud world.
                </p>
              </div>

              <ul className="flex gap-6 text-sm text-landing-muted">
                <li>
                  <a
                    href="/"
                    className="hover:text-plum transition-colors"
                  >
                    Home
                  </a>
                </li>

                <li>
                  <a
                    href="#about"
                    className="hover:text-plum transition-colors"
                  >
                    Manifesto
                  </a>
                </li>

                <li>
                  <a
                    href="#features"
                    className="hover:text-plum transition-colors"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div className="border-t border-landing-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-landing-muted">
              <p>© 2026 UnsaidWords. All rights reserved.</p>

              <p className="italic normal-case tracking-normal">
                Made with care by Shahenda
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}