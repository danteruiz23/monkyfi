export const I18N = {
  EN: {
    'nav.products':'Products','nav.network':'Network','nav.process':'How it Works','nav.contact':'Contact','nav.cta':'Book a call →',
    'hero.eyebrow':'The US–LATAM Telecom · AI Bridge',
    'hero.h1':'Get <span class="fi">AI Power</span> on the seam where your network actually lives.',
    'hero.sub':'Monkyfi is a boutique consultancy + product studio for carriers, hyperscalers and enterprises operating between the Americas. We turn more than 20 years of subsea NOC experience into autonomous network intelligence.',
    'hero.cta1':'Start a project','hero.cta2':'See what we ship',
    'products.eyebrow':'Three product lines · one masthead',
    'products.subtitle':'Each line stands alone. Together, they cover the entire US–LATAM network value chain — from procurement to autonomous NOC.',
    'network.eyebrow':'Live · US–LATAM backbone',
    'network.heading':'We\'re literally on the seam where this <span class="glow">$16B of capex</span> is landing.',
    'network.sideHeading':'Routes we know by heart.',
    'network.sideBody':'Hands-on operations of the major US–LATAM subsea ring (25,000 km · 16 landing stations · 20 Tbps) for over a decade. When a cable cuts at 3am, we already know the rerouting playbook.',
    'process.eyebrow':'How we engage','process.heading':'Boutique cadence. Operator-grade execution.',
    'cta.eyebrow':'Capacity for Q3 · 2026','cta.heading':'Two retainers open. Let\'s see if we fit.',
    'cta.body':'If you operate any meaningful capacity between the US and LATAM — or you\'re an enterprise tired of carriers that don\'t speak your team\'s language — we should talk.',
    'cta.email':'Email Monkyfi','cta.ask':'Ask the AI first',
  },
  ES: {
    'nav.products':'Productos','nav.network':'Red','nav.process':'Cómo trabajamos','nav.contact':'Contacto','nav.cta':'Agendar llamada →',
    'hero.eyebrow':'El puente Telecom · IA entre EE.UU. y LATAM',
    'hero.h1':'Activá <span class="fi">el poder de la IA</span> donde tu red realmente vive.',
    'hero.sub':'Monkyfi es una consultora boutique + estudio de producto para carriers, hyperscalers y empresas que operan entre las Américas. Convertimos más de 20 años de experiencia en NOC submarino en inteligencia de red autónoma.',
    'hero.cta1':'Iniciar proyecto','hero.cta2':'Ver qué hacemos',
    'products.eyebrow':'Tres líneas de producto · una marca',
    'products.subtitle':'Cada línea funciona por sí sola. Juntas cubren toda la cadena de valor de red EE.UU.–LATAM — desde compras hasta NOC autónomo.',
    'network.eyebrow':'En vivo · backbone EE.UU.–LATAM',
    'network.heading':'Estamos justo en la costura donde aterrizan estos <span class="glow">$16B de capex</span>.',
    'network.sideHeading':'Rutas que conocemos de memoria.',
    'network.sideBody':'Operación práctica del principal anillo submarino EE.UU.–LATAM (25.000 km · 16 estaciones · 20 Tbps) por más de una década. Cuando un cable se corta a las 3 am, ya sabemos el plan de reenrutamiento.',
    'process.eyebrow':'Cómo nos contratás','process.heading':'Ritmo boutique. Ejecución de operador.',
    'cta.eyebrow':'Cupos para Q3 · 2026','cta.heading':'Dos retainers abiertos. Veamos si encajamos.',
    'cta.body':'Si operás capacidad relevante entre EE.UU. y LATAM — o sos una empresa cansada de carriers que no hablan tu idioma — hablemos.',
    'cta.email':'Escribir a Monkyfi','cta.ask':'Preguntale a la IA',
  },
  PT: {
    'nav.products':'Produtos','nav.network':'Rede','nav.process':'Como trabalhamos','nav.contact':'Contato','nav.cta':'Agendar conversa →',
    'hero.eyebrow':'A ponte Telecom · IA entre EUA e LATAM',
    'hero.h1':'Ative <span class="fi">o poder da IA</span> onde sua rede realmente vive.',
    'hero.sub':'A Monkyfi é uma consultoria boutique + estúdio de produto para carriers, hyperscalers e empresas que operam entre as Américas. Transformamos mais de 20 anos de experiência em NOC submarino em inteligência de rede autônoma.',
    'hero.cta1':'Iniciar projeto','hero.cta2':'Veja o que entregamos',
    'products.eyebrow':'Três linhas de produto · uma marca',
    'products.subtitle':'Cada linha funciona sozinha. Juntas, cobrem toda a cadeia de valor de rede EUA–LATAM — de procurement a NOC autônomo.',
    'network.eyebrow':'Ao vivo · backbone EUA–LATAM',
    'network.heading':'Estamos exatamente na costura onde aterrissam estes <span class="glow">$16B de capex</span>.',
    'network.sideHeading':'Rotas que conhecemos de cor.',
    'network.sideBody':'Operação prática do principal anel submarino EUA–LATAM (25.000 km · 16 estações · 20 Tbps) por mais de uma década. Quando um cabo se rompe às 3 da manhã, já temos o playbook de rerouting.',
    'process.eyebrow':'Como engajamos','process.heading':'Cadência boutique. Execução de operador.',
    'cta.eyebrow':'Capacidade para Q3 · 2026','cta.heading':'Dois retainers abertos. Vamos ver se encaixa.',
    'cta.body':'Se você opera capacidade relevante entre EUA e LATAM — ou é uma empresa cansada de carriers que não falam sua língua — vamos conversar.',
    'cta.email':'Escrever para Monkyfi','cta.ask':'Pergunte à IA',
  },
};

export function getTranslation(lang, key) {
  const dict = I18N[lang] || I18N.EN;
  return dict[key];
}

export function getSupportedLanguages() {
  return Object.keys(I18N);
}

export function formatChatMessage(text) {
  return text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
