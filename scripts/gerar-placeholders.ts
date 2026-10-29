import fs from "fs";
import path from "path";

const produtos = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "prisma/data/catalogo-shopee-mock.json"), "utf8")
);

const outDir = path.join(process.cwd(), "public/produtos");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const categoryIcons: Record<string, { bg: string; accent: string; icon: string; label: string }> = {
  "cozinha-mesa": {
    bg: "#f0fdfa",
    accent: "#0d9488",
    label: "Cozinha & Mesa",
    icon: `<path d="M18 2v20M6 2v7a6 6 0 0 0 6 6v7M6 2a3 3 0 0 1 6 0v7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  },
  "conforto-banho": {
    bg: "#eff6ff",
    accent: "#3b82f6",
    label: "Conforto & Banho",
    icon: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  },
  "decoracao-aromas": {
    bg: "#faf5ff",
    accent: "#8b5cf6",
    label: "Decoração & Aromas",
    icon: `<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
  },
  "utilidades": {
    bg: "#fffbeb",
    accent: "#d97706",
    label: "Utilidades Inteligentes",
    icon: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  },
  "organizacao": {
    bg: "#f8fafc",
    accent: "#0284c7",
    label: "Organização & Casa",
    icon: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>`
  }
};

for (const p of produtos) {
  const imgPath = p.imagens[0];
  const filename = path.basename(imgPath);
  const cat = categoryIcons[p.categoria] || categoryIcons["utilidades"];
  
  // Wrap name into 2-3 lines
  const words = p.nome.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > 25) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());

  const textTspans = lines
    .slice(0, 3)
    .map((l, i) => `<tspan x="400" dy="${i === 0 ? 0 : 36}">${l}</tspan>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="grad-${p.shopeeItemId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cat.bg}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#grad-${p.shopeeItemId})" rx="32"/>
  <rect x="24" y="24" width="752" height="752" fill="none" stroke="${cat.accent}" stroke-opacity="0.15" stroke-width="2" rx="24"/>
  
  <g transform="translate(400, 290)">
    <circle r="90" fill="${cat.accent}" fill-opacity="0.1"/>
    <g transform="translate(-40, -40) scale(3.3)" color="${cat.accent}" fill="none">
      ${cat.icon}
    </g>
  </g>

  <rect x="280" y="440" width="240" height="38" rx="19" fill="${cat.accent}" fill-opacity="0.12"/>
  <text x="400" y="465" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${cat.accent}" text-anchor="middle">
    ${cat.label.toUpperCase()}
  </text>

  <text x="400" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1f2937" text-anchor="middle">
    ${textTspans}
  </text>

  <text x="400" y="710" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#9ca3af" text-anchor="middle">
    Casa &amp; Conforto • Achado Selecionado
  </text>
</svg>`;

  fs.writeFileSync(path.join(outDir, filename), svg, "utf8");
}

console.log(`Generated ${produtos.length} SVG placeholders in public/produtos/`);

