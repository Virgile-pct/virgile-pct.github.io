/* Mini parseur Markdown + frontmatter — zéro dépendance.
   Couvre : titres, gras/italique, code inline & blocs, listes, liens,
   images, citations, tableaux, hr. Suffisant pour des fiches projet. */

(function (global) {
  "use strict";

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Extrait le frontmatter YAML simplifié (clé: valeur, tags en liste
     "a, b, c") et renvoie { meta, body }. */
  function parseFrontmatter(raw) {
    const meta = {};
    let body = raw;
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (m) {
      body = raw.slice(m[0].length);
      m[1].split("\n").forEach(function (line) {
        const i = line.indexOf(":");
        if (i === -1) return;
        const key = line.slice(0, i).trim().toLowerCase();
        let value = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        if (key === "tags") {
          meta.tags = value
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map(function (t) { return t.trim(); })
            .filter(Boolean);
        } else {
          meta[key] = value;
        }
      });
    }
    return { meta: meta, body: body };
  }

  function inline(text) {
    return text
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function render(md) {
    const lines = md.split("\n");
    const out = [];
    let i = 0;

    while (i < lines.length) {
      let line = lines[i];

      /* Bloc de code ``` */
      if (/^```/.test(line)) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          buf.push(escapeHtml(lines[i]));
          i++;
        }
        i++;
        out.push("<pre><code>" + buf.join("\n") + "</code></pre>");
        continue;
      }

      /* Tableau */
      if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
        const header = line.split("|").slice(1, -1).map(function (c) { return c.trim(); });
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
          rows.push(lines[i].split("|").slice(1, -1).map(function (c) { return c.trim(); }));
          i++;
        }
        let html = "<table><thead><tr>";
        header.forEach(function (h) { html += "<th>" + inline(escapeHtml(h)) + "</th>"; });
        html += "</tr></thead><tbody>";
        rows.forEach(function (r) {
          html += "<tr>";
          r.forEach(function (c) { html += "<td>" + inline(escapeHtml(c)) + "</td>"; });
          html += "</tr>";
        });
        html += "</tbody></table>";
        out.push(html);
        continue;
      }

      /* hr */
      if (/^(---|\*\*\*|___)\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

      /* Titres */
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) {
        const level = h[1].length;
        out.push("<h" + level + ">" + inline(escapeHtml(h[2])) + "</h" + level + ">");
        i++;
        continue;
      }

      /* Citation */
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(inline(escapeHtml(lines[i].replace(/^>\s?/, ""))));
          i++;
        }
        out.push("<blockquote><p>" + buf.join("<br>") + "</p></blockquote>");
        continue;
      }

      /* Listes */
      if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        const ordered = /^\d+\.\s+/.test(line);
        const re = ordered ? /^\d+\.\s+/ : /^[-*+]\s+/;
        const buf = [];
        while (i < lines.length && re.test(lines[i])) {
          buf.push("<li>" + inline(escapeHtml(lines[i].replace(re, ""))) + "</li>");
          i++;
        }
        const tag = ordered ? "ol" : "ul";
        out.push("<" + tag + ">" + buf.join("") + "</" + tag + ">");
        continue;
      }

      /* Ligne vide */
      if (/^\s*$/.test(line)) { i++; continue; }

      /* Paragraphe */
      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^(#{1,3}\s|```|>|[-*+]\s|\d+\.\s|\||---\s*$)/.test(lines[i])) {
        buf.push(inline(escapeHtml(lines[i])));
        i++;
      }
      if (buf.length) out.push("<p>" + buf.join(" ") + "</p>");
    }

    return out.join("\n");
  }

  global.MiniMD = { render: render, parseFrontmatter: parseFrontmatter };
})(window);
