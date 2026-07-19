import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SearchResponse, SearchResult } from './types';
import { ProductCard } from './components/ProductCard';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setHasSearched(true);

    try {
      const res = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to search');
      }

      const data: SearchResponse = await res.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload (.json or .csv)');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('dataset', file);

    try {
      const res = await fetch(`http://localhost:3000/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to upload dataset');
      }

      const data = await res.json();
      setSuccess(data.message || `Successfully uploaded and indexed ${data.count} products.`);
      setFile(null);
      // Reset search state
      setResults([]);
      setHasSearched(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI Product Search</h1>
        <p>A simple product search engine and indexing tool.</p>
      </header>

      <main>
        {/* Upload Section */}
        <section className="upload-section">
          <h2>Upload Dataset (Testing Purpose)</h2>
          <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>
            By default, the server loads a minimal dataset (5 items) on startup. <br/>
            You can use this upload feature for testing to dynamically swap the dataset on the fly. 
            There are two sample files <strong>(sample-dataset.csv and sample-dataset.json)</strong> located in the root directory that you can upload here.
          </p>
          <form onSubmit={handleUpload} className="upload-form" style={{ marginTop: '0.5rem' }}>
            <input 
              type="file" 
              accept=".json,.csv" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button type="submit" disabled={uploading || !file}>
              {uploading ? 'Processing...' : 'Upload & Reindex'}
            </button>
          </form>
        </section>

        {/* Status Messages */}
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {/* Search Section */}
        <section className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products (e.g. gaming keyboard under 5000)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </section>

        {/* Results */}
        <section>
          {loading && <div className="message info">Searching for best matches...</div>}

          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="message info">No results found for "{query}".</div>
          )}

          {!loading && results.length > 0 && (
            <div className="results-grid">
              {results.map((product, index) => (
                <ProductCard key={product.id || index} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
