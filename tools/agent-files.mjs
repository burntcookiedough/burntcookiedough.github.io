// Builds everything search engines and AI agents read, from projects.js:
//   llms.txt, profile.md, resume.json, sitemap.xml, robots.txt,
//   and two generated blocks inside index.html (head metadata + JSON-LD, and a
//   plain-HTML profile that main.js removes once the scenes load).
// Run after editing projects.js:  node tools/agent-files.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const write = (f, s) => { writeFileSync(join(ROOT, f), s); console.log("wrote", f); };

const window = {};
new Function("window", read("projects.js"))(window);
const { SITE, PROJECTS, PATENTS, PROFILE: P } = window;
const URL = P.url;
const NAME = "Anshul Panigrahi";
const today = new Date().toISOString().slice(0, 10);
const abs = (p) => new globalThis.URL(p, URL).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isoDate = (d) => d.split(".").reverse().join("-"); // 20.03.2026 -> 2026-03-20
const month = (ym) => new Date(ym + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const projects = PROJECTS.map((p) => ({ ...p, repo: (p.links.find((l) => /github\.com/.test(l.href)) || {}).href }));
const patents = PATENTS.filter((p) => p.number);
const allSkills = Object.values(P.skills).flat();

// ─────────── profile.md: the whole portfolio as one readable document ───────────
const md = [];
md.push(`# ${NAME}`, "", `${P.headline}. ${P.location}.`, "", P.summary, "");
md.push(`- Website: ${URL}`, `- MCP server (ask your AI assistant about me): ${P.mcp.repo}`, `- Resume (PDF): ${SITE.resume}`, `- Email: ${SITE.email}`, `- GitHub: ${SITE.github}`, `- LinkedIn: ${SITE.linkedin}`, `- Looking for: ${P.seeking}`, "");
md.push("## Experience", "");
for (const e of P.experience) {
  md.push(`### ${e.role}, ${e.org}`, `${month(e.start)} to ${month(e.end)}`, "");
  e.points.forEach((x) => md.push(`- ${x}`));
  md.push("");
}
md.push("## Open source", "");
for (const o of P.openSource) md.push(`- Merged PR to ${o.repo} (${o.about}), ${o.merged}: ${o.title}. ${o.summary} ${o.url}`);
md.push("", "## Projects", "");
for (const p of projects) {
  md.push(`### ${p.full}`, `${p.track.toLowerCase()} · ${p.stack.join(", ")}`, "", p.blurb, "", `Why it matters: ${p.why}`);
  if (p.links.length) md.push("", ...p.links.map((l) => `- ${l.label}: ${l.href}`));
  if (p.note) md.push("", p.note);
  md.push("");
}
md.push("## Published patent applications (co-inventor)", "");
for (const p of patents) {
  md.push(`### ${p.title}`, `${p.number} · filed ${p.filed}, published ${p.published} (journal ${p.journal}) · ${p.office} · applicant: ${p.applicant}`, `Inventors: ${p.inventors.join(", ")}`, "", p.plain, "");
  p.facts.forEach((f) => md.push(`- ${f}`));
  md.push(`- Full publication (PDF): ${abs(p.pdf)}`, "");
}
md.push("## Education", "");
for (const e of P.education) md.push(`- ${e.degree}, ${e.school}, ${e.place} (${e.start} to ${e.end}). ${e.note}.`);
md.push("", "## Skills", "");
for (const [k, v] of Object.entries(P.skills)) md.push(`- ${k}: ${v.join(", ")}`);
md.push("", "## Achievements", "");
for (const a of P.achievements) md.push(`- ${a.what} (${month(a.when)}): ${a.note}`);
md.push("", "## Certifications", "");
for (const c of P.certifications) md.push(`- ${c.name}, ${c.by} (${month(c.when)})`);
md.push("", `Currently building: ${SITE.nowBuilding}.`, "", `Last updated ${today}.`, "");
write("profile.md", md.join("\n"));

// ─────────── llms.txt: the short map an agent reads first (llmstxt.org) ───────────
const lt = [];
lt.push(`# ${NAME}`, "", `> ${P.headline}. Co-inventor on ${patents.length} published patent applications. ${P.education[0].degree}, ${P.education[0].school}, graduating ${P.education[0].end}. Open to ${P.seeking}.`, "");
lt.push("The website is an interactive canvas experience; the files below carry the same content as text.", "");
lt.push("## Profile", "");
lt.push(`- [Full profile](${abs("profile.md")}): experience, projects, patents, skills, education in one Markdown file`);
lt.push(`- [Resume (PDF)](${SITE.resume}): one-page resume`);
lt.push(`- [resume.json](${abs("resume.json")}): the same resume in JSON Resume format`);
lt.push(`- [Email](mailto:${SITE.email}): ${SITE.email}`);
lt.push(`- [GitHub](${SITE.github}) · [LinkedIn](${SITE.linkedin})`);
lt.push(`- [MCP server](${P.mcp.repo}): the same profile as live tools for any MCP client. Add it with: \`${P.mcp.add}\``, "");
lt.push("## Projects", "");
for (const p of projects) lt.push(`- [${p.full}](${p.repo || abs("profile.md")}): ${p.blurb}`);
lt.push("", "## Open source", "");
for (const o of P.openSource) lt.push(`- [Merged: ${o.repo}#${o.url.split("/").pop()}](${o.url}): ${o.title}. ${o.summary}`);
lt.push("", "## Patents", "");
for (const p of patents) lt.push(`- [${p.number}: ${p.title}](${abs(p.pdf)}): ${p.plain}`);
lt.push("", "## Optional", "");
lt.push(`- [Website](${URL}): the portfolio itself (best viewed in a browser)`, "");
write("llms.txt", lt.join("\n"));

// ─────────── resume.json (jsonresume.org schema v1) ───────────
const resume = {
  $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics: {
    name: NAME, label: P.headline, email: SITE.email, url: URL, summary: P.summary,
    location: { city: "Vellore", countryCode: "IN" },
    profiles: [
      { network: "GitHub", username: SITE.github.split("/").pop(), url: SITE.github },
      { network: "LinkedIn", username: SITE.linkedin.split("/").pop(), url: SITE.linkedin },
    ],
  },
  work: P.experience.map((e) => ({ name: e.org, position: e.role, startDate: e.start, endDate: e.end, highlights: e.points })),
  education: P.education.map((e) => ({ institution: e.school, area: "Information Technology", studyType: "B.Tech", startDate: e.start, endDate: "2027", score: e.note.replace("CGPA ", "") })),
  awards: P.achievements.map((a) => ({ title: a.what, date: a.when, summary: a.note })),
  certificates: P.certifications.map((c) => ({ name: c.name, issuer: c.by, date: c.when })),
  publications: patents.map((p) => ({ name: `${p.title} (${p.number})`, publisher: p.office, releaseDate: isoDate(p.published), url: abs(p.pdf), summary: p.plain })),
  skills: Object.entries(P.skills).map(([name, keywords]) => ({ name, keywords })),
  projects: [...P.openSource.map((o) => ({ name: `Open source: ${o.repo}`, description: `Merged pull request: ${o.title}`, highlights: [o.summary], keywords: ["Open source", "Python", "Testing"], url: o.url, endDate: o.merged })), ...projects.map((p) => ({ name: p.full, description: p.blurb, highlights: [p.why], keywords: p.stack, url: p.repo }))],
  meta: { canonical: abs("resume.json"), lastModified: today },
};
write("resume.json", JSON.stringify(resume, null, 2) + "\n");

// ─────────── sitemap.xml + robots.txt ───────────
const urls = [URL, ...patents.map((p) => abs(p.dir + "/")), abs("profile.md"), abs("llms.txt"), abs("resume.json"), ...patents.map((p) => abs(p.pdf))];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
const bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];
write("robots.txt", `# Everyone is welcome, people and agents alike.
# A text version of this site for language models: ${abs("llms.txt")}
User-agent: *
Allow: /

${bots.map((b) => `User-agent: ${b}`).join("\n")}
Allow: /

Sitemap: ${abs("sitemap.xml")}
`);

