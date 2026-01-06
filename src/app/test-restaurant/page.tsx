'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// AMICI Color Palette from scraped CSS
const colors = {
  white: '#fffaf4',
  beige: '#f9edde',
  olive: '#606d01',
  green: '#515726',
  lightGreen: '#a9d7ad',
}

// Easing functions from AMICI CSS
const easing = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  in: 'cubic-bezier(0.12, 0, 0.39, 0)',
  inOut: 'cubic-bezier(0.86, 0, 0.07, 1)',
  outBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}

export default function RestaurantPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [phase, setPhase] = useState(0)
  // Phase 0: Initial - images start falling
  // Phase 1: Images have fallen and are visible (collage view)
  // Phase 2: Center image drops
  // Phase 3: Center image expands to full background
  // Phase 4: UI elements fly in

  useEffect(() => {
    // Phase 1: Images start falling smoothly
    const timer1 = setTimeout(() => setPhase(1), 100)
    
    // Phase 2: After images settle, center image appears (at 3.5s)
    const timer2 = setTimeout(() => setPhase(2), 3500)
    
    // Phase 3: Center image expands to background (at 4.5s)
    const timer3 = setTimeout(() => setPhase(3), 4500)
    
    // Phase 4: UI flies in (at 5.5s)
    const timer4 = setTimeout(() => setPhase(4), 5500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  return (
    <div 
      className="min-h-screen font-sans"
      style={{ 
        backgroundColor: colors.beige, 
        color: colors.green,
        fontFamily: '"Gotham", "Helvetica Neue", sans-serif',
      }}
    >
      {/* CSS Variables & Keyframes */}
      <style jsx global>{`
        :root {
          --color-white: #fffaf4;
          --color-beige: #f9edde;
          --color-olive: #606d01;
          --color-green: #515726;
          --color-light-green: #a9d7ad;
          --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
          --ease-in: cubic-bezier(0.12, 0, 0.39, 0);
          --ease-in-out: cubic-bezier(0.86, 0, 0.07, 1);
          --stagger: 0.02s;
        }

        /* Leaf falling - smooth fall, slows 20% at center for viewing, then continues */
        @keyframes leafFall {
          0% {
            opacity: 0;
            transform: translateY(-120vh) rotate(var(--rotate-start, -5deg));
          }
          8% {
            opacity: 1;
          }
          /* Fast fall to center */
          35% {
            transform: translateY(-30vh) rotate(calc(var(--rotate-start, -5deg) * 0.6));
          }
          /* SLOW DOWN 20% - center viewing zone */
          50% {
            transform: translateY(-15vh) rotate(calc(var(--rotate-end, 3deg) * 0.8));
          }
          65% {
            transform: translateY(0vh) rotate(var(--rotate-end, 3deg));
          }
          /* Resume normal speed to final position */
          100% {
            opacity: 1;
            transform: translateY(var(--end-y, 0px)) rotate(var(--rotate-end, 3deg));
          }
        }

        .leaf-image {
          transform-style: preserve-3d;
        }

        /* Center image drop - comes after other images */
        @keyframes centerDrop {
          0% {
            opacity: 0;
            transform: translateY(-100vh) scale(0.3);
          }
          30% {
            opacity: 1;
          }
          70% {
            transform: translateY(0) scale(0.3);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(0.3);
          }
        }

        /* Expand from center - clip-path animation */
        @keyframes expandFromCenter {
          0% {
            clip-path: inset(33.33% 33.33% 33.33% 33.33%);
            transform: scale(1);
          }
          100% {
            clip-path: inset(0% 0% 0% 0%);
            transform: scale(1);
          }
        }

        /* Fade out falling images */
        @keyframes fadeOutImages {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes charReveal {
          0% {
            opacity: 0;
            transform: translateY(50%) rotateX(-90deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }

        .cover-restaurant-img {
          transform-style: preserve-3d;
        }

        .perspective-500 {
          perspective: 500px;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .perspective-2000 {
          perspective: 2000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        /* Button hover effect like AMICI */
        .button-amici {
          position: relative;
          overflow: hidden;
        }

        .button-amici::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--color-olive);
          transition: left 0.5s var(--ease-out);
          z-index: -1;
        }

        .button-amici:hover::before {
          left: 0;
        }

        .button-amici:hover {
          color: var(--color-beige);
        }

        /* Link underline animation */
        .link-amici {
          position: relative;
        }

        .link-amici::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--color-olive);
          transition: width 0.4s var(--ease-out);
        }

        .link-amici:hover::after {
          width: 100%;
        }

        /* Sticker hover effect */
        .sticker-hover .sticker {
          opacity: 0;
          transform: rotate(11deg) scale(1.3);
          transition: all 0.45s var(--ease-out);
        }

        .sticker-hover:hover .sticker {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      `}</style>

      {/* PHASE 1-2: Falling Images Collage - covers whole page */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-700`}
        style={{ 
          backgroundColor: colors.beige,
          opacity: phase >= 3 ? 0 : 1,
          pointerEvents: phase >= 3 ? 'none' : 'auto',
        }}
      >
        {/* Falling Images - smooth fall with slowdown at center */}
        {phase >= 1 && (
          <>
            {/* Image 1 - Left side */}
            <div 
              className="absolute shadow-2xl leaf-image"
              style={{
                width: '35vw',
                height: '45vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                left: '-5%',
                top: '5%',
                '--rotate-start': '-8deg',
                '--rotate-end': '-5deg',
                '--end-y': '0px',
                animation: `leafFall 2.5s ease-in-out forwards`,
                animationDelay: '0ms',
                zIndex: 10,
              } as React.CSSProperties}
            />
            
            {/* Image 2 - Top right */}
            <div 
              className="absolute shadow-2xl leaf-image"
              style={{
                width: '32vw',
                height: '40vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                right: '-3%',
                top: '0%',
                '--rotate-start': '6deg',
                '--rotate-end': '4deg',
                '--end-y': '0px',
                animation: `leafFall 2.6s ease-in-out forwards`,
                animationDelay: '100ms',
                zIndex: 12,
              } as React.CSSProperties}
            />
            
            {/* Image 3 - Center large */}
            <div 
              className="absolute shadow-2xl leaf-image"
              style={{
                width: '45vw',
                height: '55vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                left: '27%',
                top: '22%',
                '--rotate-start': '-3deg',
                '--rotate-end': '2deg',
                '--end-y': '0px',
                animation: `leafFall 2.8s ease-in-out forwards`,
                animationDelay: '200ms',
                zIndex: 15,
              } as React.CSSProperties}
            />
            
            {/* Image 4 - Bottom left */}
            <div 
              className="absolute shadow-2xl leaf-image"
              style={{
                width: '30vw',
                height: '38vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                left: '2%',
                bottom: '-5%',
                '--rotate-start': '5deg',
                '--rotate-end': '3deg',
                '--end-y': '0px',
                animation: `leafFall 2.7s ease-in-out forwards`,
                animationDelay: '300ms',
                zIndex: 11,
              } as React.CSSProperties}
            />
            
            {/* Image 5 - Bottom right */}
            <div 
              className="absolute shadow-2xl leaf-image"
              style={{
                width: '34vw',
                height: '42vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                right: '0%',
                bottom: '-8%',
                '--rotate-start': '-4deg',
                '--rotate-end': '-2deg',
                '--end-y': '0px',
                animation: `leafFall 2.9s ease-in-out forwards`,
                animationDelay: '400ms',
                zIndex: 13,
              } as React.CSSProperties}
            />
            
            {/* Image 6 - Far left middle */}
            <div 
              className="absolute shadow-2xl leaf-image"
              style={{
                width: '28vw',
                height: '35vh',
                backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                left: '-8%',
                top: '45%',
                '--rotate-start': '7deg',
                '--rotate-end': '5deg',
                '--end-y': '0px',
                animation: `leafFall 2.6s ease-in-out forwards`,
                animationDelay: '150ms',
                zIndex: 9,
              } as React.CSSProperties}
            />

            {/* Sticker labels like AMICI */}
            <div 
              className="absolute px-3 py-1 text-xs font-medium uppercase tracking-wider border-2 bg-white/90"
              style={{
                left: '15%',
                top: '35%',
                borderColor: colors.olive,
                color: colors.olive,
                transform: 'rotate(-5deg)',
                animation: `fadeInUp 0.6s ${easing.out} forwards`,
                animationDelay: '1200ms',
                opacity: 0,
                zIndex: 20,
              }}
            >
              MIAM
            </div>
            <div 
              className="absolute px-3 py-1 text-xs font-medium uppercase tracking-wider border-2 bg-white/90"
              style={{
                right: '20%',
                top: '45%',
                borderColor: colors.olive,
                color: colors.olive,
                transform: 'rotate(8deg)',
                animation: `fadeInUp 0.6s ${easing.out} forwards`,
                animationDelay: '1400ms',
                opacity: 0,
                zIndex: 20,
              }}
            >
              Grazie mille
            </div>
          </>
        )}
      </div>

      {/* PHASE 3: Center image that expands to become background */}
      <div 
        className={`fixed inset-0 z-[95] transition-all duration-1000`}
        style={{ 
          opacity: phase >= 2 ? 1 : 0,
          pointerEvents: phase >= 4 ? 'none' : 'auto',
        }}
      >
        {/* Center dropping image that expands */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)',
            clipPath: phase >= 3 
              ? 'inset(0% 0% 0% 0%)' 
              : 'inset(33.33% 33.33% 33.33% 33.33%)',
            transition: `clip-path 1.2s ${easing.out}`,
          }}
        />
        {/* Overlay for hero */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ 
            backgroundColor: 'rgba(96, 109, 1, 0.35)',
            opacity: phase >= 3 ? 1 : 0,
          }}
        />
      </div>
      {/* Navigation - AMICI Style */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ 
          backgroundColor: phase >= 4 ? colors.white : 'transparent',
          padding: '1.5rem 2.5rem',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/test-restaurant" 
            className="text-3xl font-serif italic tracking-wide transition-colors duration-300"
            style={{ color: colors.olive }}
          >
            AMICI
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="link-amici text-xs uppercase tracking-[0.2em] transition-colors" style={{ color: colors.green }}>
              Lesquin
            </Link>
            <Link href="#" className="link-amici text-xs uppercase tracking-[0.2em] font-medium" style={{ color: colors.olive }}>
              Sophia – Antipolis
            </Link>
            <Link href="#" className="link-amici text-xs uppercase tracking-[0.2em] transition-colors" style={{ color: colors.green }}>
              Meylan
            </Link>
            <Link href="#" className="link-amici text-xs uppercase tracking-[0.2em] transition-colors" style={{ color: colors.green }}>
              A propos
            </Link>
            <Link href="#" className="link-amici text-xs uppercase tracking-[0.2em] transition-colors" style={{ color: colors.green }}>
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            style={{ color: colors.olive }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div 
            className="md:hidden px-6 py-4 space-y-4 border-t"
            style={{ backgroundColor: colors.white, borderColor: colors.olive }}
          >
            <Link href="#" className="block text-xs uppercase tracking-[0.2em]" style={{ color: colors.green }}>Lesquin</Link>
            <Link href="#" className="block text-xs uppercase tracking-[0.2em] font-medium" style={{ color: colors.olive }}>Sophia – Antipolis</Link>
            <Link href="#" className="block text-xs uppercase tracking-[0.2em]" style={{ color: colors.green }}>Meylan</Link>
            <Link href="#" className="block text-xs uppercase tracking-[0.2em]" style={{ color: colors.green }}>A propos</Link>
            <Link href="#" className="block text-xs uppercase tracking-[0.2em]" style={{ color: colors.green }}>Contact</Link>
          </div>
        )}
      </nav>

      {/* Hero Section - AMICI Style with sticky cover */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{ perspective: '500px' }}
      >
        {/* Background Image with 3D effect */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2000ms] cover-restaurant-img`}
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)',
            transform: phase >= 4 ? 'scale(1) translateZ(0)' : 'scale(1.1) translateZ(50px)',
            transitionTimingFunction: easing.out,
          }}
        />
        
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(96, 109, 1, 0.3)' }}
        />
        
        {/* Content - Staggered animation */}
        <div className="relative z-10 text-center px-6">
          <p 
            className={`uppercase tracking-[0.4em] text-xs mb-6 transition-all duration-700`}
            style={{ 
              color: colors.white,
              transitionDelay: '300ms',
              transitionTimingFunction: easing.out,
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            Restaurant Italien
          </p>
          <h1 
            className={`text-5xl md:text-7xl lg:text-8xl font-serif italic mb-8 transition-all duration-700`}
            style={{ 
              color: colors.white,
              transitionDelay: '500ms',
              transitionTimingFunction: easing.out,
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateY(0)' : 'translateY(40px)',
            }}
          >
            Sophia Antipolis
          </h1>
          <div 
            className={`space-y-2 transition-all duration-700`}
            style={{ 
              color: colors.beige,
              transitionDelay: '700ms',
              transitionTimingFunction: easing.out,
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            <p className="text-sm">965 Av. Roumanille</p>
            <p className="text-sm">06410 Biot</p>
            <p className="text-sm font-medium" style={{ color: colors.lightGreen }}>(dans l&apos;Arteparc)</p>
          </div>
          <a 
            href="tel:0422580630" 
            className={`inline-block mt-10 text-lg tracking-wider transition-all duration-700 hover:opacity-70`}
            style={{ 
              color: colors.white,
              transitionDelay: '900ms',
              transitionTimingFunction: easing.out,
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            04 22 58 06 30
          </a>
        </div>

        {/* Scroll indicator */}
        <div 
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-700`}
          style={{ 
            transitionDelay: '1100ms',
            opacity: phase >= 4 ? 1 : 0,
            color: colors.white,
          }}
        >
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section 1 - Rassembler (Beige background) */}
      <section 
        className="py-32 px-6 overflow-hidden"
        style={{ backgroundColor: colors.beige }}
      >
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-1000`}
          style={{ 
            transitionDelay: '200ms',
            transitionTimingFunction: easing.out,
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(60px)',
          }}
        >
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-serif italic mb-10 leading-tight"
            style={{ color: colors.olive }}
          >
            RASSEMBLER, PROFITER, TOUT GOÛTER
          </h2>
          <p 
            className="text-base leading-relaxed"
            style={{ color: colors.green }}
          >
            Le soleil donne à Sophia Antipolis. On se prélasse en terrasse, l&apos;Italie chante dans l&apos;assiette. 
            Il fait bon vivre chez Amici, tous les plaisirs de la table sont permis.
          </p>
        </div>
      </section>

      {/* Image Section - Full width */}
      <section className="relative h-[70vh] overflow-hidden">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[1500ms]`}
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920)',
            transitionTimingFunction: easing.out,
            transform: phase >= 4 ? 'scale(1)' : 'scale(1.1)',
          }}
        />
      </section>

      {/* Section 2 - La Carte (White background) */}
      <section 
        className="py-32 px-6 overflow-hidden"
        style={{ backgroundColor: colors.white }}
      >
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-1000`}
          style={{ 
            transitionTimingFunction: easing.out,
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(60px)',
          }}
        >
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-serif italic mb-10 leading-tight"
            style={{ color: colors.olive }}
          >
            LA CARTE, PER FAVORE
          </h2>
          <p 
            className="text-base leading-relaxed"
            style={{ color: colors.green }}
          >
            Le cadre est chaleureux et tout est fait maison. Notre cuisine, à la fois gourmande et raffinée, 
            vous fait voyager en Méditerranée. Et ce, alors que tous nos ingrédients viennent du coin.
          </p>
        </div>
      </section>

      {/* Image Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div 
          className={`h-[50vh] bg-cover bg-center transition-all duration-[1500ms]`}
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800)',
            transitionTimingFunction: easing.out,
            transform: phase >= 4 ? 'scale(1)' : 'scale(1.1)',
          }}
        />
        <div 
          className={`h-[50vh] bg-cover bg-center transition-all duration-[1500ms]`}
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800)',
            transitionTimingFunction: easing.out,
            transitionDelay: '200ms',
            transform: phase >= 4 ? 'scale(1)' : 'scale(1.1)',
          }}
        />
      </section>

      {/* Section 3 - Agenda (Beige background) */}
      <section 
        className="py-32 px-6 overflow-hidden"
        style={{ backgroundColor: colors.beige }}
      >
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-1000`}
          style={{ 
            transitionTimingFunction: easing.out,
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(60px)',
          }}
        >
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-serif italic mb-10 leading-tight"
            style={{ color: colors.olive }}
          >
            UN AGENDA BIEN REMPLI
          </h2>
          <p 
            className="text-base leading-relaxed"
            style={{ color: colors.green }}
          >
            Apéro chill, soir de match, piste de danse, birthday party, afterwork : chez AMICI, 
            tout un programme d&apos;événements vous attend, au cas où vous n&apos;avez rien de prévu.
          </p>
        </div>
      </section>

      {/* Reservation Section (Olive background like AMICI) */}
      <section 
        className="py-32 px-6 overflow-hidden"
        style={{ backgroundColor: colors.olive }}
      >
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-1000`}
          style={{ 
            transitionTimingFunction: easing.out,
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(60px)',
          }}
        >
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-serif italic mb-10 leading-tight"
            style={{ color: colors.beige }}
          >
            Réservation
          </h2>
          <p 
            className="text-base mb-12"
            style={{ color: colors.lightGreen }}
          >
            Pour toute demande d&apos;information contactez-nous à sophia-antipolis@amici-restaurant.com
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="px-8 py-4 uppercase tracking-[0.2em] text-xs font-medium transition-all duration-300 border-2"
              style={{ 
                backgroundColor: colors.beige,
                color: colors.olive,
                borderColor: colors.beige,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = colors.beige
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.beige
                e.currentTarget.style.color = colors.olive
              }}
            >
              Réserver une table
            </a>
            <a 
              href="#" 
              className="px-8 py-4 uppercase tracking-[0.2em] text-xs font-medium transition-all duration-300 border-2"
              style={{ 
                backgroundColor: 'transparent',
                color: colors.beige,
                borderColor: colors.beige,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.beige
                e.currentTarget.style.color = colors.olive
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = colors.beige
              }}
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* Footer (Light green background like AMICI) */}
      <footer 
        className="py-20 px-6"
        style={{ backgroundColor: colors.lightGreen }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo */}
            <div>
              <h3 
                className="text-3xl font-serif italic tracking-wide mb-4"
                style={{ color: colors.olive }}
              >
                AMICI
              </h3>
              <p className="text-sm" style={{ color: colors.green }}>Restaurant Italien</p>
            </div>

            {/* Links */}
            <div>
              <h4 
                className="text-xs uppercase tracking-[0.2em] mb-6 font-medium"
                style={{ color: colors.olive }}
              >
                Navigation
              </h4>
              <div className="space-y-3">
                <Link href="#" className="block text-sm transition-opacity hover:opacity-70" style={{ color: colors.green }}>A propos</Link>
                <Link href="#" className="block text-sm transition-opacity hover:opacity-70" style={{ color: colors.green }}>Recrutement</Link>
                <Link href="#" className="block text-sm transition-opacity hover:opacity-70" style={{ color: colors.green }}>Privatisation</Link>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 
                className="text-xs uppercase tracking-[0.2em] mb-6 font-medium"
                style={{ color: colors.olive }}
              >
                Suivez-nous
              </h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm transition-opacity hover:opacity-70" style={{ color: colors.green }}>Instagram</a>
                <a href="#" className="block text-sm transition-opacity hover:opacity-70" style={{ color: colors.green }}>Facebook</a>
              </div>
            </div>

            {/* Credits */}
            <div>
              <h4 
                className="text-xs uppercase tracking-[0.2em] mb-6 font-medium"
                style={{ color: colors.olive }}
              >
                Credits
              </h4>
              <a href="#" className="text-sm transition-opacity hover:opacity-70" style={{ color: colors.green }}>Beaucoup Studio</a>
            </div>
          </div>

          <div 
            className="mt-16 pt-8 border-t text-center text-sm"
            style={{ borderColor: colors.olive, color: colors.green }}
          >
            <p className="mb-2">© 2024 AMICI. Tous droits réservés.</p>
            <Link href="#" className="transition-opacity hover:opacity-70">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
