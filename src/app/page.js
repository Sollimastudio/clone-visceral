"use client";
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !file) return;
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      if (input.trim()) formData.append("input", input);
      if (file) formData.append("file", file);

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Erro visceral: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.tagline}>Avatar Digital · Sol Lima</span>
        <h1 className={styles.title}>O Clone Visceral</h1>
        <p className={styles.subtitle}>
          A máquina por trás da voz. Cole um texto, link ou arquivo — e extraia o que há de real, nu e cortante.
        </p>
        <div className={styles.divider}></div>
      </header>
      
      <section className={styles.inputSection}>
        <textarea 
          className={styles.textarea}
          placeholder="Cole textos, URL de artigos ou insights soltos aqui..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className={styles.actions}>
          <label className={styles.fileLabel}>
            <UploadCloud size={20} style={{ marginRight: "8px" }} />
            PDF / Texto
            <input type="file" className={styles.fileInput} onChange={handleFileChange} accept=".pdf,.txt,.md" />
          </label>
          <button 
            className={styles.button} 
            onClick={handleSubmit}
            disabled={isLoading || (!input.trim() && !file)}
          >
            {isLoading ? "Acessando o Caos..." : "Extrair Essência"}
          </button>
        </div>
        {file && <p className={styles.fileName}>Arquivo anexado: {file.name}</p>}
      </section>

      {result && (
        <section className={styles.outputSection}>
          <div className={styles.panel}>
            <h3>[ PROMPT DE DIREÇÃO ]</h3>
            <div className={styles.panelContent}>{result.directionPrompt}</div>
          </div>
          <div className={styles.panel}>
            <h3>[ ROTEIRO DO CLONE ]</h3>
            <div className={styles.panelContent}>{result.script}</div>
          </div>
        </section>
      )}
    </main>
  );
}