// ─────────── index.html: head metadata + JSON-LD ───────────
const person = { "@id": URL + "#person" };
const graph = [
  { "@type": "ProfilePage", "@id": URL + "#page", url: URL, name: P.title, dateModified: today, mainEntity: person },
  {
    "@type": "Person", ...person, name: NAME, url: URL, image: abs("og.jpg"), jobTitle: "AI Engineer",
    description: P.summary, email: `mailto:${SITE.email}`, sameAs: [SITE.github, SITE.linkedin],
    address: { "@type": "PostalAddress", addressLocality: "Vellore", addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: P.education[0].school },
    knowsAbout: ["Large language models", "AI agents", "Tool use", "Agent orchestration", "LLM inference", ...allSkills],
    seeks: { "@type": "Demand", description: P.seeking },
    award: P.achievements.map((a) => a.what),
    hasCredential: P.certifications.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.name, credentialCategory: "certificate", recognizedBy: { "@type": "Organization", name: c.by } })),
  },
  ...projects.map((p) => ({
    "@type": "SoftwareSourceCode", name: p.full, description: p.blurb, keywords: p.stack.join(", "),
    ...(p.repo ? { codeRepository: p.repo, url: p.repo } : {}), author: person,
  })),
  ...patents.map((p) => ({
    "@type": "CreativeWork", additionalType: "https://www.wikidata.org/wiki/Q253623", name: p.title,
    identifier: p.number, abstract: p.plain, datePublished: isoDate(p.published), url: abs(p.pdf), encodingFormat: "application/pdf",
    publisher: { "@type": "GovernmentOrganization", name: p.office },
    author: p.inventors.map((n) => (n === NAME ? person : { "@type": "Person", name: n })),
  })),
];
const desc = `${P.headline}. ${patents.length} published patents, B.Tech IT at VIT. Open to AI engineering internships.`;
const head = `
  <link rel="canonical" href="${URL}" />
  <meta name="author" content="${NAME}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${URL}" />
  <meta property="og:site_name" content="${NAME}" />
  <meta property="og:title" content="${esc(P.title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${abs("og.jpg")}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${NAME}, AI engineer: the city scene from the portfolio" />
  <meta property="profile:first_name" content="Anshul" />
  <meta property="profile:last_name" content="Panigrahi" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(P.title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${abs("og.jpg")}" />
  <link rel="alternate" type="text/markdown" href="profile.md" title="Profile as Markdown" />
  <link rel="alternate" type="application/json" href="resume.json" title="JSON Resume" />
  <link rel="help" type="text/plain" href="llms.txt" title="llms.txt" />
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>
  `;

