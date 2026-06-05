import * as l from 'react';
import * as f from 'react/jsx-runtime';
import { venues, teams, players, featured, groups, matches } from './data/index.js';

let
  p = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#06090f}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0d1220}::-webkit-scrollbar-thumb{background:#f4b942;border-radius:2px}`,
  m = {
    UEFA: { color: `#3b82f6`, bg: `rgba(59,130,246,0.12)` },
    CONMEBOL: { color: `#22c55e`, bg: `rgba(34,197,94,0.12)` },
    CONCACAF: { color: `#f97316`, bg: `rgba(249,115,22,0.12)` },
    CAF: { color: `#f59e0b`, bg: `rgba(245,158,11,0.12)` },
    AFC: { color: `#a855f7`, bg: `rgba(168,85,247,0.12)` },
    OFC: { color: `#06b6d4`, bg: `rgba(6,182,212,0.12)` },
  },
  h = (e) => m[e]?.color || `#aaa`,
  g = (e) => {
    if (!e) return `#888`;
    let t = e.toLowerCase();
    return t.includes(`goal`)
      ? `#f59e0b`
      : t.includes(`back`) || t.includes(`def`) || t.includes(`centre-b`)
        ? `#3b82f6`
        : t.includes(`mid`)
          ? `#22c55e`
          : `#ef4444`;
  },
  _ = venues,
  v = teams,
  y = players,
  b = {
    WC: {
      label: `🏆 WC Winner`,
      color: `#f4b942`,
      bg: `rgba(244,185,66,0.15)`,
    },
    BD: {
      label: `🥇 Ballon dOr`,
      color: `#f97316`,
      bg: `rgba(249,115,22,0.15)`,
    },
    UCL: {
      label: `⭐ UCL Winner`,
      color: `#4ade80`,
      bg: `rgba(74,222,128,0.15)`,
    },
    EURO: {
      label: `🇪🇺 Euro Winner`,
      color: `#3b82f6`,
      bg: `rgba(59,130,246,0.15)`,
    },
    AFCON: {
      label: `🌍 AFCON Winner`,
      color: `#a855f7`,
      bg: `rgba(168,85,247,0.15)`,
    },
    GB: {
      label: `👟 Golden Boot`,
      color: `#ef4444`,
      bg: `rgba(239,68,68,0.15)`,
    },
    PENS: {
      label: `🧤 Shootout Hero`,
      color: `#06b6d4`,
      bg: `rgba(6,182,212,0.15)`,
    },
    WCG: { label: `⚽ WC Goals`, color: `#22c55e`, bg: `rgba(34,197,94,0.15)` },
  },
  x = featured,
  ee = {
    messi: {
      ov: 95,
      pa: 85,
      sh: 93,
      ps: 91,
      dr: 96,
      df: 42,
      ph: 68,
      bd: [`WC`, `BD`, `UCL`, `WCG`],
    },
    mbappe: {
      ov: 93,
      pa: 97,
      sh: 90,
      ps: 82,
      dr: 92,
      df: 40,
      ph: 78,
      bd: [`WC`, `UCL`, `WCG`],
    },
    vinicius: {
      ov: 92,
      pa: 95,
      sh: 84,
      ps: 78,
      dr: 93,
      df: 34,
      ph: 73,
      bd: [`UCL`],
    },
    bellingham: {
      ov: 91,
      pa: 82,
      sh: 86,
      ps: 88,
      dr: 89,
      df: 78,
      ph: 84,
      bd: [`UCL`],
    },
    rodri: {
      ov: 91,
      pa: 68,
      sh: 72,
      ps: 90,
      dr: 78,
      df: 86,
      ph: 80,
      bd: [`UCL`, `EURO`, `BD`],
    },
    salah: {
      ov: 91,
      pa: 92,
      sh: 88,
      ps: 83,
      dr: 90,
      df: 45,
      ph: 72,
      bd: [`UCL`, `GB`],
    },
    "de-bruyne": {
      ov: 91,
      pa: 72,
      sh: 86,
      ps: 93,
      dr: 85,
      df: 63,
      ph: 80,
      bd: [`UCL`, `EURO`],
    },
    "van-dijk": {
      ov: 91,
      pa: 70,
      sh: 56,
      ps: 82,
      dr: 72,
      df: 92,
      ph: 88,
      bd: [`UCL`],
    },
    son: {
      ov: 89,
      pa: 89,
      sh: 87,
      ps: 82,
      dr: 88,
      df: 44,
      ph: 74,
      bd: [`UCL`, `WCG`],
    },
    kane: {
      ov: 89,
      pa: 72,
      sh: 92,
      ps: 83,
      dr: 78,
      df: 40,
      ph: 82,
      bd: [`GB`],
    },
    modric: {
      ov: 89,
      pa: 75,
      sh: 76,
      ps: 93,
      dr: 90,
      df: 70,
      ph: 64,
      bd: [`UCL`, `BD`],
    },
    yamal: {
      ov: 90,
      pa: 88,
      sh: 80,
      ps: 85,
      dr: 92,
      df: 44,
      ph: 68,
      bd: [`EURO`],
    },
    ronaldo: {
      ov: 88,
      pa: 82,
      sh: 91,
      ps: 78,
      dr: 85,
      df: 34,
      ph: 75,
      bd: [`UCL`, `BD`],
    },
    alisson: {
      ov: 90,
      pa: 62,
      sh: 30,
      ps: 82,
      dr: 48,
      df: 90,
      ph: 76,
      bd: [`UCL`, `GB`],
    },
    "emi-martinez": {
      ov: 88,
      pa: 68,
      sh: 28,
      ps: 72,
      dr: 46,
      df: 88,
      ph: 74,
      bd: [`WC`, `PENS`],
    },
    maignan: {
      ov: 88,
      pa: 64,
      sh: 28,
      ps: 84,
      dr: 48,
      df: 88,
      ph: 78,
      bd: [`WC`],
    },
    neuer: {
      ov: 86,
      pa: 74,
      sh: 32,
      ps: 82,
      dr: 52,
      df: 88,
      ph: 72,
      bd: [`UCL`, `WC`],
    },
    pickford: {
      ov: 82,
      pa: 70,
      sh: 25,
      ps: 70,
      dr: 44,
      df: 84,
      ph: 72,
      bd: [],
    },
    livakovic: {
      ov: 83,
      pa: 66,
      sh: 26,
      ps: 72,
      dr: 44,
      df: 84,
      ph: 72,
      bd: [`PENS`],
    },
    "diogo-costa": {
      ov: 85,
      pa: 68,
      sh: 28,
      ps: 80,
      dr: 46,
      df: 86,
      ph: 74,
      bd: [`PENS`],
    },
    valverde: {
      ov: 88,
      pa: 85,
      sh: 82,
      ps: 83,
      dr: 84,
      df: 78,
      ph: 86,
      bd: [`UCL`],
    },
    bernardo: {
      ov: 88,
      pa: 82,
      sh: 78,
      ps: 91,
      dr: 88,
      df: 72,
      ph: 77,
      bd: [`UCL`, `EURO`],
    },
    pedri: {
      ov: 87,
      pa: 76,
      sh: 75,
      ps: 90,
      dr: 89,
      df: 72,
      ph: 68,
      bd: [`EURO`],
    },
    saka: { ov: 87, pa: 85, sh: 83, ps: 83, dr: 88, df: 62, ph: 72, bd: [] },
    wirtz: { ov: 87, pa: 82, sh: 83, ps: 86, dr: 90, df: 60, ph: 72, bd: [] },
    musiala: { ov: 87, pa: 84, sh: 80, ps: 83, dr: 92, df: 58, ph: 72, bd: [] },
    "nico-williams": {
      ov: 86,
      pa: 91,
      sh: 78,
      ps: 80,
      dr: 90,
      df: 42,
      ph: 70,
      bd: [`EURO`],
    },
    "julian-alv": {
      ov: 86,
      pa: 84,
      sh: 85,
      ps: 80,
      dr: 84,
      df: 60,
      ph: 82,
      bd: [`WC`, `WCG`],
    },
    lautaro: {
      ov: 86,
      pa: 74,
      sh: 88,
      ps: 76,
      dr: 80,
      df: 44,
      ph: 82,
      bd: [`WC`, `UCL`],
    },
    "ruben-dias": {
      ov: 88,
      pa: 72,
      sh: 54,
      ps: 82,
      dr: 70,
      df: 92,
      ph: 84,
      bd: [`UCL`, `EURO`],
    },
    araujo: {
      ov: 86,
      pa: 78,
      sh: 52,
      ps: 76,
      dr: 64,
      df: 90,
      ph: 88,
      bd: [`UCL`],
    },
    "romero-ct": {
      ov: 86,
      pa: 72,
      sh: 56,
      ps: 76,
      dr: 68,
      df: 90,
      ph: 86,
      bd: [`WC`],
    },
    lisandro: {
      ov: 85,
      pa: 70,
      sh: 54,
      ps: 78,
      dr: 68,
      df: 88,
      ph: 84,
      bd: [`WC`],
    },
    "de-ligt": {
      ov: 85,
      pa: 72,
      sh: 56,
      ps: 78,
      dr: 70,
      df: 88,
      ph: 82,
      bd: [`UCL`],
    },
    koulibaly: {
      ov: 84,
      pa: 70,
      sh: 54,
      ps: 76,
      dr: 68,
      df: 90,
      ph: 86,
      bd: [`AFCON`],
    },
    kimmich: {
      ov: 86,
      pa: 72,
      sh: 74,
      ps: 89,
      dr: 80,
      df: 82,
      ph: 78,
      bd: [`UCL`],
    },
    rice: { ov: 85, pa: 76, sh: 72, ps: 83, dr: 78, df: 82, ph: 82, bd: [] },
    "mac-allister": {
      ov: 85,
      pa: 78,
      sh: 78,
      ps: 85,
      dr: 82,
      df: 76,
      ph: 78,
      bd: [`WC`, `UCL`],
    },
    "enzo-fern": {
      ov: 85,
      pa: 78,
      sh: 78,
      ps: 86,
      dr: 82,
      df: 74,
      ph: 78,
      bd: [`WC`],
    },
    hakimi: {
      ov: 85,
      pa: 92,
      sh: 72,
      ps: 76,
      dr: 85,
      df: 76,
      ph: 78,
      bd: [`UCL`, `WCG`],
    },
    xhaka: {
      ov: 83,
      pa: 68,
      sh: 72,
      ps: 86,
      dr: 78,
      df: 76,
      ph: 78,
      bd: [`UCL`],
    },
    "luis-diaz": {
      ov: 85,
      pa: 90,
      sh: 80,
      ps: 76,
      dr: 88,
      df: 52,
      ph: 72,
      bd: [`UCL`],
    },
    leao: { ov: 85, pa: 90, sh: 80, ps: 75, dr: 88, df: 48, ph: 76, bd: [] },
    "theo-hernandez": {
      ov: 84,
      pa: 88,
      sh: 73,
      ps: 72,
      dr: 82,
      df: 72,
      ph: 82,
      bd: [`WC`],
    },
    "nuno-mendes": {
      ov: 84,
      pa: 88,
      sh: 68,
      ps: 74,
      dr: 82,
      df: 76,
      ph: 76,
      bd: [],
    },
    cancelo: {
      ov: 84,
      pa: 84,
      sh: 70,
      ps: 84,
      dr: 84,
      df: 74,
      ph: 72,
      bd: [`UCL`, `EURO`],
    },
    guler: {
      ov: 84,
      pa: 75,
      sh: 80,
      ps: 84,
      dr: 88,
      df: 50,
      ph: 66,
      bd: [`UCL`],
    },
    calhanoglu: {
      ov: 85,
      pa: 70,
      sh: 82,
      ps: 88,
      dr: 80,
      df: 68,
      ph: 74,
      bd: [`UCL`],
    },
    "cole-palmer": {
      ov: 84,
      pa: 76,
      sh: 84,
      ps: 84,
      dr: 86,
      df: 56,
      ph: 68,
      bd: [],
    },
    rashford: {
      ov: 84,
      pa: 92,
      sh: 82,
      ps: 74,
      dr: 86,
      df: 42,
      ph: 76,
      bd: [],
    },
    vitinha: { ov: 83, pa: 76, sh: 72, ps: 88, dr: 84, df: 68, ph: 70, bd: [] },
    caicedo: { ov: 83, pa: 78, sh: 68, ps: 82, dr: 76, df: 82, ph: 84, bd: [] },
    darwin: {
      ov: 83,
      pa: 90,
      sh: 83,
      ps: 70,
      dr: 82,
      df: 44,
      ph: 84,
      bd: [`UCL`],
    },
    taremi: {
      ov: 83,
      pa: 70,
      sh: 88,
      ps: 74,
      dr: 78,
      df: 42,
      ph: 80,
      bd: [`WCG`],
    },
    "de-paul": {
      ov: 82,
      pa: 78,
      sh: 72,
      ps: 80,
      dr: 78,
      df: 72,
      ph: 82,
      bd: [`WC`],
    },
    james: {
      ov: 83,
      pa: 72,
      sh: 80,
      ps: 88,
      dr: 84,
      df: 52,
      ph: 68,
      bd: [`WCG`, `GB`],
    },
    mane: {
      ov: 85,
      pa: 88,
      sh: 84,
      ps: 78,
      dr: 86,
      df: 50,
      ph: 74,
      bd: [`UCL`, `AFCON`, `GB`],
    },
    ake: {
      ov: 83,
      pa: 76,
      sh: 58,
      ps: 78,
      dr: 70,
      df: 84,
      ph: 80,
      bd: [`UCL`],
    },
    grimaldo: {
      ov: 83,
      pa: 82,
      sh: 72,
      ps: 82,
      dr: 76,
      df: 76,
      ph: 74,
      bd: [`UCL`],
    },
    doku: {
      ov: 83,
      pa: 94,
      sh: 74,
      ps: 72,
      dr: 90,
      df: 40,
      ph: 68,
      bd: [`UCL`],
    },
    "bruno-fernandes": {
      ov: 85,
      pa: 74,
      sh: 82,
      ps: 89,
      dr: 84,
      df: 60,
      ph: 76,
      bd: [],
    },
    ugarte: { ov: 82, pa: 76, sh: 62, ps: 80, dr: 74, df: 82, ph: 82, bd: [] },
    "de-arrascaeta": {
      ov: 83,
      pa: 74,
      sh: 80,
      ps: 86,
      dr: 86,
      df: 48,
      ph: 68,
      bd: [],
    },
    "goncalo-ramos": {
      ov: 83,
      pa: 72,
      sh: 86,
      ps: 74,
      dr: 80,
      df: 40,
      ph: 78,
      bd: [`WCG`],
    },
    adingra: {
      ov: 81,
      pa: 88,
      sh: 76,
      ps: 72,
      dr: 84,
      df: 46,
      ph: 70,
      bd: [`AFCON`],
    },
    martinelli: {
      ov: 83,
      pa: 91,
      sh: 80,
      ps: 74,
      dr: 86,
      df: 54,
      ph: 74,
      bd: [],
    },
    casemiro: {
      ov: 83,
      pa: 68,
      sh: 70,
      ps: 78,
      dr: 70,
      df: 86,
      ph: 84,
      bd: [`UCL`, `WC`],
    },
    molina: {
      ov: 82,
      pa: 88,
      sh: 70,
      ps: 74,
      dr: 80,
      df: 74,
      ph: 76,
      bd: [`WC`],
    },
    oyarzabal: {
      ov: 82,
      pa: 78,
      sh: 84,
      ps: 80,
      dr: 82,
      df: 52,
      ph: 72,
      bd: [`EURO`, `WCG`],
    },
    olmo: {
      ov: 84,
      pa: 78,
      sh: 80,
      ps: 84,
      dr: 86,
      df: 60,
      ph: 72,
      bd: [`EURO`],
    },
    merino: {
      ov: 83,
      pa: 72,
      sh: 74,
      ps: 82,
      dr: 76,
      df: 76,
      ph: 82,
      bd: [`EURO`, `WCG`],
    },
    zubimendi: {
      ov: 83,
      pa: 68,
      sh: 65,
      ps: 84,
      dr: 72,
      df: 82,
      ph: 78,
      bd: [`EURO`],
    },
    laporte: {
      ov: 84,
      pa: 68,
      sh: 56,
      ps: 82,
      dr: 68,
      df: 88,
      ph: 82,
      bd: [`UCL`, `EURO`],
    },
  },
  S = {
    Goalkeeper: [55, 20, 65, 35, 82, 70],
    "Centre-Back": [62, 40, 68, 55, 82, 82],
    "Left Back": [76, 55, 72, 70, 74, 70],
    "Right Back": [76, 55, 72, 70, 74, 70],
    Defender: [65, 42, 66, 58, 80, 80],
    "Midfielder/Def": [72, 60, 80, 72, 78, 78],
    Midfielder: [68, 65, 80, 72, 65, 74],
    "Attacking Mid": [68, 74, 82, 80, 40, 60],
    Winger: [82, 72, 73, 83, 35, 62],
    Forward: [75, 80, 70, 78, 30, 68],
    "Forward/Mid": [72, 76, 76, 80, 42, 68],
  },
  C = (e) => {
    if (ee[e.id]) return ee[e.id];
    let t = v.find((t) => t.id === e.team),
      n = t
        ? t.rank <= 5
          ? 6
          : t.rank <= 10
            ? 4
            : t.rank <= 20
              ? 2
              : t.rank <= 35
                ? 0
                : -2
        : -2,
      r = (S[e.pos] || S.Midfielder).slice(),
      i = Math.abs(
        [...e.id].reduce((e, t) => (Math.imul(e, 31) + t.charCodeAt(0)) | 0, 0),
      ),
      a = r.map((e, t) =>
        Math.min(99, Math.max(40, e + n + ((i >> (t * 4)) & 7) - 3)),
      ),
      o,
      s = e.pos || ``;
    return (
      (o =
        s === `Goalkeeper`
          ? Math.round(
              0.5 * a[4] +
                0.15 * a[5] +
                0.15 * a[2] +
                0.1 * a[0] +
                0.05 * a[1] +
                0.05 * a[3],
            )
          : s === `Centre-Back` || s === `Defender`
            ? Math.round(
                0.4 * a[4] +
                  0.25 * a[5] +
                  0.15 * a[2] +
                  0.12 * a[0] +
                  0.05 * a[3] +
                  0.03 * a[1],
              )
            : s.includes(`Back`)
              ? Math.round(
                  0.25 * a[4] +
                    0.2 * a[5] +
                    0.2 * a[0] +
                    0.18 * a[2] +
                    0.12 * a[3] +
                    0.05 * a[1],
                )
              : Math.round(
                  s === `Midfielder` || s === `Midfielder/Def`
                    ? 0.3 * a[2] +
                        0.2 * a[3] +
                        0.18 * a[4] +
                        0.15 * a[5] +
                        0.12 * a[1] +
                        0.05 * a[0]
                    : s === `Attacking Mid`
                      ? 0.28 * a[2] +
                        0.24 * a[3] +
                        0.2 * a[1] +
                        0.12 * a[0] +
                        0.1 * a[5] +
                        0.06 * a[4]
                      : s === `Winger`
                        ? 0.3 * a[3] +
                          0.25 * a[0] +
                          0.2 * a[1] +
                          0.15 * a[2] +
                          0.06 * a[5] +
                          0.04 * a[4]
                        : 0.35 * a[1] +
                          0.25 * a[3] +
                          0.2 * a[0] +
                          0.1 * a[2] +
                          0.05 * a[5] +
                          0.05 * a[4],
                )),
      {
        ov: Math.min(99, o + n),
        pa: a[0],
        sh: a[1],
        ps: a[2],
        dr: a[3],
        df: a[4],
        ph: a[5],
        bd: [],
      }
    );
  },
  te = (e) =>
    e >= 90
      ? `#f4b942`
      : e >= 85
        ? `#4ade80`
        : e >= 80
          ? `#60a5fa`
          : e >= 75
            ? `#c084fc`
            : `#6b7a99`,
  ne = groups,
  re = matches,
  w = (e) => v.find((t) => t.id === e),
  ie = (e) => y.filter((t) => t.team === e),
  ae = (e) => ne.find((t) => t.teams.includes(e)),
  oe = {
    card: {
      background: `#0d1525`,
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 12,
      padding: `14px 16px`,
    },
    h1: {
      fontFamily: `Bebas Neue, sans-serif`,
      letterSpacing: `0.03em`,
      color: `#fff`,
      lineHeight: 1,
    },
    label: {
      fontFamily: `Barlow, sans-serif`,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: `0.1em`,
      color: `#6b7a99`,
      textTransform: `uppercase`,
    },
    body: {
      fontFamily: `Barlow, sans-serif`,
      fontSize: 14,
      color: `#a0aec0`,
      lineHeight: 1.6,
    },
  },
  se = ({ children: e, style: t, onClick: n }) =>
    (0, f.jsx)(`div`, {
      onClick: n,
      style: {
        ...oe.card,
        cursor: n ? `pointer` : `default`,
        transition: `border-color .15s`,
        ...t,
      },
      onMouseEnter: (e) => n && (e.currentTarget.style.borderColor = `#f4b942`),
      onMouseLeave: (e) =>
        n && (e.currentTarget.style.borderColor = `rgba(255,255,255,0.07)`),
      children: e,
    }),
  ce = ({ label: e, color: t, bg: n }) =>
    (0, f.jsx)(`span`, {
      style: {
        display: `inline-block`,
        padding: `2px 8px`,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: `Barlow, sans-serif`,
        letterSpacing: `0.08em`,
        color: t || `#000`,
        background: n || `#f4b942`,
        textTransform: `uppercase`,
      },
      children: e,
    }),
  le = ({ children: e, style: t }) =>
    (0, f.jsx)(`h1`, { style: { ...oe.h1, fontSize: 36, ...t }, children: e }),
  ue = ({ children: e, style: t }) =>
    (0, f.jsx)(`h2`, {
      style: {
        fontFamily: `Bebas Neue, sans-serif`,
        fontSize: 20,
        letterSpacing: `0.04em`,
        color: `#f4b942`,
        ...t,
      },
      children: e,
    }),
  T = ({ children: e, style: t }) =>
    (0, f.jsx)(`p`, { style: { ...oe.label, ...t }, children: e }),
  E = ({ children: e, style: t }) =>
    (0, f.jsx)(`p`, { style: { ...oe.body, ...t }, children: e }),
  de = () =>
    (0, f.jsx)(`div`, {
      style: {
        height: 1,
        background: `rgba(255,255,255,0.07)`,
        margin: `12px 0`,
      },
    }),
  fe = ({ onClick: e }) =>
    (0, f.jsx)(`button`, {
      onClick: e,
      style: {
        display: `flex`,
        alignItems: `center`,
        gap: 6,
        background: `rgba(255,255,255,0.06)`,
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 8,
        padding: `7px 14px`,
        color: `#a0aec0`,
        fontSize: 13,
        fontFamily: `Barlow, sans-serif`,
        fontWeight: 600,
        cursor: `pointer`,
      },
      children: `← Back`,
    }),
  pe = ({ teamId: e, favTeam: t, onToggle: n }) => {
    let r = t === e;
    return (0, f.jsx)(`button`, {
      onClick: () => n(e),
      style: {
        background: r ? `rgba(244,185,66,0.15)` : `rgba(255,255,255,0.06)`,
        border: `1px solid ${r ? `rgba(244,185,66,0.5)` : `rgba(255,255,255,0.1)`}`,
        borderRadius: 8,
        padding: `7px 14px`,
        color: r ? `#f4b942` : `#6b7a99`,
        fontSize: 13,
        fontFamily: `Barlow, sans-serif`,
        fontWeight: 600,
        cursor: `pointer`,
        transition: `all .2s`,
      },
      title: r ? `Remove favourite` : `Set as favourite team`,
      children: r ? `★ My Team` : `☆ Favourite`,
    });
  };

