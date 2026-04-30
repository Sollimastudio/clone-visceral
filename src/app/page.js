"use client";
import { useState } from "react";
import { UploadCloud, Zap, Shield, Sparkles, AlertCircle } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !file) return;
    
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const formData = new FormData();
      if (input.trim()) formData.append("input", input);
      if (file) formData.append("file", file);

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao processar conteúdo visceral.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.tagline}>Inteligência Estratégica & Narrativa</span>
        <h1 className={styles.title}>O Clone Visceral</h1>
        <p className={styles.subtitle}>
          A máquina por trás da voz. Cole links, arquivos ou insights e deixe que o algoritmo extraia o que há de real, nu e cortante.
        </p>
        <div className={styles.divider}></div>
      </header>
      
      <section className={styles.inputSection}>
        <textarea 
          className={styles.textarea}
          placeholder="URL de artigos, transcrições de vídeos ou suas ideias brutas..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className={styles.actions}>
          <label className={styles.fileLabel}>
            <UploadCloud size={20} />
            {file ? "Trocar Arquivo" : "Anexar PDF / Texto"}
            <input type="file" className={styles.fileInput} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.txt,.md" />
          </label>
          <button 
            className={styles.button} 
            onClick={handleSubmit}
            disabled={isLoading || (!input.trim() && !file)}
          >
            {isLoading ? "Acessando o Caos..." : "Extrair Essência"}
          </button>
        </div>
        {file && <span className={styles.fileName}>Anexado: {file.name}</span>}
      </section>

      {error && (
        <div className={styles.errorPanel} style={{ color: '#ff4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {result && (
        <section className={styles.outputSection}>
          <div className={styles.panel}>
            <h3><Sparkles size={18} /> [ PROMPT DE DIREÇÃO ]</h3>
            <div className={styles.panelContent}>{result.directionPrompt}</div>
          </div>
          <div className={styles.panel}>
            <h3><Zap size={18} /> [ ROTEIRO DO CLONE ]</h3>
            <div className={styles.panelContent}>{result.script}</div>
          </div>
        </section>
      )}
    </main>
  );
}