// ─────────── index.html: the plain-HTML profile (removed by main.js on load) ───────────
const li = (s) => `<li>${s}</li>`;
const a = (href, text, rel = "") => `<a href="${esc(href)}"${rel ? ` rel="${rel}"` : ""}>${esc(text)}</a>`;
const body = `
  <article class="plain-profile" id="plain-profile">
    <h2>${NAME}: ${esc(P.headline)}</h2>
    <p>${esc(P.summary)}</p>
    <p>${a(SITE.resume, "Resume (PDF)")} · ${a("mailto:" + SITE.email, SITE.email)} · ${a(SITE.github, "GitHub", "me")} · ${a(SITE.linkedin, "LinkedIn", "me")} · ${a("profile.md", "Profile as text")}</p>
    <h3>Experience</h3>
    ${P.experience.map((e) => `<h4>${esc(e.role)}, ${esc(e.org)} (${month(e.start)} to ${month(e.end)})</h4>
    <ul>${e.points.map((x) => li(esc(x))).join("")}</ul>`).join("\n    ")}
    <h3>Open source</h3>
    <ul>${P.openSource.map((o) => li(`${a(o.url, `Merged: ${o.repo}`)} (${esc(o.about)}): ${esc(o.title)}. ${esc(o.summary)}`)).join("")}</ul>
    <h3>Projects</h3>
    ${projects.map((p) => `<section>
      <h4>${esc(p.full)}</h4>
      <p>${esc(p.blurb)} ${esc(p.why)}</p>
      <p>${esc(p.stack.join(" · "))}${p.links.length ? " · " + p.links.map((l) => a(l.href, l.label)).join(" · ") : ""}${p.note ? " · " + esc(p.note) : ""}</p>
    </section>`).join("\n    ")}
    <h3>Published patent applications</h3>
    <ul>${patents.map((p) => li(`${a(p.pdf, p.number)}: ${esc(p.title)}. ${esc(p.plain)}`)).join("")}</ul>
    <h3>Achievements and certifications</h3>
    <ul>${P.achievements.map((x) => li(esc(`${x.what} (${month(x.when)}): ${x.note}`))).join("")}${P.certifications.map((c) => li(esc(`${c.name}, ${c.by} (${month(c.when)})`))).join("")}</ul>
    <h3>Education</h3>
    <ul>${P.education.map((e) => li(esc(`${e.degree}, ${e.school} (${e.start} to ${e.end}). ${e.note}.`))).join("")}</ul>
    <h3>Skills</h3>
    <ul>${Object.entries(P.skills).map(([k, v]) => li(esc(`${k}: ${v.join(", ")}`))).join("")}</ul>
  </article>
  `;

