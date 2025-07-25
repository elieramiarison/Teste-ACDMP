import React, { useState } from 'react';

interface DocumentInfo {
    filename: string;
    type: string;
    expirationDate: string | null;
    isValid: boolean;
}

interface AnalysisResponse {
    documents: DocumentInfo[];
    missing: string[];
    expired: DocumentInfo[];
}

const ZipUploader: React.FC = () => {
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fileInput = document.getElementById('zipfile') as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file) {
            alert("Veuillez sélectionner un fichier ZIP.");
            return;
        }

        const formData = new FormData();
        formData.append('zipfile', file);

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:3000/test', {
                method: 'POST',
                body: formData,
            });

            const text = await res.text();

            if (!res.ok) {
                setError(`Erreur HTTP ${res.status}: ${text}`);
            } else {
                try {
                    const json: AnalysisResponse = JSON.parse(text);
                    setResult(json);
                } catch {
                    setError("⚠️ Erreur de format JSON.");
                }
            }
        } catch (err: any) {
            setError("❌ Erreur de connexion: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
            <h1>Uploader un fichier ZIP</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input type="file" id="zipfile" accept=".zip" />
                <br />
                <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
                    Envoyer
                </button>
            </form>

            <h2>Résultat</h2>

            {loading && <p style={{ padding: '0.5rem 1rem', backgroundColor: '#4a87c79c', color: '#fff', border: 'none', borderRadius: '4px' }}>Envoi en cours...</p>}
            {error && <pre style={{ color: 'red' }}>{error}</pre>}

            {result && (
                <div>
                    <h3>Documents détectés</h3>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Nom</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date d'expiration</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Valide</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.documents.map((doc, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.filename}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.type}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{doc.expirationDate ?? '—'}</td>
                                    <td style={{ border: '1px solid #ccc', padding: '8px', color: doc.isValid ? 'green' : 'red' }}>
                                        {doc.isValid ? 'Oui' : 'Non'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {result.missing.length > 0 && (
                        <>
                            <h3>Manquants</h3>
                            <ul>
                                {result.missing.map((doc, idx) => (
                                    <li key={idx}>{doc}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {result.expired.length > 0 && (
                        <>
                            <h3>Expirés</h3>
                            <ul>
                                {result.expired.map((doc, idx) => (
                                    <li key={idx}>
                                        {doc.type} ({doc.expirationDate})
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ZipUploader;
