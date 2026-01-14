import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  useEffect(() => {
    // Set year
    const yearEl = document.getElementById("y");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }
  }, []);

  const [isAnimatingCards, setIsAnimatingCards] = React.useState(false);

  const scrollToSection = (id) => {
    if (id === 'accueil') {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (id === 'fonctionnalites') {
      setIsAnimatingCards(true);
      setTimeout(() => setIsAnimatingCards(false), 800);
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{
      "--bg": "#071a2b",
      "--bg2": "#0b2a3f",
      "--card": "rgba(255,255,255,.08)",
      "--card2": "rgba(255,255,255,.06)",
      "--stroke": "rgba(255,255,255,.18)",
      "--text": "#eaf2ff",
      "--muted": "rgba(234,242,255,.72)",
      "--blue": "#2f74ff",
      "--teal": "#19d3c5",
      "--shadow": "0 18px 60px rgba(0,0,0,.35)",
      "--radius": "22px",
      margin: 0,
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\",\"Segoe UI Emoji\"",
      color: "var(--text)",
      minHeight: "100vh",
      overflowX: "hidden"
    }}>
      <style>{`
        :root{
          --bg:#071a2b;
          --bg2:#0b2a3f;
          --card:rgba(255,255,255,.08);
          --card2:rgba(255,255,255,.06);
          --stroke:rgba(255,255,255,.18);
          --text:#eaf2ff;
          --muted:rgba(234,242,255,.72);
          --blue:#2f74ff;
          --teal:#19d3c5;
          --shadow: 0 18px 60px rgba(0,0,0,.35);
          --radius:22px;
        }
        .lp-body {
          margin:0;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
          color:var(--text);
          background: 
            linear-gradient(rgba(7,26,43,.8), rgba(7,26,43,.6)),
            url("https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=2200&q=60");
          background-size:cover;
          background-position:center;
          background-attachment: fixed;
          background-repeat: no-repeat;
          min-height:100vh;
          width: 100%;
        }
        .lp-container{width:min(1120px, 92vw); margin:0 auto; padding-bottom: 40px;}

        /* Top glass frame like your example */
        .frame{
          margin:28px auto 40px;
          border-radius:28px;
          border:1px solid rgba(255,255,255,.14);
          background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
          box-shadow: var(--shadow);
          overflow:hidden;
          position:relative;
          backdrop-filter: blur(8px);
        }
        .frame::before{
          content:"";
          position:absolute; inset:0;
          background:
            radial-gradient(800px 420px at 30% 20%, rgba(25,211,197,.18), transparent 60%),
            radial-gradient(700px 420px at 80% 35%, rgba(47,116,255,.18), transparent 62%);
          pointer-events:none;
        }
        /* Blurred OR background */
        .bg-photo{
          position:absolute; inset:-30px;
          background: rgba(7,26,43, .1);
          backdrop-filter: blur(2px);
          pointer-events: none;
        }
        .lp-content{position:relative; z-index:2; padding:18px 18px 26px;}
        .lp-header{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:14px;
          padding:10px 8px 18px;
        }
        .brand{
          display:flex; align-items:center; gap:12px;
          font-weight:700; letter-spacing:.2px;
        }
        .logo{
          width:42px; height:42px;
          border-radius:14px;
          display:grid; place-items:center;
          background: linear-gradient(135deg, rgba(47,116,255,.95), rgba(25,211,197,.65));
          box-shadow: 0 10px 30px rgba(47,116,255,.22);
          border:1px solid rgba(255,255,255,.22);
        }
        .logo svg{opacity:.95}
        .lp-nav{
          display:flex; align-items:center; gap:26px;
          color:rgba(234,242,255,.82);
          font-weight:600;
        }
        .lp-nav a{
          opacity:.9; 
          cursor:pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .lp-nav a:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: var(--teal);
          transition: width 0.3s ease;
        }
        .lp-nav a:hover{
          opacity:1; 
          color: var(--teal); 
          transform: translateY(-2px);
        }
        .lp-nav a:hover:after {
          width: 100%;
        }
        .right{
          display:flex; align-items:center; gap:10px;
        }
        .icon-btn{
          width:42px; height:42px;
          border-radius:14px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.16);
          display:grid; place-items:center;
          cursor:pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .icon-btn:hover{
          background:rgba(255,255,255,.12);
          transform: scale(1.1) rotate(5deg);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 0 15px rgba(255,255,255,0.1);
        }
        .primary{
          padding:11px 16px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.18);
          background: linear-gradient(135deg, rgba(47,116,255,.95), rgba(47,116,255,.70));
          color:white;
          font-weight:800;
          box-shadow: 0 10px 30px rgba(47,116,255,.22);
          cursor:pointer;
          display:inline-flex; align-items:center; gap:10px;
          text-decoration:none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .primary:hover{
          filter:brightness(1.1); 
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 20px 40px rgba(47,116,255,.35);
        }
        .ghost{
          padding:11px 16px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.20);
          background:rgba(255,255,255,.06);
          color:rgba(234,242,255,.92);
          font-weight:800;
          cursor:pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ghost:hover{
          background:rgba(255,255,255,.12);
          transform: scale(1.05) translateY(-2px);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        /* Hero */
        .hero{
          display:grid;
          grid-template-columns: 1fr;
          gap:26px;
          align-items:center;
          padding:40px 10px 60px;
          text-align: center;
        }
        .kicker{
          display:inline-flex;
          gap:10px;
          align-items:center;
          padding:7px 12px;
          border-radius:999px;
          background:rgba(25,211,197,.10);
          border:1px solid rgba(25,211,197,.26);
          color:rgba(234,242,255,.92);
          font-weight:700;
          font-size:13px;
          margin: 0 auto;
          animation: fadeInDown 0.8s ease-out;
        }
        .lp-h1{
          margin:14px 0 10px;
          font-size: clamp(34px, 5vw, 64px);
          line-height:1.05;
          letter-spacing:-1.2px;
          color: white;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        .sub{
          margin:0 auto 24px;
          color:var(--muted);
          font-size: clamp(16px, 1.4vw, 20px);
          line-height:1.55;
          max-width:56ch;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        .cta{
          display:flex; gap:12px; flex-wrap:wrap;
          margin-top:24px;
          justify-content: center;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        .lp-divider{
          width:64px;
          height:3px;
          border-radius:999px;
          background: linear-gradient(90deg, var(--blue), var(--teal));
          margin:20px auto;
          opacity:1;
          animation: scaleIn 0.8s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }

        /* Features row */
        .features{
          margin-top:40px;
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap:18px;
          padding: 20px 10px 40px;
        }
        .lp-card{
          border-radius: 22px;
          border:1px solid rgba(255,255,255,.16);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          padding:24px 20px;
          backdrop-filter: blur(10px);
          min-height:180px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .lp-card:hover{
          transform: translateY(-12px) scale(1.03);
          border-color: var(--teal);
          background: rgba(255,255,255,.12);
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .card-anim-item {
          animation: cardPulse 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes cardPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); border-color: var(--teal); box-shadow: 0 0 30px rgba(25,211,197,0.3); }
          100% { transform: scale(1); }
        }
        .lp-card .ic{
          width:52px; height:52px;
          border-radius:18px;
          display:grid; place-items:center;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.14);
          margin-bottom:16px;
          transition: all 0.3s ease;
        }
        .lp-card:hover .ic {
          background: var(--blue);
          border-color: var(--blue);
          transform: rotate(10deg);
        }
        .lp-card h3{
          margin:0 0 8px;
          font-size:17px;
          letter-spacing:-.2px;
          color: white;
        }
        .lp-card p{
          margin:0;
          color:rgba(234,242,255,.75);
          font-size:14px;
          line-height:1.5;
        }

        /* Footer inside frame */
        .foot{
          padding: 24px 12px 24px;
          color:rgba(234,242,255,.55);
          font-size:13px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        /* Responsive */
        @media (max-width: 980px){
          .lp-nav{display:none}
          .features{grid-template-columns: 1fr 1fr}
        }
        @media (max-width: 560px){
          .features{grid-template-columns: 1fr}
          .right{display:none}
        }
      `}</style>
      <div className="lp-body">
        <main className="lp-container">
          <section className="frame" aria-label="Landing page Bloc Intelligent">
            <div className="bg-photo" aria-hidden="true"></div>

            <div className="lp-content">
              <header className="lp-header">
                <div className="brand">
                  <div className="logo" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" fill="white" opacity=".95" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '18px' }}>Bloc intelligent</div>
                </div>

                <nav className="lp-nav" aria-label="Navigation principale">
                  <a onClick={() => scrollToSection('accueil')}>Accueil</a>
                  <a onClick={() => scrollToSection('fonctionnalites')}>Fonctionnalités</a>
                  <a onClick={() => scrollToSection('apropos')}>À propos</a>
                </nav>

                <div className="right">
                  <button className="icon-btn" type="button" aria-label="Paramètres">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="white" strokeOpacity=".9" strokeWidth="2" />
                      <path d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.5-2-3.5-2.4.6a7.8 7.8 0 0 0-1.7-1l-.4-2.5H9l-.4 2.5a7.8 7.8 0 0 0-1.7 1L4.5 9 2.5 12.5l2 1.5a8 8 0 0 0 0 2l-2 1.5 2 3.5 2.4-.6a7.8 7.8 0 0 0 1.7 1l.4 2.5h6l.4-2.5a7.8 7.8 0 0 0 1.7-1l2.4.6 2-3.5-2-1.5Z"
                        stroke="white" strokeOpacity=".5" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </header>

              <section className="hero" id="accueil">
                <div>
                  <div className="kicker">
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }}></span>
                    Écosystème Chirurgical Intelligent
                  </div>

                  <h1 className="lp-h1">Optimisez vos Blocs Opératoires</h1>
                  <div className="lp-divider"></div>
                  <p className="sub">
                    La solution intelligente pour une gestion hospitalière fluide et sécurisée.
                    Planifiez, suivez et optimisez vos salles en temps réel avec une plateforme IA.
                  </p>

                  <div className="cta">
                    <Link className="primary" to="/app" aria-label="Démarrer">
                      Démarrer
                      <span aria-hidden="true">→</span>
                    </Link>
                    <button className="ghost" type="button" onClick={() => scrollToSection('fonctionnalites')}>
                      En savoir plus
                    </button>
                  </div>
                </div>

              </section>

              <section className="features" id="fonctionnalites" aria-label="Fonctionnalités clés">
                <article className={`lp-card ${isAnimatingCards ? 'card-anim-item' : ''}`} style={{ animationDelay: '0s' }}>
                  <div className="ic" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M7 3v3M17 3v3M4 8h16M6 12h3M6 16h3M11 12h3M11 16h3M16 12h3M16 16h3" stroke="white" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="white" strokeOpacity=".55" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3>Planification Intelligente</h3>
                  <p>Planifiez et optimisez automatiquement vos salles d’opération grâce à l’IA.</p>
                </article>

                <article className={`lp-card ${isAnimatingCards ? 'card-anim-item' : ''}`} style={{ animationDelay: '0.1s' }}>
                  <div className="ic" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2a5 5 0 0 0-5 5v1a3 3 0 0 0-2 3v1a3 3 0 0 0 2 3v1a5 5 0 0 0 10 0v-1a3 3 0 0 0 2-3v-1a3 3 0 0 0-2-3V7a5 5 0 0 0-5-5Z"
                        stroke="white" strokeOpacity=".55" strokeWidth="2" />
                      <path d="M12 10v4M10 12h4" stroke="white" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>Optimisation des Ressources</h3>
                  <p>Optimisez les ressources et maximisez l’efficacité de votre bloc opératoire.</p>
                </article>

                <article className={`lp-card ${isAnimatingCards ? 'card-anim-item' : ''}`} style={{ animationDelay: '0.2s' }}>
                  <div className="ic" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2 20 6v7c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-4Z"
                        stroke="white" strokeOpacity=".7" strokeWidth="2" strokeLinejoin="round" />
                      <path d="m9 12 2 2 4-5" stroke="white" strokeOpacity=".9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Sécurité &amp; Conformité</h3>
                  <p>Assurez la sécurité des patients et respectez les normes en vigueur.</p>
                </article>

                <article className={`lp-card ${isAnimatingCards ? 'card-anim-item' : ''}`} style={{ animationDelay: '0.3s' }}>
                  <div className="ic" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 5h16v11H4V5Z" stroke="white" strokeOpacity=".65" strokeWidth="2" />
                      <path d="M8 20h8" stroke="white" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round" />
                      <path d="M7 11h3l2-3 2 6 2-3h3" stroke="white" strokeOpacity=".9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Suivi en Temps Réel</h3>
                  <p>Surveillez toutes les interventions en temps réel depuis une interface intuitive.</p>
                </article>
              </section>

              <div className="foot" id="apropos">
                © <span id="y"></span> Bloc Intelligent — Plateforme IA pour blocs opératoires (landing page, sans tarifs).
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
