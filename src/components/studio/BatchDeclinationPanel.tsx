import React, { useState, useRef, useCallback } from 'react';
import type { GeneratedImage, FranchiseData, Overlay, LogoOverlay, TextOverlay } from '../../types';
import { compositeImageWithOverlays } from '../../services/compositeImage';
import { deepCloneOverlays } from '../../utils';

interface Props { masterImages: GeneratedImage[]; }

const uid = () => `fr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

function parseCSV(text: string): FranchiseData[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const parseRow = (row: string): string[] => {
    const r: string[] = []; let cur = '', inQ = false;
    for (const ch of row) {
      if (ch === '"') { inQ = !inQ; continue; }
      if ((ch === ',' || ch === ';') && !inQ) { r.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    } r.push(cur.trim()); return r;
  };
  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const map: Record<string, keyof Omit<FranchiseData, 'id'>> = {};
  const m: [string[], keyof Omit<FranchiseData, 'id'>][] = [
    [['name','franchise_name','nom','franchise','enseigne'], 'name'],
    [['city','ville','location','localisation'], 'city'],
    [['text_line_1','text1','texte_1','texte1','titre','title','headline','slogan'], 'textLine1'],
    [['text_line_2','text2','texte_2','texte2','sous_titre','subtitle','description'], 'textLine2'],
    [['logo_url','logo','logo_src'], 'logoUrl'],
    [['accent_color','color','couleur','banner_color','couleur_banniere'], 'accentColor'],
  ];
  for (const h of headers) for (const [a, f] of m) if (a.includes(h)) { map[h] = f; break; }
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const v = parseRow(line);
    const f: FranchiseData = { id: uid(), name: '', city: '', textLine1: '', textLine2: '', logoUrl: '', accentColor: '' };
    headers.forEach((h, i) => { const field = map[h]; if (field && v[i]) (f as any)[field] = v[i]; });
    if (!f.name && v[0]) f.name = v[0];
    if (!f.city && v[1]) f.city = v[1];
    if (!f.textLine1 && v[2]) f.textLine1 = v[2];
    return f;
  }).filter(f => f.name);
}

function applyFranchiseToOverlays(base: Overlay[], fr: FranchiseData): Overlay[] {
  const c = deepCloneOverlays(base);
  const logos = c.filter((o): o is LogoOverlay => o.type === 'logo');
  const texts = c.filter((o): o is TextOverlay => o.type === 'text');
  if (fr.logoUrl && logos.length > 0) logos[0].url = fr.logoUrl;
  if (texts.length > 0 && fr.textLine1) {
    texts[0].text = fr.textLine1;
    if (fr.accentColor && texts[0].bannerEnabled) texts[0].bannerColorHex = fr.accentColor;
  }
  if (texts.length > 1 && fr.textLine2) {
    texts[1].text = fr.textLine2;
    if (fr.accentColor && texts[1].bannerEnabled) texts[1].bannerColorHex = fr.accentColor;
  }
  return c;
}

type BatchResult = { franchise: FranchiseData; images: { label: string; blobUrl: string; filename: string }[] };

export const BatchDeclinationPanel: React.FC<Props> = ({ masterImages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [franchises, setFranchises] = useState<FranchiseData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [results, setResults] = useState<BatchResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCSV(reader.result as string);
      if (parsed.length === 0) { alert('Aucune franchise trouvée. Colonnes attendues: name, city, text_line_1, text_line_2, logo_url, accent_color'); return; }
      setFranchises(prev => [...prev, ...parsed]); setResults([]);
    };
    reader.readAsText(file); e.target.value = '';
  };

  const addFranchise = () => setFranchises(prev => [...prev, { id: uid(), name: '', city: '', textLine1: '', textLine2: '', logoUrl: '', accentColor: '' }]);

  const runBatch = useCallback(async () => {
    const valid = franchises.filter(f => f.name.trim());
    if (valid.length === 0 || masterImages.length === 0) return;
    setIsProcessing(true); setResults([]);
    const total = valid.length * masterImages.length; let current = 0;
    const batch: BatchResult[] = [];
    for (const fr of valid) {
      const imgs: BatchResult['images'] = [];
      for (const mi of masterImages) {
        current++;
        setProgress({ current, total, label: `${fr.name} — ${mi.label}` });
        try {
          const overlays = applyFranchiseToOverlays(mi.overlays, fr);
          const blobUrl = await compositeImageWithOverlays(mi.url, overlays);
          const safeName = fr.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
          imgs.push({ label: mi.label, blobUrl, filename: `${safeName}_${mi.id}.png` });
        } catch (err) { console.warn(`Batch error ${fr.name}/${mi.label}:`, err); }
      }
      batch.push({ franchise: fr, images: imgs });
      setResults([...batch]);
    }
    setIsProcessing(false); setProgress(null);
  }, [franchises, masterImages]);

  const exportZIP = useCallback(async () => {
    if (results.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: results.length, label: 'Création du ZIP...' });
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < results.length; i++) {
        const { franchise, images } = results[i];
        const safeName = franchise.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
        const folder = zip.folder(safeName)!;
        setProgress({ current: i + 1, total: results.length, label: `ZIP: ${franchise.name}...` });
        for (const img of images) {
          const resp = await fetch(img.blobUrl); const blob = await resp.blob();
          folder.file(img.filename, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a'); a.href = url;
      a.download = `mediapost_batch_${franchises.length}_franchises.zip`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch { alert('Erreur lors de la création du ZIP.'); }
    finally { setIsProcessing(false); setProgress(null); }
  }, [results, franchises.length]);

  if (masterImages.length === 0) return null;
  const validCount = franchises.filter(f => f.name.trim()).length;
  const totalVisuals = results.reduce((s, r) => s + r.images.length, 0);

  return (
    <div className="mt-6">
      {/* Toggle header */}
      <button onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
          isOpen ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20' : 'bg-white text-gray-800 border border-gray-200 hover:shadow-lg'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOpen ? 'bg-white/10' : 'bg-brand-blue/10'}`}>
            <svg className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-brand-blue'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-1.5 3 1.5-3 1.5-3-1.5z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">Déclinaison en masse</span>
            <span className={`text-[11px] ${isOpen ? 'text-gray-400' : 'text-gray-500'}`}>
              Dupliquer les {masterImages.length} gabarits pour chaque franchise
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {franchises.length > 0 && (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isOpen ? 'bg-white/20' : 'bg-brand-blue/10 text-brand-blue'}`}>
              {franchises.length} franchise{franchises.length > 1 ? 's' : ''}
            </span>
          )}
          {totalVisuals > 0 && (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isOpen ? 'bg-green-500/30 text-green-200' : 'bg-green-100 text-green-700'}`}>
              {totalVisuals} visuels
            </span>
          )}
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[8000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-4">

          {/* Franchise input */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex-1">Franchises locales</h3>
              <button onClick={() => fileRef.current?.click()}
                className="px-3 py-2 bg-brand-blue/5 text-brand-blue text-xs font-semibold rounded-lg hover:bg-brand-blue/10 border border-brand-blue/10 transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import CSV
              </button>
              <button onClick={addFranchise}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </button>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleCSV} />
            </div>

            {franchises.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Importez un CSV ou ajoutez des franchises manuellement</p>
                <p className="text-[10px] text-gray-400 font-mono">Colonnes : name, city, text_line_1, text_line_2, logo_url, accent_color</p>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="grid grid-cols-12 gap-1.5 pb-1.5 border-b border-gray-200 mb-1">
                  <span className="col-span-1 text-[9px] font-bold text-gray-400 uppercase text-center">#</span>
                  <span className="col-span-2 text-[9px] font-bold text-gray-400 uppercase">Nom</span>
                  <span className="col-span-2 text-[9px] font-bold text-gray-400 uppercase">Ville</span>
                  <span className="col-span-3 text-[9px] font-bold text-gray-400 uppercase">Texte 1</span>
                  <span className="col-span-2 text-[9px] font-bold text-gray-400 uppercase">Texte 2</span>
                  <span className="col-span-1 text-[9px] font-bold text-gray-400 uppercase">Coul.</span>
                  <span className="col-span-1" />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {franchises.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-12 gap-1.5 items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="col-span-1 text-[10px] text-gray-400 text-center tabular-nums">{i + 1}</span>
                      <input className="col-span-2 input-field text-xs py-1" placeholder="Nom" value={f.name}
                        onChange={(e) => setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, name: e.target.value } : x))} />
                      <input className="col-span-2 input-field text-xs py-1" placeholder="Ville" value={f.city}
                        onChange={(e) => setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, city: e.target.value } : x))} />
                      <input className="col-span-3 input-field text-xs py-1" placeholder="Texte principal" value={f.textLine1}
                        onChange={(e) => setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, textLine1: e.target.value } : x))} />
                      <input className="col-span-2 input-field text-xs py-1" placeholder="Texte secondaire" value={f.textLine2}
                        onChange={(e) => setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, textLine2: e.target.value } : x))} />
                      <div className="col-span-1 relative">
                        <input type="color" value={f.accentColor || '#E9041E'}
                          onChange={(e) => setFranchises(prev => prev.map(x => x.id === f.id ? { ...x, accentColor: e.target.value } : x))}
                          className="w-6 h-6 rounded border border-gray-200 cursor-pointer" />
                      </div>
                      <button onClick={() => setFranchises(prev => prev.filter(x => x.id !== f.id))}
                        className="col-span-1 w-6 h-6 mx-auto rounded bg-red-50 hover:bg-red-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {validCount} franchise{validCount > 1 ? 's' : ''} → {validCount * masterImages.length} visuels
                  </span>
                  <button onClick={() => { setFranchises([]); setResults([]); }}
                    className="text-xs text-red-500 hover:text-red-700">Tout supprimer</button>
                </div>
              </div>
            )}
          </div>

          {/* Generate button */}
          {validCount > 0 && (
            <button onClick={runBatch} disabled={isProcessing}
              className="w-full py-4 bg-brand-blue text-white font-bold text-sm rounded-xl hover:bg-brand-blue-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20">
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {progress ? `${progress.current}/${progress.total} — ${progress.label}` : 'Traitement...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Générer {validCount * masterImages.length} visuels ({validCount} × {masterImages.length})
                </>
              )}
            </button>
          )}

          {/* Progress */}
          {isProcessing && progress && (
            <div className="card py-3 px-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{progress.label}</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">{totalVisuals} visuels générés</span>
                <button onClick={exportZIP} disabled={isProcessing}
                  className="px-4 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-600/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger tout (ZIP)
                </button>
              </div>
              {results.map(({ franchise, images }) => (
                <div key={franchise.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: franchise.accentColor || '#E9041E' }} />
                    <span className="text-sm font-bold text-gray-800">{franchise.name}</span>
                    {franchise.city && <span className="text-xs text-gray-400">— {franchise.city}</span>}
                    <span className="text-[10px] text-gray-400 ml-auto">{images.length} visuels</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="group relative rounded-lg overflow-hidden bg-gray-100">
                        <img src={img.blobUrl} alt={`${franchise.name} ${img.label}`} className="w-full h-auto block" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <a href={img.blobUrl} download={img.filename}
                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/90 rounded-lg shadow-sm transition-opacity">
                            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <span className="text-[9px] text-white font-medium">{img.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