function me({ fixture: e, navigate: t, compact: n }) {
  let r = w(e.home),
    i = w(e.away),
    a = new Date().toISOString().split(`T`)[0],
    o = e.date === a;
  return (0, f.jsxs)(`div`, {
    style: {
      background: `#0d1525`,
      border: `1px solid ${o ? `rgba(244,185,66,0.35)` : `rgba(255,255,255,0.07)`}`,
      borderRadius: 10,
      padding: n ? `8px 12px` : `12px 16px`,
    },
    children: [
      (0, f.jsx)(`div`, {
        style: {
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
          marginBottom: 6,
        },
        children: (0, f.jsxs)(T, {
          style: { color: o ? `#f4b942` : `#4a5568` },
          children: [
            o
              ? `🔴 TODAY`
              : new Date(e.date + `T12:00:00`).toLocaleDateString(`en-GB`, {
                  day: `numeric`,
                  month: `short`,
                }),
            ` · `,
            e.time,
            ` BST · Group `,
            e.group,
            e.venue ? ` · ${e.venue}` : ``,
          ],
        }),
      }),
      (0, f.jsxs)(`div`, {
        style: {
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
          gap: 8,
        },
        children: [
          (0, f.jsxs)(`button`, {
            onClick: () => r && t(`team`, r.id),
            style: {
              flex: 1,
              background: `none`,
              border: `none`,
              cursor: r ? `pointer` : `default`,
              padding: 0,
              textAlign: `left`,
              display: `flex`,
              alignItems: `center`,
              gap: 8,
            },
            children: [
              (0, f.jsx)(`span`, {
                style: { fontSize: 22 },
                children: r?.flag || `🌍`,
              }),
              (0, f.jsx)(`span`, {
                style: {
                  fontFamily: `Barlow, sans-serif`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: `#e2e8f0`,
                },
                children: r?.name || e.home,
              }),
            ],
          }),
          (0, f.jsx)(`span`, {
            style: {
              fontFamily: `Bebas Neue, sans-serif`,
              fontSize: 16,
              color: `#f4b942`,
              letterSpacing: `0.1em`,
              flexShrink: 0,
            },
            children: `VS`,
          }),
          (0, f.jsxs)(`button`, {
            onClick: () => i && t(`team`, i.id),
            style: {
              flex: 1,
              background: `none`,
              border: `none`,
              cursor: i ? `pointer` : `default`,
              padding: 0,
              textAlign: `right`,
              display: `flex`,
              alignItems: `center`,
              gap: 8,
              justifyContent: `flex-end`,
            },
            children: [
              (0, f.jsx)(`span`, {
                style: {
                  fontFamily: `Barlow, sans-serif`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: `#e2e8f0`,
                },
                children: i?.name || e.away,
              }),
              (0, f.jsx)(`span`, {
                style: { fontSize: 22 },
                children: i?.flag || `🌍`,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function D({ navigate: e, favTeam: t, onToggleFav: n }) {
  let r = new Date(),
    i = r.toISOString().split(`T`)[0],
    a = new Date(`2026-06-11`),
    o = Math.ceil((a - r) / (1e3 * 60 * 60 * 24)),
    s = r >= a,
    c = t ? w(t) : null,
    l = t ? ae(t) : null,
    u = t ? re.filter((e) => e.home === t || e.away === t).slice(0, 3) : [],
    d = re.filter((e) => e.date === i),
    p = re.find((e) => e.date >= i)?.date,
    m = re.filter((e) => e.date === p || e.date === i).slice(0, 8);
  return (0, f.jsxs)(`div`, {
    style: {
      padding: `20px 16px`,
      display: `flex`,
      flexDirection: `column`,
      gap: 16,
    },
    children: [
      (0, f.jsxs)(`div`, {
        style: {
          background: `linear-gradient(135deg,rgba(244,185,66,0.12) 0%,rgba(13,21,37,0) 100%)`,
          border: `1px solid rgba(244,185,66,0.2)`,
          borderRadius: 16,
          padding: `20px`,
        },
        children: [
          (0, f.jsx)(T, { children: `FIFA WORLD CUP` }),
          (0, f.jsx)(le, {
            style: { fontSize: 44, marginTop: 4 },
            children: `2026`,
          }),
          (0, f.jsx)(`p`, {
            style: {
              fontFamily: `Barlow, sans-serif`,
              fontSize: 13,
              color: `#6b7a99`,
              marginTop: 4,
            },
            children: `USA · Mexico · Canada · June 11 – July 19`,
          }),
          !s &&
            (0, f.jsxs)(`div`, {
              style: {
                marginTop: 12,
                display: `inline-flex`,
                alignItems: `baseline`,
                gap: 8,
                background: `rgba(244,185,66,0.1)`,
                border: `1px solid rgba(244,185,66,0.2)`,
                borderRadius: 8,
                padding: `8px 14px`,
              },
              children: [
                (0, f.jsx)(`span`, {
                  style: {
                    fontFamily: `Bebas Neue, sans-serif`,
                    fontSize: 36,
                    color: `#f4b942`,
                    lineHeight: 1,
                  },
                  children: o,
                }),
                (0, f.jsx)(`span`, {
                  style: {
                    fontFamily: `Barlow, sans-serif`,
                    fontSize: 12,
                    color: `#f4b942`,
                    fontWeight: 700,
                    letterSpacing: `0.08em`,
                    textTransform: `uppercase`,
                  },
                  children: `days to go`,
                }),
              ],
            }),
        ],
      }),
      c
        ? (0, f.jsxs)(`div`, {
            children: [
              (0, f.jsx)(T, {
                style: { marginBottom: 8 },
                children: `My Team ★`,
              }),
              (0, f.jsxs)(se, {
                children: [
                  (0, f.jsxs)(`div`, {
                    style: {
                      display: `flex`,
                      alignItems: `center`,
                      justifyContent: `space-between`,
                    },
                    children: [
                      (0, f.jsxs)(`div`, {
                        style: {
                          display: `flex`,
                          alignItems: `center`,
                          gap: 12,
                          cursor: `pointer`,
                        },
                        onClick: () => e(`team`, c.id),
                        children: [
                          (0, f.jsx)(`span`, {
                            style: { fontSize: 36 },
                            children: c.flag,
                          }),
                          (0, f.jsxs)(`div`, {
                            children: [
                              (0, f.jsx)(`p`, {
                                style: {
                                  fontFamily: `Bebas Neue, sans-serif`,
                                  fontSize: 24,
                                  color: `#fff`,
                                  letterSpacing: `0.03em`,
                                  lineHeight: 1,
                                },
                                children: c.name,
                              }),
                              (0, f.jsxs)(`p`, {
                                style: {
                                  fontFamily: `Barlow, sans-serif`,
                                  fontSize: 12,
                                  color: h(c.confederation),
                                  fontWeight: 700,
                                  marginTop: 2,
                                },
                                children: [
                                  c.confederation,
                                  c.group ? ` · Group ${c.group}` : ``,
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, f.jsx)(`button`, {
                        onClick: () => n(t),
                        style: {
                          background: `rgba(244,185,66,0.1)`,
                          border: `1px solid rgba(244,185,66,0.3)`,
                          borderRadius: 8,
                          padding: `6px 10px`,
                          color: `#f4b942`,
                          fontSize: 16,
                          cursor: `pointer`,
                        },
                        children: `★`,
                      }),
                    ],
                  }),
                  l &&
                    (0, f.jsxs)(`div`, {
                      style: {
                        marginTop: 10,
                        display: `flex`,
                        gap: 6,
                        flexWrap: `wrap`,
                      },
                      children: [
                        (0, f.jsxs)(`button`, {
                          onClick: () => e(`group`, l.id),
                          style: {
                            background: `rgba(255,255,255,0.06)`,
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderRadius: 6,
                            padding: `5px 10px`,
                            color: `#e2e8f0`,
                            fontSize: 12,
                            fontFamily: `Barlow, sans-serif`,
                            fontWeight: 600,
                            cursor: `pointer`,
                          },
                          children: [`📋 Group `, l.id],
                        }),
                        (0, f.jsx)(`button`, {
                          onClick: () => e(`team`, c.id),
                          style: {
                            background: `rgba(255,255,255,0.06)`,
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderRadius: 6,
                            padding: `5px 10px`,
                            color: `#e2e8f0`,
                            fontSize: 12,
                            fontFamily: `Barlow, sans-serif`,
                            fontWeight: 600,
                            cursor: `pointer`,
                          },
                          children: `👥 Squad`,
                        }),
                      ],
                    }),
                  u.length > 0 &&
                    (0, f.jsxs)(f.Fragment, {
                      children: [
                        (0, f.jsx)(de, {}),
                        (0, f.jsx)(T, {
                          style: { marginBottom: 8 },
                          children: `Upcoming Fixtures`,
                        }),
                        (0, f.jsx)(`div`, {
                          style: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 6,
                          },
                          children: u.map((t) =>
                            (0, f.jsx)(
                              me,
                              { fixture: t, navigate: e, compact: !0 },
                              t.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                ],
              }),
            ],
          })
        : (0, f.jsx)(se, {
            style: {
              background: `rgba(244,185,66,0.05)`,
              borderColor: `rgba(244,185,66,0.15)`,
            },
            children: (0, f.jsxs)(`p`, {
              style: {
                fontFamily: `Barlow, sans-serif`,
                fontSize: 14,
                color: `#a0aec0`,
              },
              children: [
                `⭐ No favourite team set — browse `,
                (0, f.jsx)(`strong`, {
                  style: { color: `#f4b942` },
                  children: `Teams`,
                }),
                ` and tap `,
                (0, f.jsx)(`strong`, {
                  style: { color: `#f4b942` },
                  children: `☆ Favourite`,
                }),
                ` on any team to pin them here.`,
              ],
            }),
          }),
      d.length > 0 &&
        (0, f.jsxs)(f.Fragment, {
          children: [
            (0, f.jsx)(T, { children: `🔴 Today` }),
            (0, f.jsx)(`div`, {
              style: { display: `flex`, flexDirection: `column`, gap: 8 },
              children: d.map((t) =>
                (0, f.jsx)(me, { fixture: t, navigate: e }, t.id),
              ),
            }),
          ],
        }),
      m.length > 0 &&
        (0, f.jsxs)(f.Fragment, {
          children: [
            (0, f.jsx)(T, {
              children: s ? `Coming Up` : `First Fixtures — June 2026`,
            }),
            (0, f.jsx)(`div`, {
              style: { display: `flex`, flexDirection: `column`, gap: 8 },
              children: m.map((t) =>
                (0, f.jsx)(me, { fixture: t, navigate: e }, t.id),
              ),
            }),
          ],
        }),
    ],
  });
}
function O({ label: e, value: t, color: n }) {
  return (0, f.jsxs)(`div`, {
    style: { display: `flex`, alignItems: `center`, gap: 8, marginBottom: 5 },
    children: [
      (0, f.jsx)(`span`, {
        style: {
          fontFamily: `Barlow, sans-serif`,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: `0.08em`,
          color: `#6b7a99`,
          width: 24,
          flexShrink: 0,
          textTransform: `uppercase`,
        },
        children: e,
      }),
      (0, f.jsx)(`div`, {
        style: {
          flex: 1,
          height: 5,
          background: `rgba(255,255,255,0.08)`,
          borderRadius: 3,
          overflow: `hidden`,
        },
        children: (0, f.jsx)(`div`, {
          style: {
            width: `${t}%`,
            height: `100%`,
            background: n,
            borderRadius: 3,
            transition: `width 0.5s ease`,
          },
        }),
      }),
      (0, f.jsx)(`span`, {
        style: {
          fontFamily: `Bebas Neue, sans-serif`,
          fontSize: 14,
          color: `#e2e8f0`,
          width: 22,
          textAlign: `right`,
          flexShrink: 0,
        },
        children: t,
      }),
    ],
  });
}
function he({ player: e, onClick: t }) {
  let n = w(e.team),
    r = C(e),
    i = te(r.ov),
    a = g(e.pos);
  return (0, f.jsxs)(`div`, {
    onClick: t,
    style: {
      background: `#0d1525`,
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 12,
      padding: `12px 14px`,
      cursor: `pointer`,
      transition: `border-color .15s`,
    },
    onMouseEnter: (e) => (e.currentTarget.style.borderColor = `#f4b942`),
    onMouseLeave: (e) =>
      (e.currentTarget.style.borderColor = `rgba(255,255,255,0.07)`),
    children: [
      (0, f.jsxs)(`div`, {
        style: {
          display: `flex`,
          alignItems: `flex-start`,
          gap: 12,
          marginBottom: 10,
        },
        children: [
          (0, f.jsxs)(`div`, {
            style: {
              flexShrink: 0,
              width: 44,
              height: 52,
              borderRadius: 8,
              background: `${i}18`,
              border: `1px solid ${i}44`,
              display: `flex`,
              flexDirection: `column`,
              alignItems: `center`,
              justifyContent: `center`,
            },
            children: [
              (0, f.jsx)(`span`, {
                style: {
                  fontFamily: `Bebas Neue, sans-serif`,
                  fontSize: 24,
                  color: i,
                  lineHeight: 1,
                },
                children: r.ov,
              }),
              (0, f.jsx)(`span`, {
                style: {
                  fontFamily: `Barlow, sans-serif`,
                  fontSize: 8,
                  fontWeight: 700,
                  color: i,
                  letterSpacing: `0.06em`,
                  textTransform: `uppercase`,
                  opacity: 0.8,
                },
                children: `OVR`,
              }),
            ],
          }),
          (0, f.jsxs)(`div`, {
            style: { flex: 1, minWidth: 0 },
            children: [
              (0, f.jsx)(`p`, {
                style: {
                  fontFamily: `Bebas Neue, sans-serif`,
                  fontSize: 19,
                  color: `#fff`,
                  letterSpacing: `0.03em`,
                  lineHeight: 1.1,
                  overflow: `hidden`,
                  textOverflow: `ellipsis`,
                  whiteSpace: `nowrap`,
                },
                children: e.name,
              }),
              (0, f.jsx)(`p`, {
                style: {
                  fontFamily: `Barlow, sans-serif`,
                  fontSize: 11,
                  color: `#6b7a99`,
                  marginTop: 2,
                  overflow: `hidden`,
                  textOverflow: `ellipsis`,
                  whiteSpace: `nowrap`,
                },
                children: e.club,
              }),
              (0, f.jsxs)(`div`, {
                style: {
                  display: `flex`,
                  gap: 5,
                  marginTop: 5,
                  flexWrap: `wrap`,
                },
                children: [
                  (0, f.jsx)(`span`, {
                    style: {
                      display: `inline-block`,
                      padding: `1px 7px`,
                      borderRadius: 10,
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: `Barlow, sans-serif`,
                      letterSpacing: `0.07em`,
                      color: a,
                      background: `${a}20`,
                      textTransform: `uppercase`,
                    },
                    children: e.pos,
                  }),
                  (0, f.jsxs)(`span`, {
                    style: {
                      display: `inline-block`,
                      padding: `1px 7px`,
                      borderRadius: 10,
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: `Barlow, sans-serif`,
                      letterSpacing: `0.07em`,
                      color: `#6b7a99`,
                      background: `rgba(255,255,255,0.06)`,
                      textTransform: `uppercase`,
                    },
                    children: [`AGE `, e.age],
                  }),
                ],
              }),
            ],
          }),
          (0, f.jsx)(`span`, {
            style: { fontSize: 26, flexShrink: 0 },
            children: n?.flag || `🌍`,
          }),
        ],
      }),
      (0, f.jsx)(`div`, {
        style: {
          display: `grid`,
          gridTemplateColumns: `1fr 1fr 1fr`,
          gap: `3px 12px`,
          background: `rgba(255,255,255,0.03)`,
          borderRadius: 8,
          padding: `8px 10px`,
          marginBottom: r.bd.length ? 8 : 0,
        },
        children: [
          [`PAC`, r.pa],
          [`SHO`, r.sh],
          [`PAS`, r.ps],
          [`DRI`, r.dr],
          [`DEF`, r.df],
          [`PHY`, r.ph],
        ].map(([e, t]) =>
          (0, f.jsxs)(
            `div`,
            {
              style: { display: `flex`, alignItems: `center`, gap: 5 },
              children: [
                (0, f.jsx)(`span`, {
                  style: {
                    fontFamily: `Barlow, sans-serif`,
                    fontSize: 9,
                    fontWeight: 700,
                    color: `#4a5568`,
                    letterSpacing: `0.06em`,
                    width: 22,
                    textTransform: `uppercase`,
                  },
                  children: e,
                }),
                (0, f.jsx)(`span`, {
                  style: {
                    fontFamily: `Bebas Neue, sans-serif`,
                    fontSize: 15,
                    color:
                      t >= 85 ? `#f4b942` : t >= 75 ? `#4ade80` : `#a0aec0`,
                    letterSpacing: `0.03em`,
                  },
                  children: t,
                }),
              ],
            },
            e,
          ),
        ),
      }),
      r.bd.length > 0 &&
        (0, f.jsx)(`div`, {
          style: { display: `flex`, gap: 5, flexWrap: `wrap` },
          children: r.bd.map((e) => {
            let t = b[e];
            return t
              ? (0, f.jsx)(
                  `span`,
                  {
                    style: {
                      display: `inline-block`,
                      padding: `2px 7px`,
                      borderRadius: 10,
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: `Barlow, sans-serif`,
                      letterSpacing: `0.06em`,
                      color: t.color,
                      background: t.bg,
                      textTransform: `uppercase`,
                    },
                    children: t.label,
                  },
                  e,
                )
              : null;
          }),
        }),
    ],
  });
}
function ge({ navigate: e }) {
  let t = x.map((e) => y.find((t) => t.id === e)).filter(Boolean);
  return (0, f.jsxs)(`div`, {
    children: [
      (0, f.jsx)(T, {
        style: { marginBottom: 10 },
        children: `⭐ Featured Stars`,
      }),
      (0, f.jsx)(`div`, {
        style: {
          display: `flex`,
          gap: 10,
          overflowX: `auto`,
          paddingBottom: 8,
          WebkitOverflowScrolling: `touch`,
          scrollbarWidth: `none`,
          msOverflowStyle: `none`,
        },
        children: t.map((t) => {
          let n = C(t),
            r = te(n.ov),
            i = w(t.team);
          return (0, f.jsxs)(
            `div`,
            {
              onClick: () => e(`player`, t.id),
              style: {
                flexShrink: 0,
                width: 130,
                background: `linear-gradient(170deg,${r}22 0%,#0d1525 60%)`,
                border: `1px solid ${r}40`,
                borderRadius: 12,
                padding: `14px 12px`,
                cursor: `pointer`,
                display: `flex`,
                flexDirection: `column`,
                alignItems: `center`,
                gap: 6,
                textAlign: `center`,
                transition: `transform .15s,border-color .15s`,
              },
              onMouseEnter: (e) => {
                ((e.currentTarget.style.transform = `translateY(-2px)`),
                  (e.currentTarget.style.borderColor = r));
              },
              onMouseLeave: (e) => {
                ((e.currentTarget.style.transform = `none`),
                  (e.currentTarget.style.borderColor = `${r}40`));
              },
              children: [
                (0, f.jsx)(`div`, {
                  style: {
                    fontFamily: `Bebas Neue, sans-serif`,
                    fontSize: 32,
                    color: r,
                    lineHeight: 1,
                  },
                  children: n.ov,
                }),
                (0, f.jsx)(`div`, {
                  style: { fontSize: 28 },
                  children: i?.flag || `🌍`,
                }),
                (0, f.jsx)(`div`, {
                  style: {
                    fontFamily: `Bebas Neue, sans-serif`,
                    fontSize: 15,
                    color: `#fff`,
                    letterSpacing: `0.04em`,
                    lineHeight: 1.1,
                  },
                  children: t.name,
                }),
                (0, f.jsx)(`div`, {
                  style: {
                    fontFamily: `Barlow, sans-serif`,
                    fontSize: 10,
                    color: `#6b7a99`,
                    fontWeight: 600,
                  },
                  children: t.pos,
                }),
                (0, f.jsx)(`div`, {
                  style: {
                    fontFamily: `Barlow, sans-serif`,
                    fontSize: 10,
                    color: `#4a5568`,
                  },
                  children: t.club,
                }),
                n.bd.length > 0 &&
                  (0, f.jsx)(`div`, {
                    style: {
                      display: `flex`,
                      gap: 3,
                      flexWrap: `wrap`,
                      justifyContent: `center`,
                    },
                    children: n.bd.slice(0, 2).map((e) => {
                      let t = b[e];
                      return t
                        ? (0, f.jsx)(
                            `span`,
                            {
                              style: { fontSize: 10 },
                              children: t.label.split(` `)[0],
                            },
                            e,
                          )
                        : null;
                    }),
                  }),
              ],
            },
            t.id,
          );
        }),
      }),
    ],
  });
}
function _e({ player: e, navigate: t }) {
  let n = w(e.team),
    r = h(n?.confederation),
    i = C(e),
    a = te(i.ov),
    o = [
      [`PAC`, `Pace`, i.pa],
      [`SHO`, `Shooting`, i.sh],
      [`PAS`, `Passing`, i.ps],
      [`DRI`, `Dribbling`, i.dr],
      [`DEF`, `Defending`, i.df],
      [`PHY`, `Physical`, i.ph],
    ];
  return (0, f.jsxs)(`div`, {
    style: {
      padding: `20px 16px`,
      display: `flex`,
      flexDirection: `column`,
      gap: 16,
    },
    children: [
      (0, f.jsxs)(`div`, {
        style: {
          background: `linear-gradient(135deg,${a}18 0%,${r}12 50%,#06090f 100%)`,
          border: `1px solid ${a}40`,
          borderRadius: 16,
          padding: 20,
        },
        children: [
          (0, f.jsxs)(`div`, {
            style: {
              display: `flex`,
              justifyContent: `space-between`,
              alignItems: `flex-start`,
              marginBottom: 14,
            },
            children: [
              (0, f.jsxs)(`div`, {
                children: [
                  (0, f.jsxs)(`div`, {
                    style: {
                      display: `flex`,
                      alignItems: `baseline`,
                      gap: 12,
                      marginBottom: 6,
                    },
                    children: [
                      (0, f.jsx)(`span`, {
                        style: {
                          fontFamily: `Bebas Neue, sans-serif`,
                          fontSize: 52,
                          color: a,
                          lineHeight: 1,
                        },
                        children: i.ov,
                      }),
                      (0, f.jsxs)(`div`, {
                        children: [
                          (0, f.jsx)(`p`, {
                            style: {
                              fontFamily: `Barlow, sans-serif`,
                              fontSize: 10,
                              fontWeight: 700,
                              color: a,
                              letterSpacing: `0.1em`,
                              textTransform: `uppercase`,
                            },
                            children: `Overall`,
                          }),
                          (0, f.jsx)(`p`, {
                            style: {
                              fontFamily: `Barlow, sans-serif`,
                              fontSize: 10,
                              fontWeight: 700,
                              color: `#6b7a99`,
                              letterSpacing: `0.08em`,
                              textTransform: `uppercase`,
                            },
                            children: e.pos,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, f.jsx)(le, {
                    style: { fontSize: 28, lineHeight: 1 },
                    children: e.name,
                  }),
                  (0, f.jsxs)(`p`, {
                    style: {
                      fontFamily: `Barlow, sans-serif`,
                      fontSize: 13,
                      color: `#6b7a99`,
                      marginTop: 4,
                    },
                    children: [e.club, ` · Age `, e.age],
                  }),
                ],
              }),
              (0, f.jsx)(`p`, {
                style: { fontSize: 46 },
                children: n?.flag || `🌍`,
              }),
            ],
          }),
          i.bd.length > 0 &&
            (0, f.jsx)(`div`, {
              style: {
                display: `flex`,
                gap: 6,
                flexWrap: `wrap`,
                marginBottom: 14,
              },
              children: i.bd.map((e) => {
                let t = b[e];
                return t
                  ? (0, f.jsx)(
                      `span`,
                      {
                        style: {
                          display: `inline-block`,
                          padding: `3px 9px`,
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: `Barlow, sans-serif`,
                          letterSpacing: `0.07em`,
                          color: t.color,
                          background: t.bg,
                          textTransform: `uppercase`,
                          border: `1px solid ${t.color}30`,
                        },
                        children: t.label,
                      },
                      e,
                    )
                  : null;
              }),
            }),
          (0, f.jsx)(`div`, {
            style: {
              display: `grid`,
              gridTemplateColumns: `1fr 1fr`,
              gap: `2px 20px`,
            },
            children: o.map(([e, t, n]) =>
              (0, f.jsx)(
                O,
                {
                  label: e,
                  value: n,
                  color:
                    n >= 85
                      ? `#f4b942`
                      : n >= 75
                        ? `#4ade80`
                        : n >= 65
                          ? `#60a5fa`
                          : `#6b7a99`,
                },
                e,
              ),
            ),
          }),
        ],
      }),
      (0, f.jsx)(se, {
        children: (0, f.jsx)(E, {
          style: { color: `#cbd5e0`, lineHeight: 1.7 },
          children: e.desc,
        }),
      }),
      n &&
        (0, f.jsxs)(se, {
          onClick: () => t(`team`, n.id),
          style: { cursor: `pointer` },
          children: [
            (0, f.jsx)(T, { children: `Playing For` }),
            (0, f.jsxs)(`div`, {
              style: {
                display: `flex`,
                justifyContent: `space-between`,
                alignItems: `center`,
                marginTop: 8,
              },
              children: [
                (0, f.jsxs)(`div`, {
                  children: [
                    (0, f.jsxs)(`p`, {
                      style: {
                        fontFamily: `Bebas Neue, sans-serif`,
                        fontSize: 22,
                        color: `#fff`,
                        letterSpacing: `0.04em`,
                      },
                      children: [n.flag, ` `, n.name],
                    }),
                    (0, f.jsxs)(`p`, {
                      style: {
                        fontFamily: `Barlow, sans-serif`,
                        fontSize: 12,
                        color: r,
                        fontWeight: 700,
                        marginTop: 2,
                      },
                      children: [n.confederation, ` · Rank #`, n.rank],
                    }),
                  ],
                }),
                (0, f.jsx)(`span`, {
                  style: { color: `#f4b942`, fontSize: 18 },
                  children: `→`,
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function ve({ team: e, onClick: t }) {
  let n = h(e.confederation);
  return (0, f.jsxs)(se, {
    onClick: t,
    style: { display: `flex`, alignItems: `center`, gap: 12 },
    children: [
      (0, f.jsx)(`p`, {
        style: { fontSize: 30, flexShrink: 0 },
        children: e.flag,
      }),
      (0, f.jsxs)(`div`, {
        style: { flex: 1, minWidth: 0 },
        children: [
          (0, f.jsx)(`p`, {
            style: {
              fontFamily: `Bebas Neue, sans-serif`,
              fontSize: 20,
              color: `#fff`,
              letterSpacing: `0.03em`,
              lineHeight: 1,
            },
            children: e.name,
          }),
          (0, f.jsx)(`p`, {
            style: {
              fontFamily: `Barlow, sans-serif`,
              fontSize: 12,
              color: `#6b7a99`,
              marginTop: 2,
            },
            children: e.coach,
          }),
        ],
      }),
      (0, f.jsxs)(`div`, {
        style: { textAlign: `right`, flexShrink: 0 },
        children: [
          (0, f.jsx)(ce, { label: e.confederation, color: n, bg: `${n}22` }),
          e.group &&
            (0, f.jsxs)(`p`, {
              style: {
                fontFamily: `Barlow, sans-serif`,
                fontSize: 11,
                color: `#4a5568`,
                marginTop: 4,
              },
              children: [`Group `, e.group],
            }),
        ],
      }),
    ],
  });
}
function ye({ team: e, navigate: t, favTeam: n, onToggleFav: r }) {
  let i = h(e.confederation),
    a = ie(e.id),
    o = ae(e.id),
    s = re.filter((t) => t.home === e.id || t.away === e.id);
  return (0, f.jsxs)(`div`, {
    style: {
      padding: `20px 16px`,
      display: `flex`,
      flexDirection: `column`,
      gap: 16,
    },
    children: [
      (0, f.jsxs)(`div`, {
        style: {
          background: `linear-gradient(135deg,${i}20 0%,#0d1525 100%)`,
          border: `1px solid ${i}40`,
          borderRadius: 16,
          padding: 20,
        },
        children: [
          (0, f.jsxs)(`div`, {
            style: {
              display: `flex`,
              justifyContent: `space-between`,
              alignItems: `flex-start`,
              marginBottom: 10,
            },
            children: [
              (0, f.jsxs)(`div`, {
                children: [
                  (0, f.jsxs)(T, {
                    children: [e.confederation, ` · Rank #`, e.rank],
                  }),
                  (0, f.jsx)(le, { style: { marginTop: 4 }, children: e.name }),
                  (0, f.jsxs)(`p`, {
                    style: {
                      fontFamily: `Barlow, sans-serif`,
                      fontSize: 13,
                      color: `#6b7a99`,
                      marginTop: 4,
                    },
                    children: [`"`, e.nickname, `" · `, e.coach],
                  }),
                ],
              }),
              (0, f.jsx)(`p`, { style: { fontSize: 46 }, children: e.flag }),
            ],
          }),
          (0, f.jsx)(`div`, {
            style: { display: `flex`, gap: 8, marginBottom: 12 },
            children: (0, f.jsx)(pe, { teamId: e.id, favTeam: n, onToggle: r }),
          }),
          (0, f.jsx)(`div`, {
            style: {
              background: `${i}15`,
              borderLeft: `3px solid ${i}`,
              padding: `10px 14px`,
              borderRadius: `0 8px 8px 0`,
              marginBottom: 12,
            },
            children: (0, f.jsxs)(E, {
              style: { color: `#e2e8f0`, fontStyle: `italic` },
              children: [`"`, e.verdict, `"`],
            }),
          }),
          (0, f.jsxs)(`div`, {
            style: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 10 },
            children: [
              (0, f.jsxs)(`div`, {
                style: {
                  background: `rgba(34,197,94,0.08)`,
                  border: `1px solid rgba(34,197,94,0.15)`,
                  borderRadius: 8,
                  padding: 10,
                },
                children: [
                  (0, f.jsx)(T, {
                    style: { color: `#22c55e` },
                    children: `Strength`,
                  }),
                  (0, f.jsx)(E, {
                    style: { fontSize: 12, marginTop: 4 },
                    children: e.strength,
                  }),
                ],
              }),
              (0, f.jsxs)(`div`, {
                style: {
                  background: `rgba(239,68,68,0.08)`,
                  border: `1px solid rgba(239,68,68,0.15)`,
                  borderRadius: 8,
                  padding: 10,
                },
                children: [
                  (0, f.jsx)(T, {
                    style: { color: `#ef4444` },
                    children: `Weakness`,
                  }),
                  (0, f.jsx)(E, {
                    style: { fontSize: 12, marginTop: 4 },
                    children: e.weakness,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      (0, f.jsxs)(se, {
        children: [
          (0, f.jsx)(ue, { children: `Style of Play` }),
          (0, f.jsx)(E, { style: { marginTop: 6 }, children: e.style }),
          (0, f.jsx)(de, {}),
          (0, f.jsx)(ue, { children: `History` }),
          (0, f.jsx)(E, { style: { marginTop: 6 }, children: e.history }),
        ],
      }),
      o &&
        (0, f.jsxs)(`div`, {
          children: [
            (0, f.jsxs)(T, {
              style: { marginBottom: 8 },
              children: [`Group `, o.id],
            }),
            (0, f.jsx)(`div`, {
              style: { display: `flex`, flexDirection: `column`, gap: 6 },
              children: o.teams.map((n) => {
                let r = w(n);
                if (!r) return null;
                let a = r.id === e.id;
                return (0, f.jsxs)(
                  se,
                  {
                    onClick: () => !a && t(`team`, n),
                    style: {
                      display: `flex`,
                      alignItems: `center`,
                      gap: 10,
                      cursor: a ? `default` : `pointer`,
                      background: a ? `${i}15` : `#0d1525`,
                      borderColor: a ? i : `rgba(255,255,255,0.07)`,
                    },
                    children: [
                      (0, f.jsx)(`p`, {
                        style: { fontSize: 22 },
                        children: r.flag,
                      }),
                      (0, f.jsxs)(`div`, {
                        style: { flex: 1 },
                        children: [
                          (0, f.jsx)(`p`, {
                            style: {
                              fontFamily: `Barlow, sans-serif`,
                              fontSize: 14,
                              fontWeight: a ? 700 : 500,
                              color: a ? `#fff` : `#a0aec0`,
                            },
                            children: r.name,
                          }),
                          (0, f.jsxs)(`p`, {
                            style: {
                              fontFamily: `Barlow, sans-serif`,
                              fontSize: 11,
                              color: `#4a5568`,
                            },
                            children: [`Rank #`, r.rank],
                          }),
                        ],
                      }),
                      a &&
                        (0, f.jsx)(ce, {
                          label: `THIS TEAM`,
                          color: i,
                          bg: `${i}25`,
                        }),
                    ],
                  },
                  n,
                );
              }),
            }),
          ],
        }),
      s.length > 0 &&
        (0, f.jsxs)(`div`, {
          children: [
            (0, f.jsx)(T, {
              style: { marginBottom: 8 },
              children: `Group Stage Fixtures`,
            }),
            (0, f.jsx)(`div`, {
              style: { display: `flex`, flexDirection: `column`, gap: 6 },
              children: s
                .slice(0, 3)
                .map((e) =>
                  (0, f.jsx)(
                    me,
                    { fixture: e, navigate: t, compact: !0 },
                    e.id,
                  ),
                ),
            }),
          ],
        }),
      a.length > 0 &&
        (0, f.jsxs)(`div`, {
          children: [
            (0, f.jsxs)(T, {
              style: { marginBottom: 8 },
              children: [`Key Players (`, a.length, `)`],
            }),
            (0, f.jsx)(`div`, {
              style: { display: `flex`, flexDirection: `column`, gap: 8 },
              children: a.map((e) =>
                (0, f.jsx)(
                  he,
                  { player: e, onClick: () => t(`player`, e.id) },
                  e.id,
                ),
              ),
            }),
          ],
        }),
    ],
  });
}
function be({ city: e, onClick: t }) {
  return (0, f.jsxs)(se, {
    onClick: t,
    style: { display: `flex`, alignItems: `center`, gap: 12 },
    children: [
      (0, f.jsx)(`div`, {
        style: {
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${e.color}30`,
          border: `1px solid ${e.color}50`,
          display: `flex`,
          alignItems: `center`,
          justifyContent: `center`,
          fontSize: 22,
          flexShrink: 0,
        },
        children: e.emoji,
      }),
      (0, f.jsxs)(`div`, {
        style: { flex: 1, minWidth: 0 },
        children: [
          (0, f.jsx)(`p`, {
            style: {
              fontFamily: `Bebas Neue, sans-serif`,
              fontSize: 18,
              color: `#fff`,
              letterSpacing: `0.03em`,
              lineHeight: 1,
            },
            children: e.name,
          }),
          (0, f.jsxs)(`p`, {
            style: {
              fontFamily: `Barlow, sans-serif`,
              fontSize: 12,
              color: `#6b7a99`,
              marginTop: 2,
            },
            children: [e.flag, ` `, e.country, ` · `, e.stadium],
          }),
        ],
      }),
      e.isFinal &&
        (0, f.jsx)(ce, { label: `FINAL`, color: `#000`, bg: `#f4b942` }),
    ],
  });
}
function xe({ city: e }) {
  return (0, f.jsxs)(`div`, {
    style: {
      padding: `20px 16px`,
      display: `flex`,
      flexDirection: `column`,
      gap: 16,
    },
    children: [
      (0, f.jsxs)(`div`, {
        style: {
          background: `linear-gradient(135deg,${e.color}20 0%,#0d1525 100%)`,
          border: `1px solid ${e.color}40`,
          borderRadius: 16,
          padding: 20,
        },
        children: [
          (0, f.jsxs)(`div`, {
            style: {
              display: `flex`,
              justifyContent: `space-between`,
              alignItems: `flex-start`,
              marginBottom: 10,
            },
            children: [
              (0, f.jsxs)(`div`, {
                children: [
                  (0, f.jsxs)(T, { children: [e.flag, ` `, e.country] }),
                  (0, f.jsx)(le, { style: { marginTop: 4 }, children: e.name }),
                  e.isFinal &&
                    (0, f.jsx)(`div`, {
                      style: { marginTop: 8 },
                      children: (0, f.jsx)(ce, {
                        label: `World Cup Final Venue`,
                        color: `#000`,
                        bg: `#f4b942`,
                      }),
                    }),
                ],
              }),
              (0, f.jsx)(`p`, { style: { fontSize: 42 }, children: e.emoji }),
            ],
          }),
          (0, f.jsx)(E, {
            style: { color: `#cbd5e0`, marginTop: 8 },
            children: e.desc,
          }),
        ],
      }),
      (0, f.jsxs)(se, {
        children: [
          (0, f.jsx)(T, { children: `Stadium` }),
          (0, f.jsx)(`p`, {
            style: {
              fontFamily: `Bebas Neue, sans-serif`,
              fontSize: 24,
              color: `#fff`,
              letterSpacing: `0.03em`,
              marginTop: 6,
            },
            children: e.stadium,
          }),
          (0, f.jsxs)(`p`, {
            style: {
              fontFamily: `Barlow, sans-serif`,
              fontSize: 26,
              fontWeight: 800,
              color: `#f4b942`,
              marginTop: 4,
            },
            children: [
              e.capacity,
              ` `,
              (0, f.jsx)(`span`, {
                style: { fontSize: 14, color: `#6b7a99`, fontWeight: 400 },
                children: `capacity`,
              }),
            ],
          }),
        ],
      }),
      (0, f.jsxs)(se, {
        children: [
          (0, f.jsx)(ue, { children: `Must See` }),
          (0, f.jsx)(`div`, {
            style: {
              marginTop: 10,
              display: `flex`,
              flexDirection: `column`,
              gap: 6,
            },
            children: e.mustSee.map((e, t) =>
              (0, f.jsxs)(
                `div`,
                {
                  style: { display: `flex`, alignItems: `center`, gap: 10 },
                  children: [
                    (0, f.jsx)(`div`, {
                      style: {
                        width: 6,
                        height: 6,
                        borderRadius: `50%`,
                        background: `#f4b942`,
                        flexShrink: 0,
                      },
                    }),
                    (0, f.jsx)(E, {
                      style: { fontSize: 14, color: `#e2e8f0` },
                      children: e,
                    }),
                  ],
                },
                t,
              ),
            ),
          }),
        ],
      }),
      (0, f.jsxs)(se, {
        children: [
          (0, f.jsx)(ue, { children: `Eat This` }),
          (0, f.jsx)(E, {
            style: { marginTop: 8, color: `#e2e8f0` },
            children: e.eat,
          }),
        ],
      }),
      (0, f.jsxs)(`div`, {
        style: {
          background: `rgba(244,185,66,0.08)`,
          border: `1px solid rgba(244,185,66,0.25)`,
          borderRadius: 12,
          padding: 16,
        },
        children: [
          (0, f.jsx)(T, { style: { color: `#f4b942` }, children: `Local Tip` }),
          (0, f.jsx)(E, {
            style: { marginTop: 8, color: `#fef3c7` },
            children: e.tip,
          }),
        ],
      }),
    ],
  });
}
function Se({ group: e, navigate: t }) {
  let n = re.filter((t) => t.group === e.id),
    r = n.reduce(
      (e, t) => ((e[t.matchday] = e[t.matchday] || []).push(t), e),
      {},
    );
  return (0, f.jsxs)(`div`, {
    style: {
      padding: `20px 16px`,
      display: `flex`,
      flexDirection: `column`,
      gap: 16,
    },
    children: [
      (0, f.jsxs)(`div`, {
        style: {
          background: `linear-gradient(135deg,rgba(244,185,66,0.12) 0%,#0d1525 100%)`,
          border: `1px solid rgba(244,185,66,0.3)`,
          borderRadius: 16,
          padding: 20,
        },
        children: [
          (0, f.jsx)(T, { children: `FIFA World Cup 2026` }),
          (0, f.jsxs)(le, {
            style: { fontSize: 52, marginTop: 4 },
            children: [`GROUP `, e.id],
          }),
          (0, f.jsxs)(E, {
            children: [e.teams.length, ` teams · `, n.length, ` fixtures`],
          }),
        ],
      }),
      (0, f.jsxs)(`div`, {
        children: [
          (0, f.jsx)(T, { style: { marginBottom: 8 }, children: `Teams` }),
          (0, f.jsx)(`div`, {
            style: { display: `flex`, flexDirection: `column`, gap: 8 },
            children: e.teams.map((e) => {
              let n = w(e);
              if (!n) return null;
              let r = h(n.confederation);
              return (0, f.jsxs)(
                se,
                {
                  onClick: () => t(`team`, e),
                  style: {
                    cursor: `pointer`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 12,
                  },
                  children: [
                    (0, f.jsx)(`p`, {
                      style: { fontSize: 28 },
                      children: n.flag,
                    }),
                    (0, f.jsxs)(`div`, {
                      style: { flex: 1 },
                      children: [
                        (0, f.jsx)(`p`, {
                          style: {
                            fontFamily: `Bebas Neue, sans-serif`,
                            fontSize: 20,
                            color: `#fff`,
                            letterSpacing: `0.03em`,
                          },
                          children: n.name,
                        }),
                        (0, f.jsxs)(`p`, {
                          style: {
                            fontFamily: `Barlow, sans-serif`,
                            fontSize: 12,
                            color: `#4a5568`,
                          },
                          children: [`Rank #`, n.rank, ` · `, n.coach],
                        }),
                      ],
                    }),
                    (0, f.jsx)(ce, {
                      label: n.confederation,
                      color: r,
                      bg: `${r}22`,
                    }),
                  ],
                },
                e,
              );
            }),
          }),
        ],
      }),
      Object.entries(r).map(([e, n]) =>
        (0, f.jsxs)(
          `div`,
          {
            children: [
              (0, f.jsxs)(T, {
                style: { marginBottom: 8 },
                children: [`Matchday `, e],
              }),
              (0, f.jsx)(`div`, {
                style: { display: `flex`, flexDirection: `column`, gap: 6 },
                children: n.map((e) =>
                  (0, f.jsx)(me, { fixture: e, navigate: t }, e.id),
                ),
              }),
            ],
          },
          e,
        ),
      ),
    ],
  });
}
function Ce({ tab: e, setTab: t }) {
  return (0, f.jsx)(`div`, {
    style: {
      position: `fixed`,
      bottom: 0,
      left: 0,
      right: 0,
      background: `rgba(6,9,15,0.97)`,
      backdropFilter: `blur(20px)`,
      borderTop: `1px solid rgba(255,255,255,0.08)`,
      display: `flex`,
      zIndex: 100,
    },
    children: [
      { id: `home`, icon: `🏠`, label: `Home` },
      { id: `search`, icon: `🔍`, label: `Search` },
      { id: `teams`, icon: `⚽`, label: `Teams` },
      { id: `players`, icon: `⭐`, label: `Players` },
      { id: `cities`, icon: `🏟️`, label: `Cities` },
    ].map((n) =>
      (0, f.jsxs)(
        `button`,
        {
          onClick: () => t(n.id),
          style: {
            flex: 1,
            background: `none`,
            border: `none`,
            padding: `10px 0 12px`,
            cursor: `pointer`,
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
            gap: 3,
          },
          children: [
            (0, f.jsx)(`span`, {
              style: { fontSize: 18, opacity: e === n.id ? 1 : 0.4 },
              children: n.icon,
            }),
            (0, f.jsx)(`span`, {
              style: {
                fontFamily: `Barlow, sans-serif`,
                fontSize: 10,
                fontWeight: e === n.id ? 700 : 500,
                color: e === n.id ? `#f4b942` : `#4a5568`,
                letterSpacing: `0.05em`,
                textTransform: `uppercase`,
              },
              children: n.label,
            }),
          ],
        },
        n.id,
      ),
    ),
  });
}
function we({ navigate: e }) {
  let [t, n] = (0, l.useState)(`All`),
    r = [
      { id: `All`, label: `All`, color: `#f4b942` },
      { id: `FWD`, label: `⚽ Attack`, color: `#ef4444` },
      { id: `MID`, label: `⚡ Mid`, color: `#22c55e` },
      { id: `DEF`, label: `🛡️ Defence`, color: `#3b82f6` },
      { id: `GK`, label: `🧤 GK`, color: `#f59e0b` },
    ],
    i = [`Forward`, `Winger`, `Attacking Mid`, `Forward/Mid`],
    a = [`Midfielder`, `Midfielder/Def`],
    o = [`Centre-Back`, `Left Back`, `Right Back`, `Defender`],
    s = [`Goalkeeper`],
    c = y
      .filter((e) =>
        t === `All`
          ? !0
          : t === `FWD`
            ? i.includes(e.pos)
            : t === `MID`
              ? a.includes(e.pos)
              : t === `DEF`
                ? o.includes(e.pos)
                : t === `GK`
                  ? s.includes(e.pos)
                  : !0,
      )
      .sort((e, t) => C(t).ov - C(e).ov),
    u = r.find((e) => e.id === t);
  return (0, f.jsxs)(`div`, {
    style: {
      padding: `20px 16px`,
      display: `flex`,
      flexDirection: `column`,
      gap: 16,
    },
    children: [
      (0, f.jsxs)(`div`, {
        children: [
          (0, f.jsx)(le, { children: `Players` }),
          (0, f.jsxs)(E, {
            style: { marginTop: 4 },
            children: [y.length, ` profiles · rated & ranked`],
          }),
        ],
      }),
      (0, f.jsx)(ge, { navigate: e }),
      (0, f.jsx)(`div`, {
        style: {
          display: `flex`,
          gap: 8,
          overflowX: `auto`,
          paddingBottom: 4,
          WebkitOverflowScrolling: `touch`,
          scrollbarWidth: `none`,
        },
        children: r.map((e) =>
          (0, f.jsx)(
            `button`,
            {
              onClick: () => n(e.id),
              style: {
                flexShrink: 0,
                padding: `7px 14px`,
                borderRadius: 20,
                fontFamily: `Barlow, sans-serif`,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: `0.06em`,
                textTransform: `uppercase`,
                cursor: `pointer`,
                background: t === e.id ? e.color : `rgba(255,255,255,0.06)`,
                color: t === e.id ? `#000` : `#6b7a99`,
                border: t === e.id ? `none` : `1px solid rgba(255,255,255,0.1)`,
                transition: `all .15s`,
              },
              children: e.label,
            },
            e.id,
          ),
        ),
      }),
      (0, f.jsxs)(T, {
        style: { color: u?.color },
        children: [
          c.length,
          ` players`,
          t === `All` ? `` : ` · ${t}`,
          ` · sorted by rating`,
        ],
      }),
      (0, f.jsx)(`div`, {
        style: { display: `flex`, flexDirection: `column`, gap: 8 },
        children: c.map((t, n) =>
          (0, f.jsx)(he, { player: t, onClick: () => e(`player`, t.id) }, t.id),
        ),
      }),
    ],
  });
}
function Te() {
  let [e, t] = (0, l.useState)(`home`),
    [n, r] = (0, l.useState)([]),
    [i, a] = (0, l.useState)(``),
    [o, s] = (0, l.useState)(() => {
      try {
        return localStorage.getItem(`wc2026_fav`) || null;
      } catch {
        return null;
      }
    }),
    c = (e, t) => r((n) => [...n, { type: e, id: t }]),
    u = () => r((e) => e.slice(0, -1)),
    d = (e) => {
      (r([]), t(e));
    },
    h = (e) => {
      let t = o === e ? null : e;
      s(t);
      try {
        t
          ? localStorage.setItem(`wc2026_fav`, t)
          : localStorage.removeItem(`wc2026_fav`);
      } catch {}
    },
    g = n.length > 0 ? n[n.length - 1] : null,
    b = (0, l.useMemo)(() => {
      if (!i || i.length < 2) return [];
      let e = i.toLowerCase(),
        t = y
          .filter(
            (t) =>
              t.name.toLowerCase().includes(e) ||
              t.club?.toLowerCase().includes(e) ||
              t.pos?.toLowerCase().includes(e),
          )
          .slice(0, 8)
          .map((e) => ({ ...e, _t: `player` })),
        n = v
          .filter(
            (t) =>
              t.name.toLowerCase().includes(e) ||
              t.coach?.toLowerCase().includes(e) ||
              t.nickname?.toLowerCase().includes(e),
          )
          .slice(0, 6)
          .map((e) => ({ ...e, _t: `team` })),
        r = _.filter(
          (t) =>
            t.name.toLowerCase().includes(e) ||
            t.stadium?.toLowerCase().includes(e) ||
            t.country?.toLowerCase().includes(e),
        )
          .slice(0, 4)
          .map((e) => ({ ...e, _t: `city` }));
      return [...t, ...n, ...r];
    }, [i]);
  return (0, f.jsxs)(`div`, {
    style: {
      background: `#06090f`,
      minHeight: `100vh`,
      color: `#fff`,
      fontFamily: `Barlow, sans-serif`,
      paddingBottom: 70,
    },
    children: [
      (0, f.jsx)(`style`, { children: p }),
      (0, f.jsx)(`div`, {
        style: {
          position: `sticky`,
          top: 0,
          zIndex: 50,
          background: `rgba(6,9,15,0.96)`,
          backdropFilter: `blur(20px)`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          padding: `12px 16px`,
          display: `flex`,
          alignItems: `center`,
          gap: 12,
        },
        children: g
          ? (0, f.jsx)(fe, { onClick: u })
          : (0, f.jsxs)(`div`, {
              style: { display: `flex`, alignItems: `baseline`, gap: 8 },
              children: [
                (0, f.jsx)(`span`, {
                  style: {
                    fontFamily: `Bebas Neue, sans-serif`,
                    fontSize: 22,
                    color: `#f4b942`,
                    letterSpacing: `0.05em`,
                  },
                  children: `FIFA`,
                }),
                (0, f.jsx)(`span`, {
                  style: {
                    fontFamily: `Bebas Neue, sans-serif`,
                    fontSize: 16,
                    color: `#fff`,
                    letterSpacing: `0.05em`,
                  },
                  children: `World Cup 2026`,
                }),
              ],
            }),
      }),
      g &&
        (() => {
          if (!g) return null;
          let { type: e, id: t } = g;
          if (e === `player`) {
            let e = y.find((e) => e.id === t);
            return e ? (0, f.jsx)(_e, { player: e, navigate: c }) : null;
          }
          if (e === `team`) {
            let e = v.find((e) => e.id === t);
            return e
              ? (0, f.jsx)(ye, {
                  team: e,
                  navigate: c,
                  favTeam: o,
                  onToggleFav: h,
                })
              : null;
          }
          if (e === `city`) {
            let e = _.find((e) => e.id === t);
            return e ? (0, f.jsx)(xe, { city: e }) : null;
          }
          if (e === `group`) {
            let e = ne.find((e) => e.id === t);
            return e ? (0, f.jsx)(Se, { group: e, navigate: c }) : null;
          }
          return null;
        })(),
      !g &&
        (0, f.jsxs)(f.Fragment, {
          children: [
            e === `home` &&
              (0, f.jsx)(D, { navigate: c, favTeam: o, onToggleFav: h }),
            e === `search` &&
              (0, f.jsxs)(`div`, {
                style: { padding: `20px 16px` },
                children: [
                  (0, f.jsx)(le, { children: `Find Anything` }),
                  (0, f.jsx)(E, {
                    style: { marginBottom: 16, marginTop: 4 },
                    children: `Search players, teams, coaches, stadiums…`,
                  }),
                  (0, f.jsx)(`input`, {
                    value: i,
                    onChange: (e) => a(e.target.value),
                    placeholder: `e.g. Bellingham, Japan, Dallas…`,
                    style: {
                      width: `100%`,
                      background: `#0d1525`,
                      border: `1px solid rgba(255,255,255,0.1)`,
                      borderRadius: 12,
                      padding: `14px 16px`,
                      color: `#fff`,
                      fontSize: 15,
                      fontFamily: `Barlow, sans-serif`,
                      outline: `none`,
                      boxSizing: `border-box`,
                    },
                    onFocus: (e) => (e.target.style.borderColor = `#f4b942`),
                    onBlur: (e) =>
                      (e.target.style.borderColor = `rgba(255,255,255,0.1)`),
                  }),
                  i.length > 1 &&
                    (0, f.jsxs)(`div`, {
                      style: { marginTop: 16 },
                      children: [
                        b.length === 0 &&
                          (0, f.jsxs)(E, {
                            style: { color: `#4a5568` },
                            children: [`No results for "`, i, `"`],
                          }),
                        b.map((e) =>
                          e._t === `player`
                            ? (0, f.jsx)(
                                `div`,
                                {
                                  style: { marginBottom: 8 },
                                  children: (0, f.jsx)(he, {
                                    player: e,
                                    onClick: () => c(`player`, e.id),
                                  }),
                                },
                                e.id,
                              )
                            : e._t === `team`
                              ? (0, f.jsx)(
                                  `div`,
                                  {
                                    style: { marginBottom: 8 },
                                    children: (0, f.jsx)(ve, {
                                      team: e,
                                      onClick: () => c(`team`, e.id),
                                    }),
                                  },
                                  e.id,
                                )
                              : e._t === `city`
                                ? (0, f.jsx)(
                                    `div`,
                                    {
                                      style: { marginBottom: 8 },
                                      children: (0, f.jsx)(be, {
                                        city: e,
                                        onClick: () => c(`city`, e.id),
                                      }),
                                    },
                                    e.id,
                                  )
                                : null,
                        ),
                      ],
                    }),
                  !i &&
                    (0, f.jsxs)(`div`, {
                      style: { marginTop: 24 },
                      children: [
                        (0, f.jsx)(T, {
                          style: { marginBottom: 12 },
                          children: `Quick Access`,
                        }),
                        (0, f.jsx)(`div`, {
                          style: {
                            display: `grid`,
                            gridTemplateColumns: `1fr 1fr`,
                            gap: 10,
                          },
                          children: [
                            {
                              label: `🇦🇷 Argentina`,
                              fn: () => c(`team`, `argentina`),
                            },
                            {
                              label: `🇫🇷 France`,
                              fn: () => c(`team`, `france`),
                            },
                            {
                              label: `⭐ Messi`,
                              fn: () => c(`player`, `messi`),
                            },
                            {
                              label: `⚡ Bellingham`,
                              fn: () => c(`player`, `bellingham`),
                            },
                            {
                              label: `🗽 NYC Final`,
                              fn: () => c(`city`, `new-york`),
                            },
                            { label: `📋 Group A`, fn: () => c(`group`, `A`) },
                          ].map(({ label: e, fn: t }) =>
                            (0, f.jsx)(
                              `button`,
                              {
                                onClick: t,
                                style: {
                                  background: `#0d1525`,
                                  border: `1px solid rgba(255,255,255,0.08)`,
                                  borderRadius: 10,
                                  padding: `12px`,
                                  color: `#e2e8f0`,
                                  fontFamily: `Barlow, sans-serif`,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: `pointer`,
                                  textAlign: `left`,
                                },
                                onMouseEnter: (e) =>
                                  (e.currentTarget.style.borderColor = `#f4b942`),
                                onMouseLeave: (e) =>
                                  (e.currentTarget.style.borderColor = `rgba(255,255,255,0.08)`),
                                children: e,
                              },
                              e,
                            ),
                          ),
                        }),
                      ],
                    }),
                ],
              }),
            e === `teams` &&
              (0, f.jsxs)(`div`, {
                style: { padding: `20px 16px` },
                children: [
                  (0, f.jsx)(le, { children: `48 Teams` }),
                  (0, f.jsx)(E, {
                    style: { marginBottom: 16, marginTop: 4 },
                    children: `All nations competing at USA · Mexico · Canada`,
                  }),
                  Object.entries(m).map(([e, t]) => {
                    let n = v.filter((t) => t.confederation === e);
                    return (0, f.jsxs)(
                      `div`,
                      {
                        style: { marginBottom: 24 },
                        children: [
                          (0, f.jsxs)(`div`, {
                            style: {
                              display: `flex`,
                              alignItems: `center`,
                              gap: 10,
                              marginBottom: 10,
                            },
                            children: [
                              (0, f.jsx)(`div`, {
                                style: {
                                  flex: 1,
                                  height: 1,
                                  background: `${t.color}30`,
                                },
                              }),
                              (0, f.jsx)(ce, {
                                label: e,
                                color: t.color,
                                bg: t.bg,
                              }),
                              (0, f.jsx)(`div`, {
                                style: {
                                  flex: 1,
                                  height: 1,
                                  background: `${t.color}30`,
                                },
                              }),
                            ],
                          }),
                          (0, f.jsx)(`div`, {
                            style: {
                              display: `flex`,
                              flexDirection: `column`,
                              gap: 8,
                            },
                            children: n.map((e) =>
                              (0, f.jsx)(
                                ve,
                                { team: e, onClick: () => c(`team`, e.id) },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      },
                      e,
                    );
                  }),
                ],
              }),
            e === `players` && (0, f.jsx)(we, { navigate: c }),
            e === `cities` &&
              (0, f.jsxs)(`div`, {
                style: { padding: `20px 16px` },
                children: [
                  (0, f.jsx)(le, { children: `Host Cities` }),
                  (0, f.jsx)(E, {
                    style: { marginBottom: 16, marginTop: 4 },
                    children: `16 venues across USA · Mexico · Canada`,
                  }),
                  [`Mexico`, `Canada`, `USA`].map((e) => {
                    let t = _.filter((t) => t.country === e);
                    return (0, f.jsxs)(
                      `div`,
                      {
                        style: { marginBottom: 24 },
                        children: [
                          (0, f.jsxs)(T, {
                            style: { marginBottom: 10 },
                            children: [
                              t[0]?.flag,
                              ` `,
                              e,
                              ` · `,
                              t.length,
                              ` venues`,
                            ],
                          }),
                          (0, f.jsx)(`div`, {
                            style: {
                              display: `flex`,
                              flexDirection: `column`,
                              gap: 8,
                            },
                            children: t.map((e) =>
                              (0, f.jsx)(
                                be,
                                { city: e, onClick: () => c(`city`, e.id) },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      },
                      e,
                    );
                  }),
                ],
              }),
          ],
        }),
      (0, f.jsx)(Ce, { tab: e, setTab: d }),
    ],
  });
}

export { Te };