// ─────────── patents/NN/index.html: one readable, shareable page per patent ───────────
// (the link LinkedIn and others preview; og.jpg comes from tools/patent-cards.py)
for (const [n, p] of patents.entries()) {
  const url = abs(p.dir + "/");
  const pages = Array.from({ length: p.pages }, (_, i) => `p${String(i + 1).padStart(2, "0")}.webp`);
  const ld = {
    "@context": "https://schema.org", "@type": "CreativeWork", additionalType: "https://www.wikidata.org/wiki/Q253623",
    name: p.title, identifier: p.number, abstract: p.plain, datePublished: isoDate(p.published), url, encoding: { "@type": "MediaObject", contentUrl: abs(p.pdf), encodingFormat: "application/pdf" },
    publisher: { "@type": "GovernmentOrganization", name: p.office },
    author: p.inventors.map((x) => (x === NAME ? { "@id": URL + "#person", "@type": "Person", name: NAME, url: URL } : { "@type": "Person", name: x })),
  };
  const title = `${p.number}: ${p.title}`;
  write(`${p.dir}/index.html`, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} | ${NAME}</title>
  <meta name="description" content="${esc(p.plain)}" />
  <link rel="canonical" href="${url}" />
  <meta name="theme-color" content="#1d36d6" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="${NAME}" />
  <meta property="og:title" content="Patent ${esc(p.number)} | ${esc(p.short)}" />
  <meta property="og:description" content="${esc(p.plain)}" />
  <meta property="og:image" content="${abs(p.dir + "/og.jpg")}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Big+Shoulders+Display:wght@800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
  <style>
    :root { --cobalt: #1d36d6; --navy: #0e164a; --cream: #efe4cc; --paper: #faf6ec; --pale: #e9ebf6; }
    * { box-sizing: border-box; margin: 0; }
    body { background: var(--pale); color: var(--navy); font: 16px/1.6 Archivo, system-ui, sans-serif; }
    a { color: var(--cobalt); }
    header { background: var(--cobalt); color: var(--cream); padding: 18px 20px; }
    header a { color: var(--cream); font-weight: 700; text-decoration: none; letter-spacing: .01em; }
    main { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }
    .k { font: 600 12px/1.4 "JetBrains Mono", monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--cobalt); }
    h1 { margin-top: 14px; font: 900 clamp(34px, 6vw, 60px)/.95 "Big Shoulders Display", sans-serif; text-transform: uppercase; color: var(--cobalt); text-wrap: balance; }
    .plain { margin-top: 20px; font-size: 19px; max-width: 640px; }
    ul.facts { margin-top: 18px; padding: 0; list-style: none; border-top: 1.5px solid var(--navy); }
    ul.facts li { padding: 10px 0; border-bottom: 1px solid rgba(14, 22, 74, .2); font-weight: 600; }
    dl { display: grid; grid-template-columns: 120px 1fr; gap: 6px 18px; margin-top: 26px; font-size: 14px; }
    dt { font: 600 11px/1.9 "JetBrains Mono", monospace; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }
    .cta { display: inline-block; margin-top: 28px; padding: 12px 18px; background: var(--cobalt); color: var(--cream); font-weight: 700; text-decoration: none; border-radius: 4px; }
    .pages { margin-top: 48px; display: grid; gap: 22px; }
    .pages img { width: 100%; height: auto; display: block; background: var(--paper); box-shadow: 0 1px 0 rgba(14, 22, 74, .2), 6px 6px 0 rgba(29, 54, 214, .14); }
    footer { margin-top: 48px; font-size: 14px; }
    @media (max-width: 560px) { dl { grid-template-columns: 1fr; gap: 0 0; } dd { margin-bottom: 10px; } }
  </style>
</head>
<body>
  <header><a href="../../">&#8592; ${NAME}</a></header>
  <main>
    <p class="k">Published patent application ${n + 1} of ${patents.length} · Journal ${esc(p.journal)}</p>
    <h1>${esc(p.title)}</h1>
    <p class="plain">${esc(p.plain)}</p>
    <ul class="facts">${p.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    <dl>
      <dt>Number</dt><dd>${esc(p.number)}</dd>
      <dt>Filed</dt><dd>${esc(p.filed)}</dd>
      <dt>Published</dt><dd>${esc(p.published)}, journal ${esc(p.journal)}</dd>
      <dt>Office</dt><dd>${esc(p.office)}</dd>
      <dt>Applicant</dt><dd>${esc(p.applicant)}</dd>
      <dt>Inventors</dt><dd>${p.inventors.map((x) => (x === NAME ? `<strong>${esc(x)}</strong>` : esc(x))).join(", ")}</dd>
    </dl>
    <a class="cta" href="${esc(p.pdf.split("/").pop())}">Open the official PDF (${p.pages} pages)</a>
    <section class="pages" aria-label="The publication, page by page">
      ${pages.map((f, i) => `<img src="${f}" alt="Page ${i + 1} of ${p.pages}" width="1100" loading="${i ? "lazy" : "eager"}" decoding="async" />`).join("\n      ")}
    </section>
    <footer>${NAME} · <a href="../../">Portfolio</a> · <a href="${SITE.linkedin}">LinkedIn</a> · <a href="mailto:${SITE.email}">${SITE.email}</a></footer>
  </main>
</body>
</html>
`);
}

let html = read("index.html");
const put = (name, content) => {
  const re = new RegExp(`(<!-- agent:${name} -->)[\\s\\S]*?(<!-- /agent:${name} -->)`);
  if (!re.test(html)) throw new Error(`index.html is missing <!-- agent:${name} --> markers`);
  html = html.replace(re, `$1${content}$2`);
};
put("head", head);
put("body", body);
write("index.html", html);
