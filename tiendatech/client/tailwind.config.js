/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // ─── Paleta de colores TiendaTech ───────────────────────────────────
      colors: {
        // Fondos y superficies
        brand: {
          white:    "#FFFFFF",       // Fondo principal (puro)
          surface:  "#F7F7F8",       // Fondo de tarjetas (gris muy sutil)
          muted:    "#EBEBEC",       // Bordes, separadores
          subtle:   "#D1D1D3",       // Texto placeholder, labels secundarios
        },

        // Neutros oscuros
        dark: {
          DEFAULT:  "#0A0A0A",       // Negro principal (texto, botones primarios)
          800:      "#1A1A1A",       // Navbar, footer
          700:      "#2C2C2C",       // Hover en elementos oscuros
          600:      "#3D3D3D",       // Texto secundario sobre fondo oscuro
        },

        // Acento rojo — el corazón de la marca
        red: {
          DEFAULT:  "#E3000F",       // Rojo vibrante principal (botones CTA, badges)
          hover:    "#C8000D",       // Hover del rojo
          muted:    "#FF1A27",       // Versión más brillante para glow effects
          subtle:   "#FFF0F0",       // Fondo rojo muy suave (alertas, highlights)
        },
      },

      // ─── Tipografía ──────────────────────────────────────────────────────
      fontFamily: {
        // Display: títulos y hero — carácter industrial/gamer sin ser ridículo
        display: ['"Barlow Condensed"', '"Bebas Neue"', 'sans-serif'],
        // Body: legible, moderno, limpio
        body:    ['"DM Sans"', '"Outfit"', 'sans-serif'],
        // Mono: precios, specs técnicas, códigos
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      // ─── Sombras ─────────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 30px -8px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)',
        'red-glow':   '0 0 20px 2px rgba(227,0,15,0.25)',
        'red-btn':    '0 4px 15px rgba(227,0,15,0.35)',
        'dark-btn':   '0 4px 15px rgba(10,10,10,0.3)',
        'navbar':     '0 1px 0 0 rgba(0,0,0,0.08)',
      },

      // ─── Transiciones y timing ───────────────────────────────────────────
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },

      // ─── Animaciones custom ──────────────────────────────────────────────
      keyframes: {
        // Entrada de tarjetas de producto
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Entrada del drawer del carrito
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Badge del contador del carrito
        'pop': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        // Skeleton loader shimmer
        'shimmer': {
          '0%':   { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        // Overlay del carrito
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up':          'fade-up 0.4s ease-out forwards',
        'slide-in-right':   'slide-in-right 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
        'pop':              'pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':          'shimmer 1.5s infinite linear',
        'fade-in':          'fade-in 0.2s ease-out forwards',
      },

      // ─── Border radius ───────────────────────────────────────────────────
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },

      // ─── Espaciado extra (grid de producto) ─────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ─── Breakpoints (estándar Tailwind, reforzados) ─────────────────────
      screens: {
        'xs': '480px',
        // sm: 640px, md: 768px, lg: 1024px, xl: 1280px — defaults
        '2xl': '1400px',
        '3xl': '1600px',
      },
    },
  },

  plugins: [
    // Plugin inline: utilidad para el shimmer del skeleton
    function({ addUtilities }) {
      addUtilities({
        '.skeleton': {
          'background': 'linear-gradient(90deg, #EBEBEC 25%, #F7F7F8 50%, #EBEBEC 75%)',
          'background-size': '700px 100%',
          'animation': 'shimmer 1.5s infinite linear',
        },
        // Clip de texto para títulos gradiente
        '.text-clip': {
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        // Scrollbar thin para el drawer del carrito
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#EBEBEC transparent',
        },
      })
    },
  ],
}